require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  // True on Vercel: no app.listen, no node-cron, no file logging, lazy DB pool.
  isServerless: Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME),

  // Vercel Blob (backups, photos, generated files). Token is injected by the Vercel Blob store.
  blob: {
    token: process.env.BLOB_READ_WRITE_TOKEN,
    storeId: process.env.BLOB_STORE_ID,
  },

  // Shared secret Vercel Cron sends as `Authorization: Bearer <CRON_SECRET>`.
  cronSecret: process.env.CRON_SECRET || '',

  db: {
    server:           process.env.DB_SERVER || 'host.docker.internal',
    port:             parseInt(process.env.DB_PORT) || 1433,
    instance:         process.env.DB_INSTANCE || '',        // 'SQLEXPRESS' or ''
    name:             process.env.DB_NAME || 'DairyFarmDB',
    user:             process.env.DB_USER || 'dairy_app',
    password:         process.env.DB_PASSWORD || 'DairyFarm@2024',
    encrypt:          process.env.DB_ENCRYPT === 'true',
    trustServerCert:  process.env.DB_TRUST_SERVER_CERT !== 'false',
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000,
    requestTimeout:    parseInt(process.env.DB_REQUEST_TIMEOUT) || 15000,
  },

  jwt: {
    secret:    process.env.JWT_SECRET || 'DairyFarmDefaultSecretChangeMe!!',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },

  adminPin: process.env.ADMIN_PIN || '1234',
  staffPin: process.env.STAFF_PIN || '',

  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM,
  },

  sms: {
    // Fast2SMS API key (dashboard -> Dev API). When set, OTPs are sent via Fast2SMS.
    fast2smsApiKey: process.env.FAST2SMS_API_KEY,
  },

  google: {
    clientId:            process.env.GOOGLE_CLIENT_ID,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey:          process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    driveFolderId:       process.env.GOOGLE_DRIVE_FOLDER_ID,
  },

  expo: {
    accessToken: process.env.EXPO_ACCESS_TOKEN,
  },

  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v20.0',
  },

  business: {
    name:    process.env.BUSINESS_NAME    || 'Dairy Farm',
    address: process.env.BUSINESS_ADDRESS || '',
    phone:   process.env.BUSINESS_PHONE   || '',
    gst:     process.env.BUSINESS_GST     || '',
  },
};
