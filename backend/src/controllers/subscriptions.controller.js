const { query, queryOne, execute, NVarChar, Decimal } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const { hasPermission, normalizeRole } = require('../config/rbac');
const logger = require('../config/logger');

const SUBSCRIPTION_STATUSES = [
  'Draft', 'Submitted', 'PendingApproval', 'Approved', 'Rejected',
  'Active', 'Paused', 'Suspended', 'Cancelled', 'Completed',
];
const REASON_REQUIRED = ['Rejected', 'Suspended', 'Cancelled'];

const canAccessCustomer = async (user, customerId) => {
  if (hasPermission(user?.role, 'subscriptions:view')) return true;
  if (normalizeRole(user?.role) !== 'customer') return false;
  const link = await queryOne(
    'SELECT CustomerId FROM dbo.CustomerUserAccess WHERE UserId=@userId AND CustomerId=@customerId',
    { userId: { type: NVarChar(36), value: user.id }, customerId: { type: NVarChar(36), value: customerId } }
  );
  return Boolean(link);
};

// Approximate delivery days in a month from the weekly delivery-day selection.
const daysPerWeek = (deliveryDays) => {
  const raw = String(deliveryDays || 'All').trim();
  if (!raw || raw.toLowerCase() === 'all') return 7;
  const n = raw.split(',').map((s) => s.trim()).filter(Boolean).length;
  return Math.min(Math.max(n, 1), 7);
};
const estimateMonthly = (deliveryDays, total, rate) => {
  const estDays = Math.round((daysPerWeek(deliveryDays) * 30) / 7);
  return Math.round(estDays * total * rate * 100) / 100;
};

const mapSub = (r) => ({
  id: r.Id,
  customerId: r.CustomerId,
  customerName: r.CustomerName,
  milkType: r.MilkType,
  morningQuantity: parseFloat(r.MorningQuantity || 0),
  eveningQuantity: parseFloat(r.EveningQuantity || 0),
  totalQuantity: parseFloat(r.TotalQuantity || 0),
  rate: parseFloat(r.Rate || 0),
  deliveryDays: r.DeliveryDays,
  startDate: r.StartDate,
  status: r.Status,
  estimatedMonthlyAmount: parseFloat(r.EstimatedMonthlyAmount || 0),
  notes: r.Notes || '',
  actionReason: r.ActionReason || '',
  actionBy: r.ActionBy || '',
  actionAt: r.ActionAt || '',
  pauseFrom: r.PauseFrom || '',
  pauseTo: r.PauseTo || '',
  createdBy: r.CreatedBy || '',
  createdAt: r.CreatedAt,
  updatedAt: r.UpdatedAt,
});

const mapHistory = (r) => ({
  id: r.Id,
  subscriptionId: r.SubscriptionId,
  customerId: r.CustomerId,
  milkType: r.MilkType,
  morningQuantity: parseFloat(r.MorningQuantity || 0),
  eveningQuantity: parseFloat(r.EveningQuantity || 0),
  totalQuantity: parseFloat(r.TotalQuantity || 0),
  rate: parseFloat(r.Rate || 0),
  deliveryDays: r.DeliveryDays,
  status: r.Status,
  effectiveFrom: r.EffectiveFrom,
  effectiveTo: r.EffectiveTo,
  changeReason: r.ChangeReason || '',
  createdBy: r.CreatedBy || '',
  createdAt: r.CreatedAt,
});

const fetchRaw = (id) => queryOne(`
  SELECT s.*, c.Name AS CustomerName
  FROM dbo.CustomerSubscriptions s
  JOIN dbo.Customers c ON c.Id = s.CustomerId
  WHERE s.Id=@id
`, { id: { type: NVarChar(36), value: id } });

// Effective-dated snapshot: close the current open record, open a new one.
const recordHistory = async (row, changeReason, createdBy, effectiveFrom) => {
  const from = effectiveFrom || today();
  await execute(
    'UPDATE dbo.SubscriptionHistory SET EffectiveTo=@to WHERE SubscriptionId=@sid AND EffectiveTo IS NULL',
    { to: { type: NVarChar(20), value: from }, sid: { type: NVarChar(36), value: row.Id } }
  );
  await execute(`
    INSERT INTO dbo.SubscriptionHistory
      (Id,SubscriptionId,CustomerId,MilkType,MorningQuantity,EveningQuantity,TotalQuantity,Rate,DeliveryDays,Status,EffectiveFrom,EffectiveTo,ChangeReason,CreatedBy,CreatedAt)
    VALUES(@id,@sid,@cid,@milkType,@mq,@eq,@tq,@rate,@days,@status,@from,NULL,@reason,@by,@now)
  `, {
    id: { type: NVarChar(36), value: generateId() },
    sid: { type: NVarChar(36), value: row.Id },
    cid: { type: NVarChar(36), value: row.CustomerId },
    milkType: { type: NVarChar(50), value: row.MilkType },
    mq: { type: Decimal(6, 2), value: parseFloat(row.MorningQuantity || 0) },
    eq: { type: Decimal(6, 2), value: parseFloat(row.EveningQuantity || 0) },
    tq: { type: Decimal(6, 2), value: parseFloat(row.TotalQuantity || 0) },
    rate: { type: Decimal(10, 2), value: parseFloat(row.Rate || 0) },
    days: { type: NVarChar(50), value: row.DeliveryDays },
    status: { type: NVarChar(20), value: row.Status },
    from: { type: NVarChar(20), value: from },
    reason: { type: NVarChar(300), value: changeReason || null },
    by: { type: NVarChar(36), value: createdBy || null },
    now: { type: NVarChar(30), value: new Date().toISOString() },
  });
};

// GET /subscriptions
const getAll = async (req, res) => {
  try {
    const { status, customerId } = req.query;
    const params = {};
    const filters = [];

    if (hasPermission(req.user?.role, 'subscriptions:view')) {
      if (customerId) {
        filters.push('s.CustomerId=@customerId');
        params.customerId = { type: NVarChar(36), value: customerId };
      }
    } else if (normalizeRole(req.user?.role) === 'customer') {
      filters.push('s.CustomerId IN (SELECT CustomerId FROM dbo.CustomerUserAccess WHERE UserId=@userId)');
      params.userId = { type: NVarChar(36), value: req.user.id };
    } else {
      return error(res, 'Permission denied', 403);
    }

    if (status) {
      filters.push('s.Status=@status');
      params.status = { type: NVarChar(20), value: status };
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const rows = (await query(`
      SELECT s.*, c.Name AS CustomerName
      FROM dbo.CustomerSubscriptions s
      JOIN dbo.Customers c ON c.Id = s.CustomerId
      ${where}
      ORDER BY s.CreatedAt DESC
    `, params)).recordset;

    return success(res, rows.map(mapSub));
  } catch (err) {
    logger.error('Get subscriptions:', err);
    return error(res, 'Failed to fetch subscriptions');
  }
};

// GET /subscriptions/:id
const getById = async (req, res) => {
  try {
    const row = await fetchRaw(req.params.id);
    if (!row) return error(res, 'Subscription not found', 404);
    if (!(await canAccessCustomer(req.user, row.CustomerId))) return error(res, 'Subscription access denied', 403);
    return success(res, mapSub(row));
  } catch (err) {
    logger.error('Get subscription:', err);
    return error(res, 'Failed to fetch subscription');
  }
};

// GET /subscriptions/:id/history
const getHistory = async (req, res) => {
  try {
    const row = await fetchRaw(req.params.id);
    if (!row) return error(res, 'Subscription not found', 404);
    if (!(await canAccessCustomer(req.user, row.CustomerId))) return error(res, 'Subscription access denied', 403);
    const rows = (await query(
      'SELECT * FROM dbo.SubscriptionHistory WHERE SubscriptionId=@id ORDER BY CreatedAt',
      { id: { type: NVarChar(36), value: req.params.id } }
    )).recordset;
    return success(res, rows.map(mapHistory));
  } catch (err) {
    logger.error('Get subscription history:', err);
    return error(res, 'Failed to fetch subscription history');
  }
};

// POST /subscriptions
const create = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);
    const canCreate = role === 'customer'
      || hasPermission(req.user?.role, 'subscriptions:create')
      || hasPermission(req.user?.role, 'subscriptions:manage');
    if (!canCreate) return error(res, 'Permission denied', 403);

    const customerId = req.body.customerId || req.user?.customerIds?.[0];
    const morning = parseFloat(req.body.morningQuantity) || 0;
    const evening = parseFloat(req.body.eveningQuantity) || 0;
    const total = Math.round((morning + evening) * 100) / 100;
    const rate = parseFloat(req.body.rate) || 0;
    const milkType = String(req.body.milkType || 'Cow Milk').trim();
    const deliveryDays = String(req.body.deliveryDays || 'All').trim();
    const startDate = String(req.body.startDate || today()).slice(0, 10);
    const notes = String(req.body.notes || '').trim();

    if (!customerId) return error(res, 'Customer is required', 400);
    if (!(total > 0)) return error(res, 'Total daily quantity must be greater than zero', 400);
    if (!(await canAccessCustomer(req.user, customerId))) return error(res, 'Customer access denied', 403);

    const customer = await queryOne('SELECT Id FROM dbo.Customers WHERE Id=@id AND IsActive=1', {
      id: { type: NVarChar(36), value: customerId },
    });
    if (!customer) return error(res, 'Customer not found', 404);

    const estimated = estimateMonthly(deliveryDays, total, rate);
    const id = generateId();
    const now = new Date().toISOString();

    await execute(`
      INSERT INTO dbo.CustomerSubscriptions
        (Id,CustomerId,MilkType,MorningQuantity,EveningQuantity,TotalQuantity,Rate,DeliveryDays,StartDate,Status,EstimatedMonthlyAmount,Notes,CreatedBy,CreatedAt,UpdatedAt)
      VALUES(@id,@cid,@milkType,@mq,@eq,@tq,@rate,@days,@start,'PendingApproval',@est,@notes,@by,@now,@now)
    `, {
      id: { type: NVarChar(36), value: id },
      cid: { type: NVarChar(36), value: customerId },
      milkType: { type: NVarChar(50), value: milkType },
      mq: { type: Decimal(6, 2), value: morning },
      eq: { type: Decimal(6, 2), value: evening },
      tq: { type: Decimal(6, 2), value: total },
      rate: { type: Decimal(10, 2), value: rate },
      days: { type: NVarChar(50), value: deliveryDays },
      start: { type: NVarChar(20), value: startDate },
      est: { type: Decimal(12, 2), value: estimated },
      notes: { type: NVarChar(500), value: notes },
      by: { type: NVarChar(36), value: req.user?.id || null },
      now: { type: NVarChar(30), value: now },
    });

    const row = await fetchRaw(id);
    await recordHistory(row, 'Subscription request submitted', req.user?.id, startDate);
    return success(res, mapSub(row), 'Subscription request submitted', 201);
  } catch (err) {
    logger.error('Create subscription:', err);
    return error(res, 'Failed to submit subscription');
  }
};

// PATCH /subscriptions/:id/status  (approve / reject / suspend / activate / complete)
const updateStatus = async (req, res) => {
  try {
    if (!hasPermission(req.user?.role, 'subscriptions:manage')) return error(res, 'Permission denied', 403);

    const status = String(req.body.status || '').trim();
    if (!SUBSCRIPTION_STATUSES.includes(status)) {
      return error(res, `Status must be one of: ${SUBSCRIPTION_STATUSES.join(', ')}`, 400);
    }
    const actionReason = String(req.body.actionReason || '').trim();
    if (REASON_REQUIRED.includes(status) && !actionReason) {
      return error(res, `A reason is required to set status to ${status}`, 400);
    }

    const existing = await fetchRaw(req.params.id);
    if (!existing) return error(res, 'Subscription not found', 404);

    await execute(`
      UPDATE dbo.CustomerSubscriptions
      SET Status=@status, ActionReason=@reason, ActionBy=@by, ActionAt=@now, UpdatedAt=@now
      WHERE Id=@id
    `, {
      id: { type: NVarChar(36), value: req.params.id },
      status: { type: NVarChar(20), value: status },
      reason: { type: NVarChar(300), value: actionReason || null },
      by: { type: NVarChar(36), value: req.user?.id || null },
      now: { type: NVarChar(30), value: new Date().toISOString() },
    });

    const row = await fetchRaw(req.params.id);
    await recordHistory(row, actionReason || `Status changed to ${status}`, req.user?.id);
    return success(res, mapSub(row), `Subscription ${status}`);
  } catch (err) {
    logger.error('Update subscription status:', err);
    return error(res, 'Failed to update subscription');
  }
};

// PUT /subscriptions/:id  (amend quantity/rate — records a new effective-dated history row)
const amend = async (req, res) => {
  try {
    const existing = await fetchRaw(req.params.id);
    if (!existing) return error(res, 'Subscription not found', 404);

    const morning = req.body.morningQuantity != null ? parseFloat(req.body.morningQuantity) : parseFloat(existing.MorningQuantity || 0);
    const evening = req.body.eveningQuantity != null ? parseFloat(req.body.eveningQuantity) : parseFloat(existing.EveningQuantity || 0);
    const total = Math.round((morning + evening) * 100) / 100;
    const rate = req.body.rate != null ? parseFloat(req.body.rate) : parseFloat(existing.Rate || 0);
    const milkType = req.body.milkType != null ? String(req.body.milkType).trim() : existing.MilkType;
    const deliveryDays = req.body.deliveryDays != null ? String(req.body.deliveryDays).trim() : existing.DeliveryDays;
    const changeReason = String(req.body.changeReason || 'Subscription updated').trim();
    const effectiveFrom = String(req.body.effectiveFrom || today()).slice(0, 10);

    if (!(total > 0)) return error(res, 'Total daily quantity must be greater than zero', 400);

    const estimated = estimateMonthly(deliveryDays, total, rate);
    await execute(`
      UPDATE dbo.CustomerSubscriptions
      SET MilkType=@milkType, MorningQuantity=@mq, EveningQuantity=@eq, TotalQuantity=@tq, Rate=@rate,
          DeliveryDays=@days, EstimatedMonthlyAmount=@est, UpdatedAt=@now
      WHERE Id=@id
    `, {
      id: { type: NVarChar(36), value: req.params.id },
      milkType: { type: NVarChar(50), value: milkType },
      mq: { type: Decimal(6, 2), value: morning },
      eq: { type: Decimal(6, 2), value: evening },
      tq: { type: Decimal(6, 2), value: total },
      rate: { type: Decimal(10, 2), value: rate },
      days: { type: NVarChar(50), value: deliveryDays },
      est: { type: Decimal(12, 2), value: estimated },
      now: { type: NVarChar(30), value: new Date().toISOString() },
    });

    const row = await fetchRaw(req.params.id);
    await recordHistory(row, changeReason, req.user?.id, effectiveFrom);
    return success(res, mapSub(row), 'Subscription updated');
  } catch (err) {
    logger.error('Amend subscription:', err);
    return error(res, 'Failed to update subscription');
  }
};

// POST /subscriptions/:id/pause  (owner or staff with manage)
const pause = async (req, res) => {
  try {
    const sub = await fetchRaw(req.params.id);
    if (!sub) return error(res, 'Subscription not found', 404);
    const isManager = hasPermission(req.user?.role, 'subscriptions:manage');
    const isOwner = await canAccessCustomer(req.user, sub.CustomerId);
    if (!isManager && !isOwner) return error(res, 'Permission denied', 403);
    if (['Cancelled', 'Completed', 'Rejected'].includes(sub.Status)) {
      return error(res, `Cannot pause a ${sub.Status} subscription`, 400);
    }

    const fromDate = String(req.body.fromDate || '').slice(0, 10);
    const toDate = String(req.body.toDate || '').slice(0, 10);
    const reason = String(req.body.reason || 'Paused by customer').trim();
    if (!fromDate) return error(res, 'Pause start date is required', 400);

    await execute(`
      UPDATE dbo.CustomerSubscriptions
      SET Status='Paused', PauseFrom=@from, PauseTo=@to, ActionReason=@reason, UpdatedAt=@now
      WHERE Id=@id
    `, {
      id: { type: NVarChar(36), value: req.params.id },
      from: { type: NVarChar(20), value: fromDate },
      to: { type: NVarChar(20), value: toDate || null },
      reason: { type: NVarChar(300), value: reason },
      now: { type: NVarChar(30), value: new Date().toISOString() },
    });

    const row = await fetchRaw(req.params.id);
    await recordHistory(row, reason, req.user?.id, fromDate);
    return success(res, mapSub(row), 'Subscription paused');
  } catch (err) {
    logger.error('Pause subscription:', err);
    return error(res, 'Failed to pause subscription');
  }
};

// POST /subscriptions/:id/resume  (owner or staff with manage)
const resume = async (req, res) => {
  try {
    const sub = await fetchRaw(req.params.id);
    if (!sub) return error(res, 'Subscription not found', 404);
    const isManager = hasPermission(req.user?.role, 'subscriptions:manage');
    const isOwner = await canAccessCustomer(req.user, sub.CustomerId);
    if (!isManager && !isOwner) return error(res, 'Permission denied', 403);
    if (sub.Status !== 'Paused') return error(res, 'Only a paused subscription can be resumed', 400);

    await execute(`
      UPDATE dbo.CustomerSubscriptions
      SET Status='Active', PauseFrom=NULL, PauseTo=NULL, UpdatedAt=@now
      WHERE Id=@id
    `, {
      id: { type: NVarChar(36), value: req.params.id },
      now: { type: NVarChar(30), value: new Date().toISOString() },
    });

    const row = await fetchRaw(req.params.id);
    await recordHistory(row, 'Subscription resumed', req.user?.id);
    return success(res, mapSub(row), 'Subscription resumed');
  } catch (err) {
    logger.error('Resume subscription:', err);
    return error(res, 'Failed to resume subscription');
  }
};

// POST /subscriptions/:id/cancel  (owning customer, or staff with manage)
const cancel = async (req, res) => {
  try {
    const sub = await fetchRaw(req.params.id);
    if (!sub) return error(res, 'Subscription not found', 404);
    const isManager = hasPermission(req.user?.role, 'subscriptions:manage');
    const isOwner = await canAccessCustomer(req.user, sub.CustomerId);
    if (!isManager && !isOwner) return error(res, 'Permission denied', 403);
    if (['Cancelled', 'Completed'].includes(sub.Status)) {
      return error(res, `Subscription is already ${sub.Status}`, 400);
    }

    const reason = String(req.body.reason || 'Cancelled by customer').trim();
    await execute(`
      UPDATE dbo.CustomerSubscriptions
      SET Status='Cancelled', ActionReason=@reason, ActionBy=@by, ActionAt=@now, UpdatedAt=@now
      WHERE Id=@id
    `, {
      id: { type: NVarChar(36), value: req.params.id },
      reason: { type: NVarChar(300), value: reason },
      by: { type: NVarChar(36), value: req.user?.id || null },
      now: { type: NVarChar(30), value: new Date().toISOString() },
    });

    const row = await fetchRaw(req.params.id);
    await recordHistory(row, reason, req.user?.id);
    return success(res, mapSub(row), 'Subscription cancelled');
  } catch (err) {
    logger.error('Cancel subscription:', err);
    return error(res, 'Failed to cancel subscription');
  }
};

module.exports = { getAll, getById, getHistory, create, updateStatus, amend, pause, resume, cancel };
