const { queryOne, execute, NVarChar, SmallInt, TinyInt } = require('../database/db');
const { ROLES, normalizeRole } = require('../config/rbac');
const { generateId } = require('./helpers');

// Is the given billing period locked (closed)?
const isMonthClosed = async (year, month) => {
  const row = await queryOne(
    'SELECT Status FROM dbo.MonthClosures WHERE [Year]=@y AND [Month]=@m',
    {
      y: { type: SmallInt, value: parseInt(year, 10) },
      m: { type: TinyInt, value: parseInt(month, 10) },
    }
  );
  return row?.Status === 'Closed';
};

// Guard a write against a possibly-closed month.
// - Month open        -> { allowed: true }
// - Closed, non-admin -> { allowed: false, closed: true }   (caller returns 423)
// - Closed, admin      -> writes an audit record documenting the correction,
//                         then { allowed: true, override: true, closed: true }
const guardMonthWrite = async ({ user, year, month, ip, module, entityId, action, reason }) => {
  const closed = await isMonthClosed(year, month);
  if (!closed) return { allowed: true, override: false, closed: false };

  const isAdmin = normalizeRole(user?.role) === ROLES.ADMIN;
  if (!isAdmin) return { allowed: false, override: false, closed: true };

  await execute(`
    INSERT INTO dbo.AuditLog
      (Id,UserId,Action,Module,EntityId,PreviousValue,NewValue,Reason,Comments,IpAddress,CreatedAt)
    VALUES (@id,@uid,@action,@module,@eid,'Month Closed','Correction Applied',@reason,@comments,@ip,@now)
  `, {
    id:       { type: NVarChar(36),  value: generateId() },
    uid:      { type: NVarChar(36),  value: user?.id || 'system' },
    action:   { type: NVarChar(50),  value: action || 'CLOSED_MONTH_OVERRIDE' },
    module:   { type: NVarChar(50),  value: module || 'MonthClosures' },
    eid:      { type: NVarChar(36),  value: String(entityId || `${year}-${month}`) },
    reason:   { type: NVarChar(200), value: reason || `Admin correction on closed period ${year}-${month}` },
    comments: { type: NVarChar(500), value: `Authorized admin edit on closed month ${year}-${String(month).padStart(2, '0')}` },
    ip:       { type: NVarChar(50),  value: ip || '' },
    now:      { type: NVarChar(30),  value: new Date().toISOString() },
  });
  return { allowed: true, override: true, closed: true };
};

module.exports = { isMonthClosed, guardMonthWrite };
