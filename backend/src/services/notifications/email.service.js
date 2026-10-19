const nodemailer = require('nodemailer');
const config = require('../../config');
const logger = require('../../config/logger');

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: { user: config.email.user, pass: config.email.pass },
});

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const info = await transporter.sendMail({
      from: `"${config.business.name}" <${config.email.from}>`,
      to,
      subject,
      html,
      attachments,
    });
    logger.info('Email sent:', info.messageId);
    return info;
  } catch (err) {
    logger.error('Email send error:', err);
    throw err;
  }
};

const invoiceEmailTemplate = (invoice, business) => `
<html><body style="font-family:Arial,sans-serif;color:#333">
  <div style="max-width:600px;margin:auto;border:1px solid #ddd;border-radius:8px;overflow:hidden">
    <div style="background:#2563eb;color:#fff;padding:20px;text-align:center">
      <h2>${business.name}</h2>
      <p>${business.address} | GST: ${business.gst}</p>
    </div>
    <div style="padding:20px">
      <h3>Invoice: ${invoice.invoiceNumber}</h3>
      <table width="100%" style="border-collapse:collapse">
        <tr><td><strong>Customer:</strong></td><td>${invoice.customerName}</td></tr>
        <tr><td><strong>Month:</strong></td><td>${invoice.month}/${invoice.year}</td></tr>
        <tr><td><strong>Daily Quantity:</strong></td><td>${invoice.dailyQuantity} L</td></tr>
        <tr><td><strong>Rate:</strong></td><td>₹${invoice.ratePerLiter}/L</td></tr>
        <tr><td><strong>Delivered Days:</strong></td><td>${invoice.deliveredDays}</td></tr>
        <tr><td><strong>Missed Days:</strong></td><td>${invoice.missedDays}</td></tr>
        <tr><td><strong>Total Quantity:</strong></td><td>${invoice.totalQuantity} L</td></tr>
        <tr style="background:#f0fdf4"><td><strong>Amount Due:</strong></td><td><strong>₹${invoice.amount}</strong></td></tr>
      </table>
      <p style="margin-top:20px;color:#6b7280">Please pay at the earliest. Thank you!</p>
    </div>
  </div>
</body></html>`;

module.exports = { sendEmail, invoiceEmailTemplate };
