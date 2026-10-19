const { query, queryOne, execute, NVarChar, Decimal, sql } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const logger = require('../config/logger');

// Shared CRUD for simple, single-table animal master records (Goat/Hen/Duck) — herd/flock
// inventory only. Unlike CowMaster, these have no breeding/pregnancy/milk pipeline wired up.
function createAnimalMasterController(tableName, label) {
  const table = `dbo.${tableName}`;

  const getAll = async (req, res) => {
    try {
      const { status } = req.query;
      let q = `SELECT * FROM ${table}`;
      if (status) q += ` WHERE CurrentStatus='${String(status).replace(/'/g, "''")}'`;
      q += ' ORDER BY Name';
      const result = await query(q);
      return success(res, result.recordset);
    } catch (err) {
      logger.error(`Get ${label}s:`, err);
      return error(res, `Failed to fetch ${label}s`);
    }
  };

  const getById = async (req, res) => {
    try {
      const record = await queryOne(`SELECT * FROM ${table} WHERE Id=@id`, {
        id: { type: NVarChar(36), value: req.params.id },
      });
      if (!record) return error(res, `${label} not found`, 404);
      return success(res, record);
    } catch (err) {
      logger.error(`Get ${label}:`, err);
      return error(res, `Failed to fetch ${label}`);
    }
  };

  const create = async (req, res) => {
    try {
      const b = req.body;
      const id = generateId();
      const now = today();
      await execute(`
        INSERT INTO ${table}
          (Id,Name,TagNumber,Breed,Color,DateOfBirth,PurchaseDate,PurchaseCost,CurrentStatus,PhotoUrl,Notes,CreatedAt,UpdatedAt)
        VALUES
          (@id,@name,@tag,@breed,@color,@dob,@pDate,@pCost,@status,@photo,@notes,@now,@now)
      `, {
        id:     { type: NVarChar(36),      value: id },
        name:   { type: NVarChar(100),     value: b.name },
        tag:    { type: NVarChar(50),      value: b.tagNumber || '' },
        breed:  { type: NVarChar(100),     value: b.breed || '' },
        color:  { type: NVarChar(50),      value: b.color || '' },
        dob:    { type: NVarChar(50),      value: b.dateOfBirth || '' },
        pDate:  { type: NVarChar(50),      value: b.purchaseDate || '' },
        pCost:  { type: Decimal(10, 2),    value: parseFloat(b.purchaseCost || 0) },
        status: { type: NVarChar(50),      value: b.currentStatus || 'Active' },
        photo:  { type: NVarChar(500),     value: b.photoUrl || '' },
        notes:  { type: NVarChar(sql.MAX), value: b.notes || '' },
        now:    { type: NVarChar(20),      value: now },
      });
      const created = await queryOne(`SELECT * FROM ${table} WHERE Id=@id`, { id: { type: NVarChar(36), value: id } });
      return success(res, created, `${label} added`, 201);
    } catch (err) {
      logger.error(`Create ${label}:`, err);
      return error(res, `Failed to add ${label}`);
    }
  };

  const update = async (req, res) => {
    try {
      const existing = await queryOne(`SELECT Id FROM ${table} WHERE Id=@id`, { id: { type: NVarChar(36), value: req.params.id } });
      if (!existing) return error(res, `${label} not found`, 404);

      const b = req.body;
      await execute(`
        UPDATE ${table} SET
          Name=@name, TagNumber=@tag, Breed=@breed, Color=@color,
          DateOfBirth=@dob, PurchaseDate=@pDate, PurchaseCost=@pCost,
          CurrentStatus=@status, PhotoUrl=@photo, Notes=@notes, UpdatedAt=@now
        WHERE Id=@id
      `, {
        id:     { type: NVarChar(36),      value: req.params.id },
        name:   { type: NVarChar(100),     value: b.name },
        tag:    { type: NVarChar(50),      value: b.tagNumber || '' },
        breed:  { type: NVarChar(100),     value: b.breed || '' },
        color:  { type: NVarChar(50),      value: b.color || '' },
        dob:    { type: NVarChar(50),      value: b.dateOfBirth || '' },
        pDate:  { type: NVarChar(50),      value: b.purchaseDate || '' },
        pCost:  { type: Decimal(10, 2),    value: parseFloat(b.purchaseCost || 0) },
        status: { type: NVarChar(50),      value: b.currentStatus || 'Active' },
        photo:  { type: NVarChar(500),     value: b.photoUrl || '' },
        notes:  { type: NVarChar(sql.MAX), value: b.notes || '' },
        now:    { type: NVarChar(20),      value: today() },
      });
      const updated = await queryOne(`SELECT * FROM ${table} WHERE Id=@id`, { id: { type: NVarChar(36), value: req.params.id } });
      return success(res, updated, `${label} updated`);
    } catch (err) {
      logger.error(`Update ${label}:`, err);
      return error(res, `Failed to update ${label}`);
    }
  };

  const remove = async (req, res) => {
    try {
      const rows = await execute(`DELETE FROM ${table} WHERE Id=@id`, { id: { type: NVarChar(36), value: req.params.id } });
      if (!rows) return error(res, `${label} not found`, 404);
      return success(res, null, `${label} removed`);
    } catch (err) {
      logger.error(`Delete ${label}:`, err);
      return error(res, `Failed to delete ${label}`);
    }
  };

  return { getAll, getById, create, update, remove };
}

module.exports = { createAnimalMasterController };
