const { query, queryOne, execute, NVarChar, SmallInt, TinyInt, Decimal, sql } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today, initMonthlyDeliveries, getMonthDays } = require('../utils/helpers');
const { hasPermission, normalizeRole } = require('../config/rbac');
const { guardMonthWrite } = require('../utils/monthLock');
const {
  normalizeDeliveryStatus, statusToDelivered, deliveredToStatus, DELIVERY_STATUSES,
} = require('../utils/deliveryStatus');
const logger = require('../config/logger');

const parseJsonField = (value) => {
  if (!value) return {};
  try { return typeof value === 'string' ? JSON.parse(value) : value; }
  catch { return {}; }
};

const canViewCustomerDelivery = async (user, customerId) => {
  if (hasPermission(user?.role, 'deliveries:view')) return true;
  if (normalizeRole(user?.role) !== 'customer') return false;

  const link = await queryOne(
    'SELECT CustomerId FROM dbo.CustomerUserAccess WHERE UserId=@userId AND CustomerId=@customerId',
    {
      userId: { type: NVarChar(36), value: user.id },
      customerId: { type: NVarChar(36), value: customerId },
    }
  );

  return Boolean(link);
};

const getOrCreate = async (customerId, year, month) => {
  const existing = await queryOne(
    'SELECT * FROM dbo.Deliveries WHERE CustomerId=@cid AND [Year]=@y AND [Month]=@m',
    {
      cid: { type: NVarChar(36), value: customerId },
      y:   { type: SmallInt,     value: year },
      m:   { type: TinyInt,      value: month },
    }
  );
  if (existing) {
    existing.DeliveryData = JSON.parse(existing.DeliveryData || '{}');
    // Safely parse ReasonData if it exists
    try {
      existing.ReasonData = existing.ReasonData 
        ? (typeof existing.ReasonData === 'string' ? JSON.parse(existing.ReasonData) : existing.ReasonData)
        : {};
    } catch (e) {
      logger.warn('Error parsing ReasonData for existing record:', e);
      existing.ReasonData = {};
    }
    existing.StatusData = parseJsonField(existing.StatusData);
    existing.QuantityData = parseJsonField(existing.QuantityData);
    return existing;
  }

  // Fetch customer billing mode
  const customer = await queryOne('SELECT * FROM dbo.Customers WHERE Id=@id', { id: { type: NVarChar(36), value: customerId } });
  const isFullCheck = !customer || customer.BillingMode === 'Monthly Full Check';
  const deliveryData = isFullCheck ? initMonthlyDeliveries(year, month) : {};
  const totalDays = getMonthDays(year, month);
  const deliveredDays = isFullCheck ? totalDays : 0;
  const qty   = parseFloat(customer?.DailyQuantity || 0);
  const rate  = parseFloat(customer?.RatePerLiter   || 0);
  const totalQty    = deliveredDays * qty;
  const totalAmount = totalQty * rate;
  const id = generateId();

  await execute(`
    INSERT INTO dbo.Deliveries
      (Id,CustomerId,[Year],[Month],DeliveryData,ReasonData,DeliveredDays,MissedDays,TotalQuantity,TotalAmount,CreatedAt,UpdatedAt)
    VALUES(@id,@cid,@y,@m,@data,@reasons,@dd,@md,@tq,@ta,@now,@now)
  `, {
    id:   { type: NVarChar(36),  value: id },
    cid:  { type: NVarChar(36),  value: customerId },
    y:    { type: SmallInt,      value: year },
    m:    { type: TinyInt,       value: month },
    data: { type: NVarChar(sql.MAX), value: JSON.stringify(deliveryData) },
    reasons: { type: NVarChar(sql.MAX), value: JSON.stringify({}) },
    dd:   { type: SmallInt,      value: deliveredDays },
    md:   { type: SmallInt,      value: 0 },
    tq:   { type: Decimal(10,2), value: totalQty },
    ta:   { type: Decimal(12,2), value: totalAmount },
    now:  { type: NVarChar(20),  value: today() },
  });

  return { ...await queryOne('SELECT * FROM dbo.Deliveries WHERE Id=@id', { id: { type: NVarChar(36), value: id } }), DeliveryData: deliveryData, StatusData: {}, QuantityData: {} };
};

const recalcAndSave = async (deliveryId, deliveryData, customerId, reasonData = {}, statusData = {}, quantityData = {}) => {
  try {
    const customer = await queryOne('SELECT DailyQuantity,RatePerLiter FROM dbo.Customers WHERE Id=@id', { id: { type: NVarChar(36), value: customerId } });
    const deliveredDays = Object.values(deliveryData).filter(Boolean).length;
    const missedDays    = Object.values(deliveryData).filter(v => v === false).length;
    const qty    = parseFloat(customer?.DailyQuantity || 0);
    const rate   = parseFloat(customer?.RatePerLiter   || 0);
    // Quantity-aware total: use the actual per-day quantity when recorded (e.g. Partial), else the daily quantity.
    let totalQty = 0;
    Object.entries(deliveryData).forEach(([date, delivered]) => {
      if (!delivered) return;
      const actual = quantityData[date];
      totalQty += (actual === undefined || actual === null || actual === '') ? qty : parseFloat(actual) || 0;
    });
    const totalAmount = totalQty * rate;

    // Try to update with the full set of JSON columns.
    try {
      await execute(`
        UPDATE dbo.Deliveries SET
          DeliveryData=@data, ReasonData=@reasons, StatusData=@status, QuantityData=@qtymap,
          DeliveredDays=@dd, MissedDays=@md,
          TotalQuantity=@tq, TotalAmount=@ta, UpdatedAt=@now
        WHERE Id=@id
      `, {
        id:   { type: NVarChar(36),      value: deliveryId },
        data: { type: NVarChar(sql.MAX), value: JSON.stringify(deliveryData) },
        reasons: { type: NVarChar(sql.MAX), value: JSON.stringify(reasonData) },
        status: { type: NVarChar(sql.MAX), value: JSON.stringify(statusData) },
        qtymap: { type: NVarChar(sql.MAX), value: JSON.stringify(quantityData) },
        dd:   { type: SmallInt,          value: deliveredDays },
        md:   { type: SmallInt,          value: missedDays },
        tq:   { type: Decimal(10,2),     value: totalQty },
        ta:   { type: Decimal(12,2),     value: totalAmount },
        now:  { type: NVarChar(20),      value: today() },
      });
    } catch (err) {
      // If newer JSON columns don't exist yet, fall back to the legacy update.
      if (err.message && (err.message.includes('ReasonData') || err.message.includes('StatusData') || err.message.includes('QuantityData'))) {
        logger.warn('Extended delivery columns not found, updating with legacy columns only');
        await execute(`
          UPDATE dbo.Deliveries SET
            DeliveryData=@data, DeliveredDays=@dd, MissedDays=@md,
            TotalQuantity=@tq, TotalAmount=@ta, UpdatedAt=@now
          WHERE Id=@id
        `, {
          id:   { type: NVarChar(36),      value: deliveryId },
          data: { type: NVarChar(sql.MAX), value: JSON.stringify(deliveryData) },
          dd:   { type: SmallInt,          value: deliveredDays },
          md:   { type: SmallInt,          value: missedDays },
          tq:   { type: Decimal(10,2),     value: totalQty },
          ta:   { type: Decimal(12,2),     value: totalAmount },
          now:  { type: NVarChar(20),      value: today() },
        });
      } else {
        throw err;
      }
    }

    return { deliveredDays, missedDays, totalQuantity: totalQty, totalAmount };
  } catch (err) {
    logger.error('recalcAndSave error:', err);
    throw err;
  }
};

const getMonthlyDelivery = async (req, res) => {
  try {
    const { customerId, year, month } = req.params;
    if (!(await canViewCustomerDelivery(req.user, customerId))) {
      return error(res, 'Customer delivery access denied', 403);
    }

    const record = await getOrCreate(customerId, parseInt(year), parseInt(month));
    return success(res, record);
  } catch (err) {
    logger.error('Get monthly delivery:', err);
    return error(res, 'Failed to fetch delivery data');
  }
};

const getAllMonthly = async (req, res) => {
  try {
    const { year, month } = req.params;
    const customers = await query('SELECT * FROM dbo.Customers WHERE IsActive=1 ORDER BY Name');
    const results = [];
    for (const c of customers.recordset) {
      const r = await getOrCreate(c.Id, parseInt(year), parseInt(month));
      results.push({ 
        ...r, 
        CustomerName: c.Name, 
        Mobile: c.Mobile,
        ReasonData: r.ReasonData || {}
      });
    }
    return success(res, results);
  } catch (err) {
    logger.error('Get all monthly:', err);
    return error(res, 'Failed to fetch delivery data');
  }
};

const updateDeliveryDay = async (req, res) => {
  try {
    const { customerId, year, month } = req.params;
    const { date, reason, comments, quantity } = req.body;

    // Rich status (§9.2) is optional and backward-compatible with the legacy `delivered` boolean.
    let status = null;
    if (req.body.status !== undefined && req.body.status !== null && req.body.status !== '') {
      status = normalizeDeliveryStatus(req.body.status);
      if (!status) return error(res, `Invalid delivery status. Allowed: ${DELIVERY_STATUSES.join(', ')}`, 400);
    }
    // Determine the delivered boolean: explicit `delivered` wins, else derive from status.
    let delivered;
    if (req.body.delivered !== undefined) delivered = req.body.delivered;
    else if (status) delivered = statusToDelivered(status);
    else delivered = true;
    // Ensure a status is always recorded, deriving one from the boolean when not supplied.
    if (!status) status = deliveredToStatus(delivered);

    const record = await getOrCreate(customerId, parseInt(year), parseInt(month));

    const lock = await guardMonthWrite({
      user: req.user, year, month, ip: req.ip,
      module: 'Deliveries', entityId: record.Id, action: 'CLOSED_MONTH_DELIVERY_EDIT',
      reason: reason || 'Delivery edit',
    });
    if (!lock.allowed) return error(res, 'This month is closed. Corrections require admin authorization.', 423);
    let deliveryData = typeof record.DeliveryData === 'string'
      ? JSON.parse(record.DeliveryData) : (record.DeliveryData || {});
    let reasonData = {};
    
    // Parse reasonData safely - it might not exist yet if migration hasn't run
    try {
      reasonData = typeof record.ReasonData === 'string'
        ? JSON.parse(record.ReasonData) : (record.ReasonData || {});
    } catch (e) {
      logger.warn('Error parsing reasonData:', e);
      reasonData = {};
    }
    const statusData = record.StatusData && typeof record.StatusData === 'object' ? record.StatusData : parseJsonField(record.StatusData);
    const quantityData = record.QuantityData && typeof record.QuantityData === 'object' ? record.QuantityData : parseJsonField(record.QuantityData);
    
    const prevStatus = deliveryData[date];
    deliveryData[date] = delivered;
    statusData[date] = status;

    // Record actual delivered quantity when provided (supports Partial / actual-vs-requested §9.3).
    if (quantity !== undefined && quantity !== null && quantity !== '') {
      quantityData[date] = parseFloat(quantity) || 0;
    } else if (!delivered) {
      delete quantityData[date];
    }
    
    // Store reason if marking as not delivered
    if (!delivered) {
      reasonData[date] = { reason: reason || '', comments: comments || '' };
    } else {
      delete reasonData[date];
    }

    const totals = await recalcAndSave(record.Id, deliveryData, customerId, reasonData, statusData, quantityData);

    // Audit log for missed delivery
    if (prevStatus !== delivered && !delivered) {
      await execute(`
        INSERT INTO dbo.AuditLog
          (Id,UserId,Action,Module,EntityId,PreviousValue,NewValue,Reason,Comments,IpAddress,CreatedAt)
        VALUES(@id,@uid,'UPDATE_DELIVERY','Deliveries',@eid,'Delivered',@newval,@reason,@comments,@ip,@now)
      `, {
        id:       { type: NVarChar(36),  value: generateId() },
        uid:      { type: NVarChar(36),  value: req.user?.id || 'system' },
        eid:      { type: NVarChar(36),  value: record.Id },
        newval:   { type: NVarChar(200), value: status },
        reason:   { type: NVarChar(200), value: reason || '' },
        comments: { type: NVarChar(500), value: comments || '' },
        ip:       { type: NVarChar(50),  value: req.ip || '' },
        now:      { type: NVarChar(30),  value: new Date().toISOString() },
      });
    }

    return success(res, { ...record, DeliveryData: deliveryData, ReasonData: reasonData, StatusData: statusData, QuantityData: quantityData, ...totals });
  } catch (err) {
    logger.error('Update delivery day:', err);
    return error(res, 'Failed to update delivery');
  }
};

const markEntireMonth = async (req, res) => {
  try {
    const { customerId, year, month } = req.params;
    const { delivered } = req.body;
    const record = await getOrCreate(customerId, parseInt(year), parseInt(month));

    const lock = await guardMonthWrite({
      user: req.user, year, month, ip: req.ip,
      module: 'Deliveries', entityId: record.Id, action: 'CLOSED_MONTH_DELIVERY_EDIT',
      reason: 'Mark entire month',
    });
    if (!lock.allowed) return error(res, 'This month is closed. Corrections require admin authorization.', 423);
    const deliveryData = typeof record.DeliveryData === 'string'
      ? JSON.parse(record.DeliveryData) : record.DeliveryData;
    let reasonData = typeof record.ReasonData === 'string'
      ? JSON.parse(record.ReasonData) : (record.ReasonData || {});
    const statusData = record.StatusData && typeof record.StatusData === 'object' ? record.StatusData : parseJsonField(record.StatusData);
    const quantityData = record.QuantityData && typeof record.QuantityData === 'object' ? record.QuantityData : parseJsonField(record.QuantityData);

    const bulkStatus = deliveredToStatus(delivered);
    Object.keys(deliveryData).forEach(d => { deliveryData[d] = delivered; statusData[d] = bulkStatus; });
    
    // Clear reasons when marking all as delivered
    if (delivered) {
      reasonData = {};
    }
    
    const totals = await recalcAndSave(record.Id, deliveryData, customerId, reasonData, statusData, quantityData);
    return success(res, { ...record, DeliveryData: deliveryData, ReasonData: reasonData, StatusData: statusData, QuantityData: quantityData, ...totals });
  } catch (err) {
    logger.error('Mark entire month:', err);
    return error(res, 'Failed to mark month');
  }
};

// GET /deliveries/statuses -> the canonical delivery status enum for pickers
const getStatuses = async (req, res) => {
  return success(res, DELIVERY_STATUSES);
};

const getTodayDeliveries = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const dateStr = today();
    const customers = await query('SELECT * FROM dbo.Customers WHERE IsActive=1');
    const results = [];
    for (const c of customers.recordset) {
      const r = await getOrCreate(c.Id, year, month);
      const data = typeof r.DeliveryData === 'string' ? JSON.parse(r.DeliveryData) : r.DeliveryData;
      results.push({
        CustomerId: c.Id, CustomerName: c.Name, Mobile: c.Mobile,
        Address: c.Address, DailyQuantity: c.DailyQuantity,
        Delivered: data[dateStr] !== false,
      });
    }
    return success(res, results);
  } catch (err) {
    logger.error('Get today deliveries:', err);
    return error(res, 'Failed to fetch today deliveries');
  }
};

// Apply a single-day delivery status correction (used when an admin approves a customer
// delivery dispute). Respects the month lock: closed months are corrected only when the
// month-write guard authorizes it (admin override, which is audited). Returns
// { applied:false, closed:true } when the guard blocks the write.
const applyDeliveryCorrection = async ({ user, customerId, date, status, reason, comments, ip }) => {
  const [y, m] = String(date).split('-').map(Number);
  const record = await getOrCreate(customerId, y, m);

  const lock = await guardMonthWrite({
    user, year: y, month: m, ip,
    module: 'Deliveries', entityId: record.Id, action: 'DISPUTE_DELIVERY_CORRECTION',
    reason: reason || 'Delivery dispute correction',
  });
  if (!lock.allowed) return { applied: false, closed: true };

  const canonical = normalizeDeliveryStatus(status) || 'Delivered';
  const delivered = statusToDelivered(canonical);

  let deliveryData = typeof record.DeliveryData === 'string' ? JSON.parse(record.DeliveryData) : (record.DeliveryData || {});
  let reasonData = {};
  try { reasonData = typeof record.ReasonData === 'string' ? JSON.parse(record.ReasonData) : (record.ReasonData || {}); }
  catch { reasonData = {}; }
  const statusData = record.StatusData && typeof record.StatusData === 'object' ? record.StatusData : parseJsonField(record.StatusData);
  const quantityData = record.QuantityData && typeof record.QuantityData === 'object' ? record.QuantityData : parseJsonField(record.QuantityData);

  const prevStatus = statusData[date] || deliveredToStatus(deliveryData[date] !== false);
  deliveryData[date] = delivered;
  statusData[date] = canonical;
  if (!delivered) {
    reasonData[date] = { reason: reason || 'Customer dispute', comments: comments || '' };
    delete quantityData[date];
  } else {
    delete reasonData[date];
  }

  const totals = await recalcAndSave(record.Id, deliveryData, customerId, reasonData, statusData, quantityData);

  await execute(`
    INSERT INTO dbo.AuditLog
      (Id,UserId,Action,Module,EntityId,PreviousValue,NewValue,Reason,Comments,IpAddress,CreatedAt)
    VALUES(@id,@uid,'DISPUTE_DELIVERY_CORRECTION','Deliveries',@eid,@prev,@newval,@reason,@comments,@ip,@now)
  `, {
    id:       { type: NVarChar(36),  value: generateId() },
    uid:      { type: NVarChar(36),  value: user?.id || 'system' },
    eid:      { type: NVarChar(36),  value: record.Id },
    prev:     { type: NVarChar(200), value: String(prevStatus) },
    newval:   { type: NVarChar(200), value: canonical },
    reason:   { type: NVarChar(200), value: String(reason || 'Customer dispute').slice(0, 200) },
    comments: { type: NVarChar(500), value: `Dispute correction ${date}: ${String(comments || '').slice(0, 400)}` },
    ip:       { type: NVarChar(50),  value: ip || '' },
    now:      { type: NVarChar(30),  value: new Date().toISOString() },
  });

  return { applied: true, closed: lock.closed, override: lock.override, prevStatus, newStatus: canonical, ...totals };
};

module.exports = { getMonthlyDelivery, getAllMonthly, updateDeliveryDay, markEntireMonth, getTodayDeliveries, getStatuses, applyDeliveryCorrection };
