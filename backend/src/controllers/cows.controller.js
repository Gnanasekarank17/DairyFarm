const { query, queryOne, execute, NVarChar, Decimal, sql } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const logger = require('../config/logger');

// Female = milk-producing / breedable; Male = bull (mating only).
const normalizeGender = (g) => (String(g || '').trim().toLowerCase() === 'male' ? 'Male' : 'Female');

// Goat/Hen/Duck live in their own master tables (GoatMaster/HenMaster/DuckMaster) — CowMaster
// only holds the two dairy animals that share the breeding/pregnancy/milk pipeline.
const ANIMAL_TYPES = ['Cow', 'Buffalo'];
const normalizeAnimalType = (t) => {
  const match = ANIMAL_TYPES.find((type) => type.toLowerCase() === String(t || '').trim().toLowerCase());
  return match || 'Cow';
};

// GET /cows
const getAll = async (req, res) => {
  try {
    const { status, gender, animalType } = req.query;
    const clauses = [];
    if (status) clauses.push(`CurrentStatus='${String(status).replace(/'/g, "''")}'`);
    if (gender) clauses.push(`Gender='${normalizeGender(gender).replace(/'/g, "''")}'`);
    if (animalType) clauses.push(`AnimalType='${normalizeAnimalType(animalType).replace(/'/g, "''")}'`);
    let q = 'SELECT * FROM dbo.CowMaster';
    if (clauses.length) q += ' WHERE ' + clauses.join(' AND ');
    q += ' ORDER BY Name';
    const result = await query(q);
    return success(res, result.recordset);
  } catch (err) {
    logger.error('Get cows:', err);
    return error(res, 'Failed to fetch cows');
  }
};

// GET /cows/:id
const getById = async (req, res) => {
  try {
    const cow = await queryOne(
      'SELECT * FROM dbo.CowMaster WHERE Id=@id',
      { id: { type: NVarChar(36), value: req.params.id } }
    );
    if (!cow) return error(res, 'Cow not found', 404);

    const healthRecords = (await query(
      'SELECT * FROM dbo.HealthRecords WHERE CowId=@id ORDER BY RecordDate DESC',
      { id: { type: NVarChar(36), value: req.params.id } }
    )).recordset;

    const milkProduction = (await query(
      'SELECT TOP 30 * FROM dbo.MilkProduction WHERE CowId=@id ORDER BY ProductionDate DESC',
      { id: { type: NVarChar(36), value: req.params.id } }
    )).recordset;

    return success(res, { ...cow, healthRecords, milkProduction });
  } catch (err) {
    logger.error('Get cow:', err);
    return error(res, 'Failed to fetch cow');
  }
};

// POST /cows
const create = async (req, res) => {
  try {
    const b = req.body;
    const id  = generateId();
    const now = today();
    await execute(`
      INSERT INTO dbo.CowMaster
        (Id,Name,TagNumber,Breed,Color,Gender,AnimalType,DateOfBirth,PurchaseDate,PurchaseCost,CurrentStatus,PhotoUrl,Notes,CreatedAt,UpdatedAt)
      VALUES
        (@id,@name,@tag,@breed,@color,@gender,@animalType,@dob,@pDate,@pCost,@status,@photo,@notes,@now,@now)
    `, {
      id:         { type: NVarChar(36),   value: id },
      name:       { type: NVarChar(100),  value: b.name },
      tag:        { type: NVarChar(50),   value: b.tagNumber || '' },
      breed:      { type: NVarChar(100),  value: b.breed || '' },
      color:      { type: NVarChar(50),   value: b.color || '' },
      gender:     { type: NVarChar(10),   value: normalizeGender(b.gender) },
      animalType: { type: NVarChar(20),   value: normalizeAnimalType(b.animalType) },
      dob:        { type: NVarChar(50),   value: b.dateOfBirth || '' },
      pDate:      { type: NVarChar(50),   value: b.purchaseDate || '' },
      pCost:      { type: Decimal(10, 2), value: parseFloat(b.purchaseCost || 0) },
      status:     { type: NVarChar(50),   value: b.currentStatus || 'Active' },
      photo:      { type: NVarChar(500),  value: b.photoUrl || '' },
      notes:      { type: NVarChar(sql.MAX), value: b.notes || '' },
      now:        { type: NVarChar(20),   value: now },
    });
    const created = await queryOne('SELECT * FROM dbo.CowMaster WHERE Id=@id', { id: { type: NVarChar(36), value: id } });
    return success(res, created, 'Cow added', 201);
  } catch (err) {
    logger.error('Create cow:', err);
    return error(res, 'Failed to add cow');
  }
};

// PUT /cows/:id
const update = async (req, res) => {
  try {
    const b = req.body;
    await execute(`
      UPDATE dbo.CowMaster SET
        Name=@name, TagNumber=@tag, Breed=@breed, Color=@color, Gender=@gender, AnimalType=@animalType,
        DateOfBirth=@dob, PurchaseDate=@pDate, PurchaseCost=@pCost,
        CurrentStatus=@status, PhotoUrl=@photo, Notes=@notes, UpdatedAt=@now
      WHERE Id=@id
    `, {
      id:         { type: NVarChar(36),   value: req.params.id },
      name:       { type: NVarChar(100),  value: b.name },
      tag:        { type: NVarChar(50),   value: b.tagNumber || '' },
      breed:      { type: NVarChar(100),  value: b.breed || '' },
      color:      { type: NVarChar(50),   value: b.color || '' },
      gender:     { type: NVarChar(10),   value: normalizeGender(b.gender) },
      animalType: { type: NVarChar(20),   value: normalizeAnimalType(b.animalType) },
      dob:        { type: NVarChar(50),   value: b.dateOfBirth || '' },
      pDate:      { type: NVarChar(50),   value: b.purchaseDate || '' },
      pCost:      { type: Decimal(10, 2), value: parseFloat(b.purchaseCost || 0) },
      status:     { type: NVarChar(50),   value: b.currentStatus || 'Active' },
      photo:      { type: NVarChar(500),  value: b.photoUrl || '' },
      notes:      { type: NVarChar(sql.MAX), value: b.notes || '' },
      now:        { type: NVarChar(20),   value: today() },
    });
    const updated = await queryOne('SELECT * FROM dbo.CowMaster WHERE Id=@id', { id: { type: NVarChar(36), value: req.params.id } });
    return success(res, updated);
  } catch (err) {
    logger.error('Update cow:', err);
    return error(res, 'Failed to update cow');
  }
};

// DELETE /cows/:id
const remove = async (req, res) => {
  try {
    const rows = await execute('DELETE FROM dbo.CowMaster WHERE Id=@id', { id: { type: NVarChar(36), value: req.params.id } });
    if (!rows) return error(res, 'Cow not found', 404);
    return success(res, null, 'Cow removed');
  } catch (err) {
    logger.error('Delete cow:', err);
    return error(res, 'Failed to delete cow');
  }
};

// POST /cows/:id/health
const addHealthRecord = async (req, res) => {
  try {
    const b = req.body;
    const id  = generateId();
    await execute(`
      INSERT INTO dbo.HealthRecords
        (Id,CowId,RecordType,RecordDate,Description,Veterinarian,NextDueDate,Documents,Notes,CreatedAt,UpdatedAt)
      VALUES
        (@id,@cid,@type,@date,@desc,@vet,@nextDue,@docs,@notes,@now,@now)
    `, {
      id:      { type: NVarChar(36),      value: id },
      cid:     { type: NVarChar(36),      value: req.params.id },
      type:    { type: NVarChar(100),     value: b.recordType || '' },
      date:    { type: NVarChar(20),      value: b.recordDate || today() },
      desc:    { type: NVarChar(sql.MAX), value: b.description || '' },
      vet:     { type: NVarChar(150),     value: b.veterinarian || '' },
      nextDue: { type: NVarChar(20),      value: b.nextDueDate || '' },
      docs:    { type: NVarChar(500),     value: b.documents || '' },
      notes:   { type: NVarChar(sql.MAX), value: b.notes || '' },
      now:     { type: NVarChar(20),      value: today() },
    });
    const record = await queryOne('SELECT * FROM dbo.HealthRecords WHERE Id=@id', { id: { type: NVarChar(36), value: id } });
    return success(res, record, 'Health record added', 201);
  } catch (err) {
    logger.error('Add health record:', err);
    return error(res, 'Failed to add health record');
  }
};

// GET /cows/:id/health
const getHealthRecords = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM dbo.HealthRecords WHERE CowId=@id ORDER BY RecordDate DESC',
      { id: { type: NVarChar(36), value: req.params.id } }
    );
    return success(res, result.recordset);
  } catch (err) {
    logger.error('Get health records:', err);
    return error(res, 'Failed to fetch health records');
  }
};

module.exports = { getAll, getById, create, update, remove, addHealthRecord, getHealthRecords };
