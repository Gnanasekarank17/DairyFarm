const { query, queryOne, execute, NVarChar, Int, Bit } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId } = require('../utils/helpers');
const logger = require('../config/logger');
const otp = require('../services/otp.service');

const nowMs = () => Date.now();
const iso = (ms) => new Date(ms).toISOString();

// Shared send logic for request + resend.
const issueOtp = async (req, res) => {
  const mobile = otp.normalizeMobile(req.body.mobile);
  const purpose = otp.normalizePurpose(req.body.purpose);
  if (!otp.isValidMobile(mobile)) return error(res, 'A valid mobile number is required', 400);

  const windowStart = iso(nowMs() - otp.SEND_WINDOW_SECONDS * 1000);

  // Enforce a per-mobile send cooldown and a max-per-window (rate limiting §4.2).
  const recent = (await query(`
    SELECT CreatedAt FROM dbo.OtpVerifications
    WHERE Mobile=@mobile AND Purpose=@purpose AND CreatedAt >= @windowStart
    ORDER BY CreatedAt DESC
  `, {
    mobile: { type: NVarChar(20), value: mobile },
    purpose: { type: NVarChar(30), value: purpose },
    windowStart: { type: NVarChar(30), value: windowStart },
  })).recordset;

  if (recent.length > 0) {
    const lastMs = new Date(recent[0].CreatedAt).getTime();
    const sinceSec = (nowMs() - lastMs) / 1000;
    if (sinceSec < otp.RESEND_COOLDOWN_SECONDS) {
      return error(res, `Please wait ${Math.ceil(otp.RESEND_COOLDOWN_SECONDS - sinceSec)}s before requesting another code`, 429);
    }
  }
  if (recent.length >= otp.MAX_SENDS_PER_WINDOW) {
    return error(res, 'Too many OTP requests. Please try again later.', 429);
  }

  // Invalidate previous unconsumed codes so only the newest is valid.
  await execute(`
    UPDATE dbo.OtpVerifications SET ConsumedAt=@now, UpdatedAt=@now
    WHERE Mobile=@mobile AND Purpose=@purpose AND ConsumedAt IS NULL
  `, {
    mobile: { type: NVarChar(20), value: mobile },
    purpose: { type: NVarChar(30), value: purpose },
    now: { type: NVarChar(30), value: iso(nowMs()) },
  });

  const code = otp.generateCode();
  const id = generateId();
  const createdAt = iso(nowMs());
  const expiresAt = iso(nowMs() + otp.OTP_TTL_SECONDS * 1000);

  await execute(`
    INSERT INTO dbo.OtpVerifications (Id,Mobile,CodeHash,Purpose,ExpiresAt,Attempts,Verified,CreatedAt,UpdatedAt)
    VALUES (@id,@mobile,@hash,@purpose,@expiresAt,0,0,@now,@now)
  `, {
    id: { type: NVarChar(36), value: id },
    mobile: { type: NVarChar(20), value: mobile },
    hash: { type: NVarChar(200), value: otp.hashCode(mobile, code) },
    purpose: { type: NVarChar(30), value: purpose },
    expiresAt: { type: NVarChar(30), value: expiresAt },
    now: { type: NVarChar(30), value: createdAt },
  });

  const delivery = await otp.sendOtpSms(mobile, code);

  const payload = { mobile, purpose, expiresAt, expiresInSeconds: otp.OTP_TTL_SECONDS };
  // In dev mode we surface the code so the flow can be exercised without an SMS gateway.
  if (otp.isDevMode()) payload.devCode = code;
  return success(res, payload, delivery.delivered ? 'OTP sent' : 'OTP generated (delivery not configured)');
};

// POST /auth/otp/request
const requestOtp = async (req, res) => {
  try { return await issueOtp(req, res); }
  catch (err) { logger.error('Request OTP:', err); return error(res, 'Failed to send OTP'); }
};

// POST /auth/otp/resend
const resendOtp = async (req, res) => {
  try { return await issueOtp(req, res); }
  catch (err) { logger.error('Resend OTP:', err); return error(res, 'Failed to resend OTP'); }
};

// POST /auth/otp/verify
const verifyOtp = async (req, res) => {
  try {
    const mobile = otp.normalizeMobile(req.body.mobile);
    const purpose = otp.normalizePurpose(req.body.purpose);
    const code = String(req.body.code || '').trim();
    if (!otp.isValidMobile(mobile)) return error(res, 'A valid mobile number is required', 400);
    if (!code) return error(res, 'Verification code is required', 400);

    const record = await queryOne(`
      SELECT TOP 1 * FROM dbo.OtpVerifications
      WHERE Mobile=@mobile AND Purpose=@purpose AND ConsumedAt IS NULL
      ORDER BY CreatedAt DESC
    `, {
      mobile: { type: NVarChar(20), value: mobile },
      purpose: { type: NVarChar(30), value: purpose },
    });

    if (!record) return error(res, 'No active code. Please request a new OTP.', 400);

    if (new Date(record.ExpiresAt).getTime() < nowMs()) {
      await execute('UPDATE dbo.OtpVerifications SET ConsumedAt=@now, UpdatedAt=@now WHERE Id=@id', {
        id: { type: NVarChar(36), value: record.Id },
        now: { type: NVarChar(30), value: iso(nowMs()) },
      });
      return error(res, 'Code expired. Please request a new OTP.', 400);
    }

    if (record.Attempts >= otp.MAX_VERIFY_ATTEMPTS) {
      await execute('UPDATE dbo.OtpVerifications SET ConsumedAt=@now, UpdatedAt=@now WHERE Id=@id', {
        id: { type: NVarChar(36), value: record.Id },
        now: { type: NVarChar(30), value: iso(nowMs()) },
      });
      return error(res, 'Maximum attempts exceeded. Please request a new OTP.', 429);
    }

    if (!otp.verifyCode(mobile, code, record.CodeHash)) {
      const attempts = record.Attempts + 1;
      await execute('UPDATE dbo.OtpVerifications SET Attempts=@attempts, UpdatedAt=@now WHERE Id=@id', {
        id: { type: NVarChar(36), value: record.Id },
        attempts: { type: Int, value: attempts },
        now: { type: NVarChar(30), value: iso(nowMs()) },
      });
      const remaining = Math.max(0, otp.MAX_VERIFY_ATTEMPTS - attempts);
      return error(res, `Invalid code. ${remaining} attempt(s) remaining.`, 400);
    }

    // Success: mark verified + consumed so it can't be reused.
    await execute('UPDATE dbo.OtpVerifications SET Verified=1, ConsumedAt=@now, UpdatedAt=@now WHERE Id=@id', {
      id: { type: NVarChar(36), value: record.Id },
      now: { type: NVarChar(30), value: iso(nowMs()) },
    });
    return success(res, { mobile, purpose, verified: true }, 'Mobile number verified');
  } catch (err) {
    logger.error('Verify OTP:', err);
    return error(res, 'Failed to verify OTP');
  }
};

// GET /auth/otp/status?mobile=&purpose=
const getStatus = async (req, res) => {
  try {
    const mobile = otp.normalizeMobile(req.query.mobile);
    const purpose = otp.normalizePurpose(req.query.purpose);
    if (!otp.isValidMobile(mobile)) return error(res, 'A valid mobile number is required', 400);
    const verified = await queryOne(`
      SELECT TOP 1 Id FROM dbo.OtpVerifications
      WHERE Mobile=@mobile AND Purpose=@purpose AND Verified=1
      ORDER BY CreatedAt DESC
    `, {
      mobile: { type: NVarChar(20), value: mobile },
      purpose: { type: NVarChar(30), value: purpose },
    });
    return success(res, { mobile, purpose, verified: Boolean(verified) });
  } catch (err) {
    logger.error('OTP status:', err);
    return error(res, 'Failed to fetch status');
  }
};

module.exports = { requestOtp, resendOtp, verifyOtp, getStatus };
