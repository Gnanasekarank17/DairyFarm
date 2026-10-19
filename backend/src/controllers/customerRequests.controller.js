const { query, queryOne, execute, NVarChar, Decimal } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const { hasPermission, normalizeRole } = require('../config/rbac');
const { normalizeDeliveryStatus } = require('../utils/deliveryStatus');
const { applyDeliveryCorrection } = require('./deliveries.controller');
const pushService = require('../services/notifications/push.service');
const logger = require('../config/logger');

const normalizeRequestType = (type) => {
  const value = String(type || '').trim().toLowerCase();
  if (value === 'extra_milk' || value === 'extra') return 'extra_milk';
  if (value === 'cancel_delivery' || value === 'cancel') return 'cancel_delivery';
  if (value === 'dispute_delivery' || value === 'dispute') return 'dispute_delivery';
  return null;
};

// Earliest date a customer may dispute: the first day of the previous month.
const disputeWindowStart = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}-01`;
};

const toDateList = (startDate, endDate) => {
  const dates = [];
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
  const cursor = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);
  while (cursor <= end) {
    dates.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
    );
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

const canAccessCustomer = async (user, customerId) => {
  if (hasPermission(user?.role, 'customer_requests:view')) return true;
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

const notifyOperations = async (request, customerName) => {
  const isDispute = request.RequestType === 'dispute_delivery';
  // Disputes are resolved by an admin, so route them to admins/supervisors/managers.
  const roleList = isDispute ? "'admin','supervisor','manager'" : "'manager','deliveryperson'";
  const users = await query(`
    SELECT PushToken FROM dbo.Users
    WHERE IsActive=1
      AND Role IN (${roleList})
      AND PushToken IS NOT NULL
      AND PushToken <> ''
  `);
  const tokens = users.recordset.map((user) => user.PushToken).filter(Boolean);

  let title;
  let detail;
  if (isDispute) {
    title = 'Delivery correction requested';
    const claim = String(request.ClaimedStatus || '').toLowerCase() === 'delivered'
      ? 'says milk WAS delivered' : 'says milk was NOT delivered';
    detail = ` \u2014 ${claim}`;
  } else if (request.RequestType === 'extra_milk') {
    title = 'Extra milk requested';
    detail = ` (${parseFloat(request.ExtraQuantity || 0).toFixed(2)} L extra)`;
  } else {
    title = 'Milk delivery cancelled';
    detail = '';
  }

  await pushService.sendPush(
    tokens,
    title,
    `${customerName} \u00b7 ${request.RequestDate}${detail}. ${request.Reason || ''}`.trim(),
    { type: isDispute ? 'delivery_dispute' : 'customer_request', requestId: request.Id, customerId: request.CustomerId, requestDate: request.RequestDate }
  );
};

const mapRequest = (row) => ({
  id: row.Id,
  customerId: row.CustomerId,
  customerName: row.CustomerName,
  userId: row.UserId,
  requestDate: row.RequestDate,
  requestType: row.RequestType,
  extraQuantity: String(row.ExtraQuantity ?? 0),
  claimedStatus: row.ClaimedStatus || '',
  reason: row.Reason || '',
  status: row.Status,
  actionReason: row.ActionReason || '',
  actionBy: row.ActionBy || '',
  actionAt: row.ActionAt || '',
  createdAt: row.CreatedAt,
  updatedAt: row.UpdatedAt,
});

const getMonthly = async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    const customerId = req.query.customerId;
    const params = {
      startDate: { type: NVarChar(20), value: startDate },
      endDate: { type: NVarChar(20), value: endDate },
    };

    let filter = '';
    if (customerId) {
      if (!(await canAccessCustomer(req.user, customerId))) return error(res, 'Customer access denied', 403);
      filter = ' AND r.CustomerId=@customerId';
      params.customerId = { type: NVarChar(36), value: customerId };
    } else if (normalizeRole(req.user?.role) === 'customer') {
      filter = ` AND r.CustomerId IN (SELECT CustomerId FROM dbo.CustomerUserAccess WHERE UserId=@userId)`;
      params.userId = { type: NVarChar(36), value: req.user.id };
    } else if (!hasPermission(req.user?.role, 'customer_requests:view')) {
      return error(res, 'Permission denied', 403);
    }

    const result = await query(`
      SELECT r.*, c.Name AS CustomerName
      FROM dbo.CustomerDeliveryRequests r
      JOIN dbo.Customers c ON c.Id = r.CustomerId
      WHERE r.RequestDate >= @startDate AND r.RequestDate <= @endDate${filter}
      ORDER BY r.RequestDate, c.Name
    `, params);

    return success(res, result.recordset.map(mapRequest));
  } catch (err) {
    logger.error('Get customer delivery requests:', err);
    return error(res, 'Failed to fetch customer requests');
  }
};

const create = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);
    if (role !== 'customer' && !hasPermission(req.user?.role, 'customer_requests:manage')) {
      return error(res, 'Permission denied', 403);
    }

    const customerId = req.body.customerId || req.user?.customerIds?.[0];
    const requestDate = String(req.body.requestDate || '').slice(0, 10);
    const endDate = String(req.body.endDate || requestDate).slice(0, 10);
    const requestType = normalizeRequestType(req.body.requestType);
    const isDispute = requestType === 'dispute_delivery';
    const extraQuantity = requestType === 'extra_milk' ? parseFloat(req.body.extraQuantity || 0) : 0;
    const claimedStatus = isDispute ? normalizeDeliveryStatus(req.body.claimedStatus) : null;
    const reason = String(req.body.reason || '').trim();

    if (!customerId || !requestDate || !requestType) {
      return error(res, 'Customer, request date, and request type are required', 400);
    }

    if (isDispute) {
      if (requestDate > today()) return error(res, 'Cannot dispute a future delivery date', 400);
      if (requestDate < disputeWindowStart()) {
        return error(res, 'Disputes are allowed only for the current and previous month', 400);
      }
    } else if (requestDate < today()) {
      return error(res, 'Request date must be today or a future date', 400);
    }

    if (requestType === 'cancel_delivery' && endDate < requestDate) {
      return error(res, 'End date must be same as or after from date', 400);
    }

    if (requestType === 'cancel_delivery' && endDate < today()) {
      return error(res, 'End date must be today or a future date', 400);
    }

    if (!(await canAccessCustomer(req.user, customerId))) return error(res, 'Customer access denied', 403);
    if (requestType === 'extra_milk' && extraQuantity <= 0) return error(res, 'Extra milk quantity is required', 400);
    if (requestType === 'cancel_delivery' && !reason) return error(res, 'Cancellation reason is required', 400);
    if (isDispute && !claimedStatus) return error(res, 'Select what actually happened (delivered or not delivered)', 400);
    if (isDispute && !reason) return error(res, 'Please describe the delivery issue', 400);

    const customer = await queryOne('SELECT Id, Name FROM dbo.Customers WHERE Id=@id AND IsActive=1', {
      id: { type: NVarChar(36), value: customerId },
    });
    if (!customer) return error(res, 'Customer not found', 404);

    const now = new Date().toISOString();
    const requestDates = requestType === 'cancel_delivery' ? toDateList(requestDate, endDate) : [requestDate];
    if (requestDates.length > 45) return error(res, 'Cancellation range cannot exceed 45 days', 400);

    const saved = [];
    for (const date of requestDates) {
      const existing = await queryOne(
        'SELECT Id FROM dbo.CustomerDeliveryRequests WHERE CustomerId=@customerId AND RequestDate=@requestDate AND RequestType=@requestType',
        {
          customerId: { type: NVarChar(36), value: customerId },
          requestDate: { type: NVarChar(20), value: date },
          requestType: { type: NVarChar(30), value: requestType },
        }
      );

      const id = existing?.Id || generateId();
      if (existing) {
        await execute(`
          UPDATE dbo.CustomerDeliveryRequests SET ExtraQuantity=@extraQuantity, ClaimedStatus=@claimedStatus, Reason=@reason,
            Status='Pending', ActionReason=NULL, ActionBy=NULL, ActionAt=NULL, UpdatedAt=@now
          WHERE Id=@id
        `, {
          id: { type: NVarChar(36), value: id },
          extraQuantity: { type: Decimal(8, 2), value: extraQuantity },
          claimedStatus: { type: NVarChar(30), value: claimedStatus },
          reason: { type: NVarChar(200), value: reason },
          now: { type: NVarChar(30), value: now },
        });
      } else {
        await execute(`
          INSERT INTO dbo.CustomerDeliveryRequests
            (Id,CustomerId,UserId,RequestDate,RequestType,ExtraQuantity,ClaimedStatus,Reason,Status,CreatedAt,UpdatedAt)
          VALUES(@id,@customerId,@userId,@requestDate,@requestType,@extraQuantity,@claimedStatus,@reason,'Pending',@now,@now)
        `, {
          id: { type: NVarChar(36), value: id },
          customerId: { type: NVarChar(36), value: customerId },
          userId: { type: NVarChar(36), value: req.user?.id || null },
          requestDate: { type: NVarChar(20), value: date },
          requestType: { type: NVarChar(30), value: requestType },
          extraQuantity: { type: Decimal(8, 2), value: extraQuantity },
          claimedStatus: { type: NVarChar(30), value: claimedStatus },
          reason: { type: NVarChar(200), value: reason },
          now: { type: NVarChar(30), value: now },
        });
      }

      const created = await queryOne(`
        SELECT r.*, c.Name AS CustomerName
        FROM dbo.CustomerDeliveryRequests r
        JOIN dbo.Customers c ON c.Id = r.CustomerId
        WHERE r.Id=@id
      `, { id: { type: NVarChar(36), value: id } });
      saved.push(created);
    }

    await notifyOperations(saved[0], customer.Name);
    return success(res, saved.map(mapRequest), saved.length > 1 ? `${saved.length} requests submitted` : 'Request submitted', saved.length > 1 ? 201 : 200);
  } catch (err) {
    logger.error('Create customer delivery request:', err);
    return error(res, 'Failed to submit customer request');
  }
};

const updateStatus = async (req, res) => {
  try {
    if (!hasPermission(req.user?.role, 'customer_requests:manage')) {
      return error(res, 'Permission denied', 403);
    }

    const status = String(req.body.status || '').trim();
    const actionReason = String(req.body.actionReason || '').trim();
    if (!['Approved', 'Rejected'].includes(status)) {
      return error(res, 'Status must be Approved or Rejected', 400);
    }

    if (status === 'Rejected' && !actionReason) {
      return error(res, 'Rejection reason is required', 400);
    }

    const existing = await queryOne(`
      SELECT r.*, c.Name AS CustomerName
      FROM dbo.CustomerDeliveryRequests r
      JOIN dbo.Customers c ON c.Id = r.CustomerId
      WHERE r.Id=@id
    `, { id: { type: NVarChar(36), value: req.params.id } });

    if (!existing) return error(res, 'Request not found', 404);

    const isDispute = existing.RequestType === 'dispute_delivery';
    if (isDispute && normalizeRole(req.user?.role) !== 'admin') {
      return error(res, 'Only an administrator can resolve delivery disputes', 403);
    }

    // Approving a dispute auto-corrects the delivery record for that day.
    if (isDispute && status === 'Approved') {
      const correction = await applyDeliveryCorrection({
        user: req.user,
        customerId: existing.CustomerId,
        date: existing.RequestDate,
        status: existing.ClaimedStatus,
        reason: actionReason || 'Customer delivery dispute approved',
        comments: existing.Reason,
        ip: req.ip,
      });
      if (!correction.applied) {
        return error(res, 'This month is closed. Corrections require admin authorization.', 423);
      }
    }

    const now = new Date().toISOString();
    await execute(`
      UPDATE dbo.CustomerDeliveryRequests SET Status=@status, ActionReason=@actionReason,
        ActionBy=@actionBy, ActionAt=@actionAt, UpdatedAt=@actionAt
      WHERE Id=@id
    `, {
      id: { type: NVarChar(36), value: req.params.id },
      status: { type: NVarChar(20), value: status },
      actionReason: { type: NVarChar(300), value: actionReason },
      actionBy: { type: NVarChar(36), value: req.user?.id || null },
      actionAt: { type: NVarChar(30), value: now },
    });

    await execute(`
      INSERT INTO dbo.AuditLog
        (Id,UserId,Action,Module,EntityId,PreviousValue,NewValue,Reason,Comments,IpAddress,CreatedAt)
      VALUES(@auditId,@userId,'CUSTOMER_REQUEST_STATUS','CustomerDeliveryRequests',@entityId,@previous,@next,@reason,@comments,@ip,@createdAt)
    `, {
      auditId: { type: NVarChar(36), value: generateId() },
      userId: { type: NVarChar(36), value: req.user?.id || 'system' },
      entityId: { type: NVarChar(36), value: req.params.id },
      previous: { type: NVarChar(200), value: existing.Status },
      next: { type: NVarChar(200), value: status },
      reason: { type: NVarChar(200), value: actionReason },
      comments: { type: NVarChar(500), value: `${existing.CustomerName} ${existing.RequestType} ${existing.RequestDate}` },
      ip: { type: NVarChar(50), value: req.ip || '' },
      createdAt: { type: NVarChar(30), value: now },
    });

    const updated = await queryOne(`
      SELECT r.*, c.Name AS CustomerName
      FROM dbo.CustomerDeliveryRequests r
      JOIN dbo.Customers c ON c.Id = r.CustomerId
      WHERE r.Id=@id
    `, { id: { type: NVarChar(36), value: req.params.id } });

    return success(res, mapRequest(updated), `Request ${status.toLowerCase()}`);
  } catch (err) {
    logger.error('Update customer request status:', err);
    return error(res, 'Failed to update customer request');
  }
};

module.exports = { getMonthly, create, updateStatus };