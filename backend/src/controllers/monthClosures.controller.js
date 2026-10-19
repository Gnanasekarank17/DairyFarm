const { query, queryOne, execute, NVarChar, SmallInt, TinyInt } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId } = require('../utils/helpers');
const logger = require('../config/logger');

const nowIso = () => new Date().toISOString();

const parsePeriod = (req) => {
  const year = parseInt(req.params.year, 10);
  const month = parseInt(req.params.month, 10);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return null;
  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  return { year, month };
};

// GET /month-closures  (optional ?year=)
const getAll = async (req, res) => {
  try {
    let qStr = 'SELECT * FROM dbo.MonthClosures';
    const params = {};
    if (req.query.year) {
      qStr += ' WHERE [Year]=@y';
      params.y = { type: SmallInt, value: parseInt(req.query.year, 10) };
    }
    qStr += ' ORDER BY [Year] DESC, [Month] DESC';
    const result = await query(qStr, params);
    return success(res, result.recordset);
  } catch (err) {
    logger.error('Get month closures:', err);
    return error(res, 'Failed to fetch month closures');
  }
};

// GET /month-closures/:year/:month  -> status for a single period
const getStatus = async (req, res) => {
  try {
    const period = parsePeriod(req);
    if (!period) return error(res, 'Invalid year or month', 400);
    const row = await queryOne(
      'SELECT * FROM dbo.MonthClosures WHERE [Year]=@y AND [Month]=@m',
      { y: { type: SmallInt, value: period.year }, m: { type: TinyInt, value: period.month } }
    );
    return success(res, {
      year: period.year,
      month: period.month,
      status: row?.Status === 'Closed' ? 'Closed' : 'Open',
      record: row || null,
    });
  } catch (err) {
    logger.error('Get month closure status:', err);
    return error(res, 'Failed to fetch status');
  }
};

// POST /month-closures/:year/:month/close   (billing:manage)
const close = async (req, res) => {
  try {
    const period = parsePeriod(req);
    if (!period) return error(res, 'Invalid year or month', 400);
    const { year, month } = period;

    const existing = await queryOne(
      'SELECT * FROM dbo.MonthClosures WHERE [Year]=@y AND [Month]=@m',
      { y: { type: SmallInt, value: year }, m: { type: TinyInt, value: month } }
    );
    if (existing?.Status === 'Closed') return error(res, 'This month is already closed', 409);

    const now = nowIso();
    const uid = req.user?.id || 'system';
    const notes = req.body?.notes ? String(req.body.notes) : null;

    if (existing) {
      await execute(`
        UPDATE dbo.MonthClosures
        SET Status='Closed', ClosedBy=@uid, ClosedAt=@now, Notes=@notes, UpdatedAt=@now
        WHERE Id=@id
      `, {
        id: { type: NVarChar(36), value: existing.Id },
        uid: { type: NVarChar(36), value: uid },
        now: { type: NVarChar(30), value: now },
        notes: { type: NVarChar(300), value: notes },
      });
    } else {
      await execute(`
        INSERT INTO dbo.MonthClosures ([Id],[Year],[Month],Status,Notes,ClosedBy,ClosedAt,CreatedAt,UpdatedAt)
        VALUES (@id,@y,@m,'Closed',@notes,@uid,@now,@now,@now)
      `, {
        id: { type: NVarChar(36), value: generateId() },
        y: { type: SmallInt, value: year },
        m: { type: TinyInt, value: month },
        notes: { type: NVarChar(300), value: notes },
        uid: { type: NVarChar(36), value: uid },
        now: { type: NVarChar(30), value: now },
      });
    }

    await execute(`
      INSERT INTO dbo.AuditLog (Id,UserId,Action,Module,EntityId,PreviousValue,NewValue,Reason,Comments,IpAddress,CreatedAt)
      VALUES (@id,@uid,'CLOSE_MONTH','MonthClosures',@eid,'Open','Closed',@reason,@comments,@ip,@now)
    `, {
      id: { type: NVarChar(36), value: generateId() },
      uid: { type: NVarChar(36), value: uid },
      eid: { type: NVarChar(36), value: `${year}-${String(month).padStart(2, '0')}` },
      reason: { type: NVarChar(200), value: notes || 'Month closed' },
      comments: { type: NVarChar(500), value: `Billing period ${year}-${String(month).padStart(2, '0')} closed` },
      ip: { type: NVarChar(50), value: req.ip || '' },
      now: { type: NVarChar(30), value: now },
    });

    const record = await queryOne(
      'SELECT * FROM dbo.MonthClosures WHERE [Year]=@y AND [Month]=@m',
      { y: { type: SmallInt, value: year }, m: { type: TinyInt, value: month } }
    );
    return success(res, record, 'Month closed');
  } catch (err) {
    logger.error('Close month:', err);
    return error(res, 'Failed to close month');
  }
};

// POST /month-closures/:year/:month/reopen   (admin only — authorized correction)
const reopen = async (req, res) => {
  try {
    const period = parsePeriod(req);
    if (!period) return error(res, 'Invalid year or month', 400);
    const { year, month } = period;

    const reason = String(req.body?.reason || '').trim();
    if (!reason) return error(res, 'A reason is required to reopen a closed month', 400);

    const existing = await queryOne(
      'SELECT * FROM dbo.MonthClosures WHERE [Year]=@y AND [Month]=@m',
      { y: { type: SmallInt, value: year }, m: { type: TinyInt, value: month } }
    );
    if (!existing || existing.Status !== 'Closed') return error(res, 'This month is not closed', 409);

    const now = nowIso();
    const uid = req.user?.id || 'system';

    await execute(`
      UPDATE dbo.MonthClosures
      SET Status='Open', ReopenedBy=@uid, ReopenedAt=@now, Notes=@notes, UpdatedAt=@now
      WHERE Id=@id
    `, {
      id: { type: NVarChar(36), value: existing.Id },
      uid: { type: NVarChar(36), value: uid },
      now: { type: NVarChar(30), value: now },
      notes: { type: NVarChar(300), value: reason },
    });

    await execute(`
      INSERT INTO dbo.AuditLog (Id,UserId,Action,Module,EntityId,PreviousValue,NewValue,Reason,Comments,IpAddress,CreatedAt)
      VALUES (@id,@uid,'REOPEN_MONTH','MonthClosures',@eid,'Closed','Open',@reason,@comments,@ip,@now)
    `, {
      id: { type: NVarChar(36), value: generateId() },
      uid: { type: NVarChar(36), value: uid },
      eid: { type: NVarChar(36), value: `${year}-${String(month).padStart(2, '0')}` },
      reason: { type: NVarChar(200), value: reason },
      comments: { type: NVarChar(500), value: `Billing period ${year}-${String(month).padStart(2, '0')} reopened by admin` },
      ip: { type: NVarChar(50), value: req.ip || '' },
      now: { type: NVarChar(30), value: now },
    });

    const record = await queryOne(
      'SELECT * FROM dbo.MonthClosures WHERE [Year]=@y AND [Month]=@m',
      { y: { type: SmallInt, value: year }, m: { type: TinyInt, value: month } }
    );
    return success(res, record, 'Month reopened');
  } catch (err) {
    logger.error('Reopen month:', err);
    return error(res, 'Failed to reopen month');
  }
};

module.exports = { getAll, getStatus, close, reopen };
