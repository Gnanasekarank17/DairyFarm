const axios = require('axios');
const logger = require('../../config/logger');
const { query, NVarChar } = require('../../database/db');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Returns active push tokens for the given role ids (normalized lowercase).
const getTokensByRoles = async (roles = []) => {
  if (!roles.length) return [];
  const params = {};
  const placeholders = roles.map((role, index) => {
    const key = `role${index}`;
    params[key] = { type: NVarChar(50), value: String(role).toLowerCase() };
    return `@${key}`;
  });
  try {
    const result = await query(
      `SELECT PushToken FROM dbo.Users
       WHERE IsActive=1 AND PushToken IS NOT NULL AND PushToken <> ''
         AND LOWER(Role) IN (${placeholders.join(',')})`,
      params
    );
    return result.recordset.map((u) => u.PushToken).filter(Boolean);
  } catch (err) {
    logger.error('Get tokens by roles error:', err);
    return [];
  }
};

const sendPush = async (tokens, title, body, data = {}) => {
  if (!tokens || tokens.length === 0) return;

  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
  }));

  try {
    const response = await axios.post(EXPO_PUSH_URL, messages, {
      headers: { 'Content-Type': 'application/json' },
    });
    logger.info('Push notification sent:', response.data);
    return response.data;
  } catch (err) {
    logger.error('Push notification error:', err);
  }
};

module.exports = { sendPush, getTokensByRoles };
