const { query, queryOne, execute, NVarChar, Decimal, sql } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const logger = require('../config/logger');

// POST /payments
const recordPayment = async (req, res) => {
  try {
    const { invoiceId, amountPaid, paymentMode, notes } = req.body;

    const inv = await queryOne(
      'SELECT * FROM dbo.Invoices WHERE Id=@id',
      { id: { type: NVarChar(36), value: invoiceId } }
    );
    if (!inv) return error(res, 'Invoice not found', 404);

    const amountDue  = parseFloat(inv.Amount);
    const paid       = parseFloat(amountPaid);
    const balance    = amountDue - paid;
    const status     = balance <= 0 ? 'Paid' : 'Partial';
    const id         = generateId();
    const nowStr     = today();

    await execute(`
      INSERT INTO dbo.Payments
        (Id,InvoiceId,CustomerId,InvoiceNumber,AmountDue,AmountPaid,Balance,
         PaymentDate,PaymentMode,Notes,Status,CreatedAt,UpdatedAt)
      VALUES
        (@id,@invId,@cid,@invNo,@due,@paid,@balance,
         @date,@mode,@notes,@status,@now,@now)
    `, {
      id:      { type: NVarChar(36),   value: id },
      invId:   { type: NVarChar(36),   value: invoiceId },
      cid:     { type: NVarChar(36),   value: inv.CustomerId },
      invNo:   { type: NVarChar(50),   value: inv.InvoiceNumber },
      due:     { type: Decimal(12, 2), value: amountDue },
      paid:    { type: Decimal(12, 2), value: paid },
      balance: { type: Decimal(12, 2), value: balance },
      date:    { type: NVarChar(20),   value: req.body.paymentDate || nowStr },
      mode:    { type: NVarChar(50),   value: paymentMode || 'Cash' },
      notes:   { type: NVarChar(500),  value: notes || '' },
      status:  { type: NVarChar(20),   value: status },
      now:     { type: NVarChar(20),   value: nowStr },
    });

    // Update invoice payment status
    await execute(
      'UPDATE dbo.Invoices SET PaymentStatus=@status,UpdatedAt=@now WHERE Id=@id',
      {
        status: { type: NVarChar(20), value: status },
        now:    { type: NVarChar(20), value: nowStr },
        id:     { type: NVarChar(36), value: invoiceId },
      }
    );

    const payment = await queryOne(
      'SELECT * FROM dbo.Payments WHERE Id=@id',
      { id: { type: NVarChar(36), value: id } }
    );
    return success(res, payment, 'Payment recorded', 201);
  } catch (err) {
    logger.error('Record payment:', err);
    return error(res, 'Failed to record payment');
  }
};

// GET /payments
const getAll = async (req, res) => {
  try {
    const { customerId, invoiceId, status } = req.query;
    let q = 'SELECT * FROM dbo.Payments WHERE 1=1';
    if (customerId) q += ` AND CustomerId='${customerId.replace(/'/g, "''")}'`;
    if (invoiceId)  q += ` AND InvoiceId='${invoiceId.replace(/'/g, "''")}'`;
    if (status)     q += ` AND Status='${status.replace(/'/g, "''")}'`;
    q += ' ORDER BY CreatedAt DESC';
    const result = await query(q);
    return success(res, result.recordset);
  } catch (err) {
    logger.error('Get payments:', err);
    return error(res, 'Failed to fetch payments');
  }
};

// GET /payments/:id
const getById = async (req, res) => {
  try {
    const payment = await queryOne(
      'SELECT * FROM dbo.Payments WHERE Id=@id',
      { id: { type: NVarChar(36), value: req.params.id } }
    );
    if (!payment) return error(res, 'Payment not found', 404);
    return success(res, payment);
  } catch (err) {
    logger.error('Get payment:', err);
    return error(res, 'Failed to fetch payment');
  }
};

// GET /payments/outstanding
const getOutstanding = async (req, res) => {
  try {
    const result = await query(`
      SELECT i.*, c.Mobile, c.Email
      FROM dbo.Invoices i
      JOIN dbo.Customers c ON c.Id = i.CustomerId
      WHERE i.PaymentStatus IN ('Pending','Partial')
      ORDER BY i.CreatedAt DESC
    `);
    const total = result.recordset.reduce((s, r) => s + parseFloat(r.Amount || 0), 0);
    return success(res, { invoices: result.recordset, totalOutstanding: total });
  } catch (err) {
    logger.error('Get outstanding:', err);
    return error(res, 'Failed to fetch outstanding payments');
  }
};

module.exports = { recordPayment, getAll, getById, getOutstanding };
