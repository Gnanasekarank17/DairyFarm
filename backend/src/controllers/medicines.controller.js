const { query, queryOne, execute, NVarChar, Decimal, Bit } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId } = require('../utils/helpers');
const logger = require('../config/logger');

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

const ANIMAL_TYPES = ['Cow', 'Goat', 'Hen', 'Duck'];
// Accepts an array (from a multi-select form) or a comma string (round-tripped from storage);
// normalizes to a comma-joined string of only the recognized types, e.g. "Cow,Goat".
const normalizeAnimalTypes = (v) => {
  const list = Array.isArray(v) ? v : String(v || '').split(',');
  const valid = list.map((t) => String(t).trim()).filter((t) => ANIMAL_TYPES.includes(t));
  return valid.length ? [...new Set(valid)].join(',') : null;
};

// GET /medicines?active=&animalType=
const getAll = async (req, res) => {
  try {
    const { active: activeFilter, animalType } = req.query;
    const clauses = [];
    if (activeFilter === 'true') clauses.push('IsActive = 1');
    if (activeFilter === 'false') clauses.push('IsActive = 0');
    if (animalType) clauses.push(`AnimalTypes LIKE '%${String(animalType).replace(/'/g, "''")}%'`);
    let qStr = 'SELECT * FROM dbo.MedicineMaster';
    if (clauses.length) qStr += ' WHERE ' + clauses.join(' AND ');
    qStr += ' ORDER BY Name';
    const result = await query(qStr);
    return success(res, result.recordset);
  } catch (err) {
    logger.error('Get medicines:', err);
    return error(res, 'Failed to fetch medicines');
  }
};

// GET /medicines/:id
const getById = async (req, res) => {
  try {
    const medicine = await queryOne('SELECT * FROM dbo.MedicineMaster WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    if (!medicine) return error(res, 'Medicine not found', 404);
    return success(res, medicine);
  } catch (err) {
    logger.error('Get medicine:', err);
    return error(res, 'Failed to fetch medicine');
  }
};

// POST /medicines
const create = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return error(res, 'Medicine name is required', 400);

    const existing = await queryOne('SELECT Id FROM dbo.MedicineMaster WHERE Name=@name', {
      name: { type: NVarChar(150), value: name },
    });
    if (existing) return error(res, 'A medicine with this name already exists', 409);

    const id = generateId();
    const now = new Date().toISOString();
    await execute(`
      INSERT INTO dbo.MedicineMaster (Id,Name,DosageMg,Purpose,Comments,AnimalTypes,IsActive,CreatedAt,UpdatedAt)
      VALUES (@id,@name,@dosage,@purpose,@comments,@animalTypes,1,@now,@now)
    `, {
      id: { type: NVarChar(36), value: id },
      name: { type: NVarChar(150), value: name },
      dosage: { type: Decimal(10, 2), value: req.body.dosageMg !== undefined && req.body.dosageMg !== '' ? num(req.body.dosageMg) : null },
      purpose: { type: NVarChar(300), value: req.body.purpose ? String(req.body.purpose).trim() : null },
      comments: { type: NVarChar(500), value: req.body.comments ? String(req.body.comments).trim() : null },
      animalTypes: { type: NVarChar(100), value: normalizeAnimalTypes(req.body.animalTypes) },
      now: { type: NVarChar(30), value: now },
    });

    const created = await queryOne('SELECT * FROM dbo.MedicineMaster WHERE Id=@id', {
      id: { type: NVarChar(36), value: id },
    });
    return success(res, created, 'Medicine added', 201);
  } catch (err) {
    logger.error('Create medicine:', err);
    return error(res, 'Failed to add medicine');
  }
};

// PUT /medicines/:id
const update = async (req, res) => {
  try {
    const existing = await queryOne('SELECT Id FROM dbo.MedicineMaster WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    if (!existing) return error(res, 'Medicine not found', 404);

    const name = String(req.body.name || '').trim();
    if (!name) return error(res, 'Medicine name is required', 400);

    const duplicate = await queryOne('SELECT Id FROM dbo.MedicineMaster WHERE Name=@name AND Id<>@id', {
      name: { type: NVarChar(150), value: name },
      id: { type: NVarChar(36), value: req.params.id },
    });
    if (duplicate) return error(res, 'A medicine with this name already exists', 409);

    await execute(`
      UPDATE dbo.MedicineMaster SET
        Name=@name, DosageMg=@dosage, Purpose=@purpose, Comments=@comments, AnimalTypes=@animalTypes, UpdatedAt=@now
      WHERE Id=@id
    `, {
      id: { type: NVarChar(36), value: req.params.id },
      name: { type: NVarChar(150), value: name },
      dosage: { type: Decimal(10, 2), value: req.body.dosageMg !== undefined && req.body.dosageMg !== '' ? num(req.body.dosageMg) : null },
      purpose: { type: NVarChar(300), value: req.body.purpose ? String(req.body.purpose).trim() : null },
      comments: { type: NVarChar(500), value: req.body.comments ? String(req.body.comments).trim() : null },
      animalTypes: { type: NVarChar(100), value: normalizeAnimalTypes(req.body.animalTypes) },
      now: { type: NVarChar(30), value: new Date().toISOString() },
    });

    const updated = await queryOne('SELECT * FROM dbo.MedicineMaster WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    return success(res, updated, 'Medicine updated');
  } catch (err) {
    logger.error('Update medicine:', err);
    return error(res, 'Failed to update medicine');
  }
};

// PATCH /medicines/:id/toggle
const toggleActive = async (req, res) => {
  try {
    const medicine = await queryOne('SELECT Id,IsActive FROM dbo.MedicineMaster WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    if (!medicine) return error(res, 'Medicine not found', 404);

    await execute('UPDATE dbo.MedicineMaster SET IsActive=@active, UpdatedAt=@now WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
      active: { type: Bit, value: !medicine.IsActive },
      now: { type: NVarChar(30), value: new Date().toISOString() },
    });
    return success(res, null, 'Medicine updated');
  } catch (err) {
    logger.error('Toggle medicine:', err);
    return error(res, 'Failed to update medicine');
  }
};

// DELETE /medicines/:id
const remove = async (req, res) => {
  try {
    const existing = await queryOne('SELECT Id FROM dbo.MedicineMaster WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    if (!existing) return error(res, 'Medicine not found', 404);

    await execute('DELETE FROM dbo.MedicineMaster WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    return success(res, null, 'Medicine deleted');
  } catch (err) {
    logger.error('Delete medicine:', err);
    return error(res, 'Failed to delete medicine');
  }
};

module.exports = { getAll, getById, create, update, toggleActive, remove };
