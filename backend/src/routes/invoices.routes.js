const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/invoices.controller');
const emailService = require('../services/notifications/email.service');
const { queryOne, NVarChar } = require('../database/db');
const config = require('../config');
const { success, error } = require('../utils/response');
const { buildInvoicePdf } = require('../services/invoicePdf.service');

router.use(authenticate);

// Generate invoices for a month
router.post('/generate', requirePermission(PERMISSIONS.BILLING_MANAGE), c.generateForMonth);

// Monthly WhatsApp/SMS message links
router.get('/month/:year/:month/message-links', requirePermission(PERMISSIONS.BILLING_VIEW), c.getMonthlyMessageLinks);
router.post('/month/:year/:month/send-whatsapp', requirePermission(PERMISSIONS.BILLING_MANAGE), c.sendMonthlyWhatsApp);

// List / get invoices
router.get('/', requirePermission(PERMISSIONS.BILLING_VIEW), c.getAll);
router.get('/:id', requirePermission(PERMISSIONS.BILLING_VIEW), c.getById);

// Download PDF
router.get('/:id/pdf', requirePermission(PERMISSIONS.BILLING_VIEW), c.downloadPDF);

// Email invoice to customer
router.post('/:id/email', requirePermission(PERMISSIONS.BILLING_MANAGE), async (req, res) => {
  try {
    const pdf = await buildInvoicePdf(req.params.id);
    if (!pdf) return error(res, 'Invoice not found', 404);
    const { invoice: inv, customer, business } = pdf;
    if (!customer?.Email) return error(res, 'Customer email not found', 400);

    const monthName = new Date(inv.Year, inv.Month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    const amount = parseFloat(inv.Amount || 0).toFixed(2);
    const html = `
      <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;color:#1F2937">
        <div style="background:#0D3B2E;color:#fff;padding:18px 22px;border-radius:12px 12px 0 0">
          <div style="font-size:18px;font-weight:700">${business.name}</div>
          <div style="font-size:12px;color:#A7F3D0">Milk invoice for ${monthName}</div>
        </div>
        <div style="border:1px solid #E2E8F0;border-top:0;padding:20px 22px;border-radius:0 0 12px 12px">
          <p>Dear ${inv.CustomerName},</p>
          <p>Please find attached your invoice <strong>${inv.InvoiceNumber}</strong> for ${monthName}.</p>
          <table style="border-collapse:collapse;width:100%;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748B">Delivered days</td><td style="text-align:right">${inv.DeliveredDays}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Missed days</td><td style="text-align:right">${inv.MissedDays}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Total quantity</td><td style="text-align:right">${parseFloat(inv.TotalQuantity).toFixed(2)} L</td></tr>
            <tr><td style="padding:10px 0;font-weight:700;border-top:1px solid #E2E8F0">Amount due</td><td style="padding:10px 0;text-align:right;font-weight:700;border-top:1px solid #E2E8F0">&#8377;${amount}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Payment status</td><td style="text-align:right">${inv.PaymentStatus}</td></tr>
          </table>
          <p style="font-size:12px;color:#64748B;margin-top:18px">
            ${business.name}${business.phone ? ` &bull; ${business.phone}` : ''}${business.email ? ` &bull; ${business.email}` : ''}${business.gst ? `<br/>GSTIN: ${business.gst}` : ''}
          </p>
        </div>
      </div>
    `;

    await emailService.sendEmail(
      customer.Email,
      `Invoice ${inv.InvoiceNumber} — ${business.name} (${monthName})`,
      html,
      [{ filename: pdf.filename, content: pdf.buffer, contentType: 'application/pdf' }],
    );
    return success(res, null, 'Invoice emailed successfully');
  } catch (err) {
    return error(res, 'Failed to send email');
  }
});

// WhatsApp sharing link
router.get('/:id/whatsapp', requirePermission(PERMISSIONS.BILLING_VIEW), c.getWhatsAppLink);

module.exports = router;
