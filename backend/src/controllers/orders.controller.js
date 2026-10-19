const { query, queryOne, execute, NVarChar, Decimal } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const { hasPermission, normalizeRole } = require('../config/rbac');
const logger = require('../config/logger');

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'OutForDelivery', 'Delivered', 'Cancelled'];

const canAccessCustomer = async (user, customerId) => {
  if (hasPermission(user?.role, 'orders:view')) return true;
  if (normalizeRole(user?.role) !== 'customer') return false;
  const link = await queryOne(
    'SELECT CustomerId FROM dbo.CustomerUserAccess WHERE UserId=@userId AND CustomerId=@customerId',
    { userId: { type: NVarChar(36), value: user.id }, customerId: { type: NVarChar(36), value: customerId } }
  );
  return Boolean(link);
};

const mapOrder = (row) => ({
  id: row.Id,
  customerId: row.CustomerId,
  customerName: row.CustomerName,
  orderDate: row.OrderDate,
  status: row.Status,
  totalAmount: parseFloat(row.TotalAmount || 0),
  notes: row.Notes || '',
  actionReason: row.ActionReason || '',
  createdBy: row.CreatedBy || '',
  createdAt: row.CreatedAt,
  updatedAt: row.UpdatedAt,
});

const mapItem = (row) => ({
  id: row.Id,
  orderId: row.OrderId,
  productId: row.ProductId,
  productName: row.ProductName,
  unit: row.Unit,
  quantity: parseFloat(row.Quantity || 0),
  rate: parseFloat(row.Rate || 0),
  amount: parseFloat(row.Amount || 0),
});

const fetchOrderWithItems = async (orderId) => {
  const order = await queryOne(`
    SELECT o.*, c.Name AS CustomerName
    FROM dbo.ProductOrders o
    JOIN dbo.Customers c ON c.Id = o.CustomerId
    WHERE o.Id=@id
  `, { id: { type: NVarChar(36), value: orderId } });
  if (!order) return null;
  const items = (await query('SELECT * FROM dbo.ProductOrderItems WHERE OrderId=@id ORDER BY CreatedAt', {
    id: { type: NVarChar(36), value: orderId },
  })).recordset;
  return { ...mapOrder(order), items: items.map(mapItem) };
};

// GET /orders
const getAll = async (req, res) => {
  try {
    const { status, customerId } = req.query;
    const params = {};
    const filters = [];

    if (hasPermission(req.user?.role, 'orders:view')) {
      if (customerId) {
        filters.push('o.CustomerId=@customerId');
        params.customerId = { type: NVarChar(36), value: customerId };
      }
    } else if (normalizeRole(req.user?.role) === 'customer') {
      filters.push('o.CustomerId IN (SELECT CustomerId FROM dbo.CustomerUserAccess WHERE UserId=@userId)');
      params.userId = { type: NVarChar(36), value: req.user.id };
    } else {
      return error(res, 'Permission denied', 403);
    }

    if (status) {
      filters.push('o.Status=@status');
      params.status = { type: NVarChar(20), value: status };
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const orders = (await query(`
      SELECT o.*, c.Name AS CustomerName
      FROM dbo.ProductOrders o
      JOIN dbo.Customers c ON c.Id = o.CustomerId
      ${where}
      ORDER BY o.OrderDate DESC, o.CreatedAt DESC
    `, params)).recordset;

    return success(res, orders.map(mapOrder));
  } catch (err) {
    logger.error('Get orders:', err);
    return error(res, 'Failed to fetch orders');
  }
};

// GET /orders/:id
const getById = async (req, res) => {
  try {
    const order = await fetchOrderWithItems(req.params.id);
    if (!order) return error(res, 'Order not found', 404);
    if (!(await canAccessCustomer(req.user, order.customerId))) return error(res, 'Order access denied', 403);
    return success(res, order);
  } catch (err) {
    logger.error('Get order:', err);
    return error(res, 'Failed to fetch order');
  }
};

// POST /orders
const create = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);
    const canCreate = role === 'customer'
      || hasPermission(req.user?.role, 'orders:create')
      || hasPermission(req.user?.role, 'orders:manage');
    if (!canCreate) return error(res, 'Permission denied', 403);

    const customerId = req.body.customerId || req.user?.customerIds?.[0];
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const notes = String(req.body.notes || '').trim();
    const orderDate = String(req.body.orderDate || today()).slice(0, 10);

    if (!customerId) return error(res, 'Customer is required', 400);
    if (items.length === 0) return error(res, 'At least one order item is required', 400);
    if (!(await canAccessCustomer(req.user, customerId))) return error(res, 'Customer access denied', 403);

    const customer = await queryOne('SELECT Id FROM dbo.Customers WHERE Id=@id AND IsActive=1', {
      id: { type: NVarChar(36), value: customerId },
    });
    if (!customer) return error(res, 'Customer not found', 404);

    // Resolve products and compute line amounts from the master price list.
    const resolved = [];
    for (const item of items) {
      const quantity = parseFloat(item.quantity);
      if (!item.productId || !(quantity > 0)) {
        return error(res, 'Each item needs a product and a positive quantity', 400);
      }
      const product = await queryOne('SELECT Id, Name, Unit, Rate, IsActive FROM dbo.Products WHERE Id=@id', {
        id: { type: NVarChar(36), value: item.productId },
      });
      if (!product) return error(res, `Product not found: ${item.productId}`, 404);
      if (!product.IsActive) return error(res, `Product is not available: ${product.Name}`, 400);
      const rate = parseFloat(product.Rate || 0);
      resolved.push({
        productId: product.Id, productName: product.Name, unit: product.Unit,
        quantity, rate, amount: Math.round(quantity * rate * 100) / 100,
      });
    }

    const total = Math.round(resolved.reduce((sum, r) => sum + r.amount, 0) * 100) / 100;
    const orderId = generateId();
    const now = new Date().toISOString();

    await execute(`
      INSERT INTO dbo.ProductOrders
        (Id,CustomerId,OrderDate,Status,TotalAmount,Notes,CreatedBy,CreatedAt,UpdatedAt)
      VALUES(@id,@customerId,@orderDate,'Pending',@total,@notes,@createdBy,@now,@now)
    `, {
      id: { type: NVarChar(36), value: orderId },
      customerId: { type: NVarChar(36), value: customerId },
      orderDate: { type: NVarChar(20), value: orderDate },
      total: { type: Decimal(12, 2), value: total },
      notes: { type: NVarChar(500), value: notes },
      createdBy: { type: NVarChar(36), value: req.user?.id || null },
      now: { type: NVarChar(30), value: now },
    });

    for (const r of resolved) {
      await execute(`
        INSERT INTO dbo.ProductOrderItems
          (Id,OrderId,ProductId,ProductName,Unit,Quantity,Rate,Amount,CreatedAt)
        VALUES(@id,@orderId,@productId,@productName,@unit,@quantity,@rate,@amount,@now)
      `, {
        id: { type: NVarChar(36), value: generateId() },
        orderId: { type: NVarChar(36), value: orderId },
        productId: { type: NVarChar(36), value: r.productId },
        productName: { type: NVarChar(100), value: r.productName },
        unit: { type: NVarChar(20), value: r.unit },
        quantity: { type: Decimal(10, 2), value: r.quantity },
        rate: { type: Decimal(10, 2), value: r.rate },
        amount: { type: Decimal(12, 2), value: r.amount },
        now: { type: NVarChar(30), value: now },
      });
    }

    const created = await fetchOrderWithItems(orderId);
    return success(res, created, 'Order placed', 201);
  } catch (err) {
    logger.error('Create order:', err);
    return error(res, 'Failed to place order');
  }
};

// PATCH /orders/:id/status
const updateStatus = async (req, res) => {
  try {
    if (!hasPermission(req.user?.role, 'orders:manage')) return error(res, 'Permission denied', 403);

    const status = String(req.body.status || '').trim();
    if (!ORDER_STATUSES.includes(status)) {
      return error(res, `Status must be one of: ${ORDER_STATUSES.join(', ')}`, 400);
    }
    const actionReason = String(req.body.actionReason || '').trim();
    if (status === 'Cancelled' && !actionReason) {
      return error(res, 'Cancellation reason is required', 400);
    }

    const existing = await queryOne('SELECT Id,Status FROM dbo.ProductOrders WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    if (!existing) return error(res, 'Order not found', 404);

    await execute(`
      UPDATE dbo.ProductOrders SET Status=@status, ActionReason=@actionReason, UpdatedAt=@now WHERE Id=@id
    `, {
      id: { type: NVarChar(36), value: req.params.id },
      status: { type: NVarChar(20), value: status },
      actionReason: { type: NVarChar(300), value: actionReason },
      now: { type: NVarChar(30), value: new Date().toISOString() },
    });

    // Decrement product stock once, when an order is first marked Delivered (clamped at 0).
    if (status === 'Delivered' && existing.Status !== 'Delivered') {
      const items = (await query('SELECT ProductId, Quantity FROM dbo.ProductOrderItems WHERE OrderId=@id', {
        id: { type: NVarChar(36), value: req.params.id },
      })).recordset;
      for (const it of items) {
        if (!it.ProductId) continue;
        await execute(`
          UPDATE dbo.Products
          SET Stock = CASE WHEN Stock - @qty < 0 THEN 0 ELSE Stock - @qty END, UpdatedAt=@now
          WHERE Id=@pid
        `, {
          qty: { type: Decimal(12, 2), value: parseFloat(it.Quantity || 0) },
          pid: { type: NVarChar(36), value: it.ProductId },
          now: { type: NVarChar(20), value: today() },
        });
      }
    }

    return success(res, await fetchOrderWithItems(req.params.id), `Order ${status}`);
  } catch (err) {
    logger.error('Update order status:', err);
    return error(res, 'Failed to update order');
  }
};

// POST /orders/:id/cancel  — owning customer (while Pending) or staff with manage
const cancel = async (req, res) => {
  try {
    const order = await queryOne(`
      SELECT o.*, c.Name AS CustomerName FROM dbo.ProductOrders o
      JOIN dbo.Customers c ON c.Id = o.CustomerId WHERE o.Id=@id
    `, { id: { type: NVarChar(36), value: req.params.id } });
    if (!order) return error(res, 'Order not found', 404);

    const isManager = hasPermission(req.user?.role, 'orders:manage');
    const isOwner = await canAccessCustomer(req.user, order.CustomerId);
    if (!isManager && !isOwner) return error(res, 'Permission denied', 403);
    if (!isManager && order.Status !== 'Pending') {
      return error(res, 'Only pending orders can be cancelled', 400);
    }

    const reason = String(req.body.reason || 'Cancelled by customer').trim();
    await execute('UPDATE dbo.ProductOrders SET Status=\'Cancelled\', ActionReason=@reason, UpdatedAt=@now WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
      reason: { type: NVarChar(300), value: reason },
      now: { type: NVarChar(30), value: new Date().toISOString() },
    });

    return success(res, await fetchOrderWithItems(req.params.id), 'Order cancelled');
  } catch (err) {
    logger.error('Cancel order:', err);
    return error(res, 'Failed to cancel order');
  }
};

module.exports = { getAll, getById, create, updateStatus, cancel };
