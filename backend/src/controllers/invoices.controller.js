const PDFDocument = require('pdfkit');
const { query, queryOne, execute, NVarChar, SmallInt, TinyInt, Decimal, sql } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const logger = require('../config/logger');
const config = require('../config');
const { generateWhatsAppLink, sendWhatsApp } = require('../services/notifications/whatsapp.service');
const { calculateCustomerMonthBill } = require('../services/billing.service');
const { guardMonthWrite } = require('../utils/monthLock');
const { buildInvoicePdf } = require('../services/invoicePdf.service');

const generateInvoiceNumber = (customerId, year, month) =>
  `INV-${year}${String(month).padStart(2, '0')}-${customerId.slice(-6).toUpperCase()}`;

const formatInvoiceAmount = (amount) => parseFloat(amount || 0).toFixed(2);

const formatMonthName = (year, month) =>
  new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

const buildInvoiceMessage = (inv) => {
  const monthName = formatMonthName(inv.Year, inv.Month);
  const deliveryCharge = parseFloat(inv.DeliveryCharge || 0);
  const milkAmount = parseFloat(inv.Amount || 0) - deliveryCharge;
  const deliveryLine = deliveryCharge > 0
    ? `Milk Amount: Rs. ${formatInvoiceAmount(milkAmount)}\n` +
      `Delivery Charge: Rs. ${formatInvoiceAmount(deliveryCharge)}\n`
    : '';
  return `Dear ${inv.CustomerName},\n\n` +
    `Your milk bill for ${monthName}:\n` +
    `Invoice: ${inv.InvoiceNumber}\n` +
    `Delivered: ${inv.DeliveredDays} days\n` +
    `Missed: ${inv.MissedDays} days\n` +
    `Total Qty: ${parseFloat(inv.TotalQuantity || 0).toFixed(2)} L\n` +
    deliveryLine +
    `Total Amount: Rs. ${formatInvoiceAmount(inv.Amount)}\n` +
    `Status: ${inv.PaymentStatus}\n\n` +
    `Please pay the total amount. Thank you.\n- ${config.business.name}`;
};

const buildMessageLinks = (inv, mobile) => {
  const phone = (mobile || '').replace(/\D/g, '');
  const phoneWithCountry = phone.length === 10 ? `91${phone}` : phone;
  const message = buildInvoiceMessage(inv);
  const encodedMessage = encodeURIComponent(message);

  return {
    invoiceId: inv.Id,
    invoiceNumber: inv.InvoiceNumber,
    customerName: inv.CustomerName,
    mobile: phone,
    amount: formatInvoiceAmount(inv.Amount),
    message,
    whatsappUrl: phoneWithCountry ? generateWhatsAppLink(phoneWithCountry, message) : null,
    smsUrl: phoneWithCountry ? `sms:+${phoneWithCountry}?body=${encodedMessage}` : null,
  };
};

// POST /invoices/generate
const generateForMonth = async (req, res) => {
  try {
    const { year, month, customerId } = req.body;
    const y = parseInt(year);
    const m = parseInt(month);

    const lock = await guardMonthWrite({
      user: req.user, year: y, month: m, ip: req.ip,
      module: 'Invoices', entityId: `${y}-${String(m).padStart(2, '0')}`, action: 'CLOSED_MONTH_INVOICE_REGEN',
      reason: 'Invoice generation on closed period',
    });
    if (!lock.allowed) return error(res, 'This billing month is closed. Regeneration requires admin authorization.', 423);

    const customers = (await query(
      `SELECT * FROM dbo.Customers WHERE IsActive=1${customerId ? ' AND Id=@customerId' : ''}`,
      customerId ? { customerId: { type: NVarChar(36), value: customerId } } : {}
    )).recordset;
    const created = [];

    for (const c of customers) {
      const existing = await queryOne(
        'SELECT Id,InvoiceNumber,Amount,PaymentStatus FROM dbo.Invoices WHERE CustomerId=@cid AND [Year]=@y AND [Month]=@m',
        {
          cid: { type: NVarChar(36), value: c.Id },
          y:   { type: SmallInt,     value: y },
          m:   { type: TinyInt,      value: m },
        }
      );
      const bill = await calculateCustomerMonthBill(c, y, m);
      const missedDetails = bill.missedDetails;

      const id    = generateId();
      const invNo = generateInvoiceNumber(c.Id, y, m);

      if (existing) {
        await execute(`
          UPDATE dbo.Invoices SET DailyQuantity=@qty, RatePerLiter=@rate,
            DeliveredDays=@dd, MissedDays=@md, TotalQuantity=@tq, Amount=@amount,
            DeliveryCharge=@delivery, MissedDetails=@missed, UpdatedAt=@now
          WHERE Id=@id
        `, {
          id:     { type: NVarChar(36),      value: existing.Id },
          qty:    { type: Decimal(8, 2),     value: bill.dailyQuantity },
          rate:   { type: Decimal(8, 2),     value: bill.ratePerLiter },
          dd:     { type: SmallInt,          value: bill.deliveredDays },
          md:     { type: SmallInt,          value: bill.missedDays },
          tq:     { type: Decimal(10, 2),    value: bill.totalQuantity },
          amount: { type: Decimal(12, 2),    value: bill.amount },
          delivery: { type: Decimal(10, 2),  value: bill.deliveryCharge },
          missed: { type: NVarChar(sql.MAX), value: JSON.stringify({ missed: missedDetails, extras: bill.extraDetails, cutoffDate: bill.cutoffDate }) },
          now:    { type: NVarChar(20),      value: today() },
        });
        created.push({ id: existing.Id, invNo: existing.InvoiceNumber, customerName: c.Name, amount: bill.amount, recalculated: true });
        continue;
      }

      await execute(`
        INSERT INTO dbo.Invoices
          (Id,InvoiceNumber,CustomerId,CustomerName,[Year],[Month],
           DailyQuantity,RatePerLiter,DeliveredDays,MissedDays,
           TotalQuantity,Amount,DeliveryCharge,PaymentStatus,MissedDetails,CreatedAt,UpdatedAt)
        VALUES
          (@id,@invNo,@cid,@cname,@y,@m,
           @qty,@rate,@dd,@md,
           @tq,@amount,@delivery,'Pending',@missed,@now,@now)
      `, {
        id:     { type: NVarChar(36),      value: id },
        invNo:  { type: NVarChar(50),      value: invNo },
        cid:    { type: NVarChar(36),      value: c.Id },
        cname:  { type: NVarChar(150),     value: c.Name },
        y:      { type: SmallInt,          value: y },
        m:      { type: TinyInt,           value: m },
        qty:    { type: Decimal(8, 2),     value: parseFloat(c.DailyQuantity || 0) },
        rate:   { type: Decimal(8, 2),     value: parseFloat(c.RatePerLiter || 0) },
        dd:     { type: SmallInt,          value: bill.deliveredDays },
        md:     { type: SmallInt,          value: bill.missedDays },
        tq:     { type: Decimal(10, 2),    value: bill.totalQuantity },
        amount: { type: Decimal(12, 2),    value: bill.amount },
        delivery: { type: Decimal(10, 2),  value: bill.deliveryCharge },
        missed: { type: NVarChar(sql.MAX), value: JSON.stringify({ missed: missedDetails, extras: bill.extraDetails, cutoffDate: bill.cutoffDate }) },
        now:    { type: NVarChar(20),      value: today() },
      });

      created.push({ id, invNo, customerName: c.Name, amount: bill.amount, recalculated: false });
    }

    return success(res, { generated: created.length, invoices: created }, 'Invoices generated');
  } catch (err) {
    logger.error('Generate invoices:', err);
    return error(res, 'Failed to generate invoices');
  }
};

// GET /invoices
const getAll = async (req, res) => {
  try {
    const { year, month, status, customerId } = req.query;
    let q = 'SELECT * FROM dbo.Invoices WHERE 1=1';
    if (year)       q += ` AND [Year]=${parseInt(year)}`;
    if (month)      q += ` AND [Month]=${parseInt(month)}`;
    if (status)     q += ` AND PaymentStatus='${status.replace(/'/g, "''")}'`;
    if (customerId) q += ` AND CustomerId='${customerId.replace(/'/g, "''")}'`;
    q += ' ORDER BY CreatedAt DESC';
    const result = await query(q);
    return success(res, result.recordset);
  } catch (err) {
    logger.error('Get invoices:', err);
    return error(res, 'Failed to fetch invoices');
  }
};

// GET /invoices/:id
const getById = async (req, res) => {
  try {
    const inv = await queryOne(
      'SELECT * FROM dbo.Invoices WHERE Id=@id',
      { id: { type: NVarChar(36), value: req.params.id } }
    );
    if (!inv) return error(res, 'Invoice not found', 404);
    return success(res, inv);
  } catch (err) {
    logger.error('Get invoice:', err);
    return error(res, 'Failed to fetch invoice');
  }
};

// GET /invoices/:id/pdf — professional A4 invoice (see services/invoicePdf.service.js)
const downloadPDF = async (req, res) => {
  try {
    const pdf = await buildInvoicePdf(req.params.id);
    if (!pdf) return error(res, 'Invoice not found', 404);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdf.filename}"`);
    res.setHeader('Content-Length', pdf.buffer.length);
    return res.end(pdf.buffer);
  } catch (err) {
    logger.error('PDF generation:', err);
    return error(res, 'Failed to generate PDF');
  }
};

// GET /invoices/:id/whatsapp
const getWhatsAppLink = async (req, res) => {
  try {
    const inv = await queryOne(
      'SELECT * FROM dbo.Invoices WHERE Id=@id',
      { id: { type: NVarChar(36), value: req.params.id } }
    );
    if (!inv) return error(res, 'Invoice not found', 404);

    const customer = await queryOne(
      'SELECT Mobile FROM dbo.Customers WHERE Id=@id',
      { id: { type: NVarChar(36), value: inv.CustomerId } }
    );

    const links = buildMessageLinks(inv, customer?.Mobile);

    return success(res, {
      url: links.whatsappUrl,
      link: links.whatsappUrl,
      smsUrl: links.smsUrl,
      mobile: links.mobile,
      invoiceNumber: inv.InvoiceNumber,
      message: links.message,
    });
  } catch (err) {
    logger.error('WhatsApp link:', err);
    return error(res, 'Failed to generate WhatsApp link');
  }
};

// GET /invoices/month/:year/:month/message-links
const getMonthlyMessageLinks = async (req, res) => {
  try {
    const y = parseInt(req.params.year);
    const m = parseInt(req.params.month);

    const invoices = (await query(`
      SELECT i.*, c.Mobile
      FROM dbo.Invoices i
      JOIN dbo.Customers c ON c.Id = i.CustomerId
      WHERE i.[Year]=@y AND i.[Month]=@m
      ORDER BY i.CustomerName
    `, {
      y: { type: SmallInt, value: y },
      m: { type: TinyInt, value: m },
    })).recordset;

    const messages = invoices.map((inv) => buildMessageLinks(inv, inv.Mobile));
    const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.Amount || 0), 0);

    return success(res, {
      year: y,
      month: m,
      monthName: formatMonthName(y, m),
      count: messages.length,
      totalAmount: formatInvoiceAmount(totalAmount),
      messages,
    });
  } catch (err) {
    logger.error('Monthly invoice message links:', err);
    return error(res, 'Failed to generate monthly invoice messages');
  }
};

// POST /invoices/month/:year/:month/send-whatsapp
const sendMonthlyWhatsApp = async (req, res) => {
  try {
    const y = parseInt(req.params.year);
    const m = parseInt(req.params.month);

    const invoices = (await query(`
      SELECT i.*, c.Mobile
      FROM dbo.Invoices i
      JOIN dbo.Customers c ON c.Id = i.CustomerId
      WHERE i.[Year]=@y AND i.[Month]=@m
      ORDER BY i.CustomerName
    `, {
      y: { type: SmallInt, value: y },
      m: { type: TinyInt, value: m },
    })).recordset;

    const results = [];
    for (const inv of invoices) {
      const links = buildMessageLinks(inv, inv.Mobile);
      if (!links.mobile) {
        results.push({ ...links, sent: false, skipped: true, error: 'Customer mobile number missing' });
        continue;
      }

      const phoneWithCountry = links.mobile.length === 10 ? `91${links.mobile}` : links.mobile;
      const result = await sendWhatsApp(phoneWithCountry, links.message);
      results.push({ ...links, sent: Boolean(result.sent), skipped: false, providerResponse: result });
    }

    const sent = results.filter((item) => item.sent).length;
    const skipped = results.filter((item) => item.skipped).length;
    const failed = results.length - sent - skipped;
    const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.Amount || 0), 0);

    return success(res, {
      year: y,
      month: m,
      monthName: formatMonthName(y, m),
      sent,
      failed,
      skipped,
      totalAmount: formatInvoiceAmount(totalAmount),
      results,
    }, sent > 0 ? 'WhatsApp invoice messages sent' : 'WhatsApp messages prepared');
  } catch (err) {
    logger.error('Send monthly WhatsApp invoices:', err);
    return error(res, 'Failed to send monthly WhatsApp invoice messages');
  }
};

module.exports = { generateForMonth, getAll, getById, downloadPDF, getWhatsAppLink, getMonthlyMessageLinks, sendMonthlyWhatsApp };
