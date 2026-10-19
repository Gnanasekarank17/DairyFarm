const sql = require('mssql');
const config = require('../config');
const logger = require('../config/logger');

const poolConfig = {
  server: config.db.server,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  options: {
    instanceName: config.db.instance || undefined,
    encrypt: config.db.encrypt,
    trustServerCertificate: config.db.trustServerCert,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: config.db.connectionTimeout,
  requestTimeout: config.db.requestTimeout,
};

let pool = null;

const getPool = async () => {
  if (pool && pool.connected) return pool;
  try {
    pool = await sql.connect(poolConfig);
    logger.info(`✅ Connected to SQL Server: ${config.db.server} / ${config.db.name}`);
    return pool;
  } catch (err) {
    logger.error('SQL Server connection failed:', err.message);
    throw err;
  }
};

// Helper – run a parameterised query and return recordset
const query = async (queryStr, params = {}) => {
  const conn = await getPool();
  const req = conn.request();
  Object.entries(params).forEach(([key, { type, value }]) => {
    req.input(key, type, value);
  });
  return req.query(queryStr);
};

// Helper – run for single row
const queryOne = async (queryStr, params = {}) => {
  const result = await query(queryStr, params);
  return result.recordset[0] || null;
};

// Helper – execute (INSERT/UPDATE/DELETE)
const execute = async (queryStr, params = {}) => {
  const result = await query(queryStr, params);
  return result.rowsAffected[0];
};

// Re-export sql types for use in controllers
const { VarChar, NVarChar, Int, SmallInt, TinyInt, Bit, Decimal, Date, DateTime2, Float } = sql;

module.exports = { getPool, query, queryOne, execute, sql, VarChar, NVarChar, Int, SmallInt, TinyInt, Bit, Decimal, Date, DateTime2, Float };
