const axios = require('axios');
const config = require('../../config');
const logger = require('../../config/logger');

// Generates a WhatsApp pre-filled message link (no API required)
const generateWhatsAppLink = (phone, message) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
};

const sendWhatsApp = async (phone, message) => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!config.whatsapp.accessToken || !config.whatsapp.phoneNumberId) {
    logger.info('WhatsApp API not configured, returning link');
    return { sent: false, link: generateWhatsAppLink(cleanPhone, message) };
  }

  try {
    const url = `https://graph.facebook.com/${config.whatsapp.apiVersion}/${config.whatsapp.phoneNumberId}/messages`;
    const response = await axios.post(url, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: message,
      },
    }, {
      headers: {
        Authorization: `Bearer ${config.whatsapp.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return { sent: true, provider: 'whatsapp-cloud', data: response.data };
  } catch (err) {
    logger.error('WhatsApp send error:', err.response?.data || err.message);
    return { sent: false, error: err.response?.data || err.message, link: generateWhatsAppLink(cleanPhone, message) };
  }
};

const invoiceWhatsAppMessage = (invoice, business) =>
  `*${business.name}*\n\n` +
  `Invoice: ${invoice.invoiceNumber}\n` +
  `Month: ${invoice.month}/${invoice.year}\n` +
  `Delivered Days: ${invoice.deliveredDays}\n` +
  `Missed Days: ${invoice.missedDays}\n` +
  `Total Qty: ${invoice.totalQuantity} L\n` +
  `*Amount Due: ₹${invoice.amount}*\n\n` +
  `Please pay at your earliest convenience. Thank you!`;

module.exports = { generateWhatsAppLink, sendWhatsApp, invoiceWhatsAppMessage };
