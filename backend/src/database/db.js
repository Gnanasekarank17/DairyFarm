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
    // Serverless instances are short-lived: keep the pool small and let it drain.
    max: config.isServerless ? 4 : 10,
    min: config.isServerless ? 0 : 2,
    idleTimeoutMillis: config.isServerless ? 10000 : 30000,
  },
  connectionTimeout: config.db.connectionTimeout,
  requestTimeout: config.db.requestTimeout,
};

let pool = null;
let connecting = null;

const getPool = async () => {
  if (pool && pool.connected) return pool;
  // De-duplicate concurrent cold-start connections (serverless fan-in).
  if (connecting) return connecting;
  connecting = (async () => {
    try {
      const p = new sql.ConnectionPool(poolConfig);
      p.on('error', (err) => {
        logger.error('SQL Server pool error:', err.message);
        pool = null;
      });
      pool = await p.connect();
      logger.info(`✅ Connected to SQL Server: ${config.db.server} / ${config.db.name}`);
      return pool;
    } catch (err) {
      pool = null;
      logger.error('SQL Server connection failed:', err.message);
      throw err;
    } finally {
      connecting = null;
    }
  })();
  return connecting;
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
