const fs = require('fs');
const winston = require('winston');

// Vercel's filesystem is read-only (except /tmp), so file transports are only
// enabled when running as a long-lived server with a writable logs/ directory.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      isServerless ? winston.format.uncolorize() : winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

if (!isServerless && process.env.LOG_TO_FILE !== 'false') {
  try {
    fs.mkdirSync('logs', { recursive: true });
    transports.push(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
    transports.push(new winston.transports.File({ filename: 'logs/combined.log' }));
  } catch {
    // read-only filesystem: console only
  }
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
});

module.exports = logger;
