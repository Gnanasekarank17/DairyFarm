const crypto = require('crypto');
const config = require('../config');
const logger = require('../config/logger');

// OTP policy (§4.2)
const OTP_LENGTH = 6;
const OTP_TTL_SECONDS = 5 * 60;        // code expiry
const RESEND_COOLDOWN_SECONDS = 60;    // minimum gap between sends
const MAX_SENDS_PER_WINDOW = 5;        // sends allowed per window
const SEND_WINDOW_SECONDS = 15 * 60;   // sliding window for sends
const MAX_VERIFY_ATTEMPTS = 5;         // wrong-code attempts before lockout
const VALID_PURPOSES = ['registration', 'login', 'change_mobile'];

const isDevMode = () => config.nodeEnv !== 'production';

const generateCode = () => {
  // Cryptographically-random numeric code, zero-padded.
  const max = 10 ** OTP_LENGTH;
  return String(crypto.randomInt(0, max)).padStart(OTP_LENGTH, '0');
};

// Deterministic salted hash so we never store the plaintext OTP.
const hashCode = (mobile, code) =>
  crypto.createHmac('sha256', config.jwt.secret).update(`${mobile}:${code}`).digest('hex');

const verifyCode = (mobile, code, storedHash) => {
  const candidate = hashCode(mobile, code);
  const a = Buffer.from(candidate);
  const b = Buffer.from(String(storedHash || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const normalizeMobile = (mobile) => String(mobile || '').replace(/\D/g, '');
const isValidMobile = (mobile) => /^\d{10,15}$/.test(mobile);
const normalizePurpose = (p) => (VALID_PURPOSES.includes(String(p || '').trim()) ? String(p).trim() : 'registration');

// Fast2SMS OTP route: DND-exempt, delivers the numeric code. `numbers` must be the 10-digit Indian mobile.
const sendViaFast2Sms = async (mobile, code) => {
  const body = new URLSearchParams({
    route: 'otp',
    variables_values: code,
    numbers: String(mobile).slice(-10),
    flash: '0',
  });
  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: config.sms.fast2smsApiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  let data = {};
  try { data = await res.json(); } catch { /* provider may return a non-JSON error body */ }
  if (!res.ok || data.return === false) {
    throw new Error(`HTTP ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
};

// Pluggable sender: sends via Fast2SMS when FAST2SMS_API_KEY is set; in dev the code is always logged too.
const sendOtpSms = async (mobile, code) => {
  if (isDevMode()) logger.info(`[OTP] Dev mode - code for ${mobile} is ${code}`);

  if (config.sms.fast2smsApiKey) {
    try {
      const data = await sendViaFast2Sms(mobile, code);
      logger.info(`[OTP] Fast2SMS sent to ${mobile} (request_id=${data.request_id || 'n/a'})`);
      return { delivered: true, provider: 'fast2sms', dev: isDevMode() };
    } catch (err) {
      logger.error(`[OTP] Fast2SMS send failed for ${mobile}: ${err.message}`);
      return { delivered: false, provider: 'fast2sms', dev: isDevMode() };
    }
  }

  if (isDevMode()) return { delivered: true, dev: true };
  logger.warn(`[OTP] No SMS provider configured; code for ${mobile} not sent.`);
  return { delivered: false, dev: false };
};

module.exports = {
  OTP_LENGTH, OTP_TTL_SECONDS, RESEND_COOLDOWN_SECONDS, MAX_SENDS_PER_WINDOW,
  SEND_WINDOW_SECONDS, MAX_VERIFY_ATTEMPTS, VALID_PURPOSES,
  isDevMode, generateCode, hashCode, verifyCode, normalizeMobile, isValidMobile, normalizePurpose, sendOtpSms,
};
