const { query, queryOne, execute, NVarChar, Decimal, sql } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const logger = require('../config/logger');

// Female = milk-producing / breedable (doe); Male = buck (mating only) — same convention as CowMaster.
const normalizeGender = (g) => (String(g || '').trim().toLowerCase() === 'male' ? 'Male' : 'Female');

// Appends each goat's latest weigh-in (for grid columns) via a correlated subquery — cheap since
// GoatWeightRecords is indexed on (GoatId, WeighedDate) and herds are small.
const LATEST_WEIGHT_JOIN = `
  OUTER APPLY (
    SELECT TOP 1 WeightKg, WeighedDate
    FROM dbo.GoatWeightRecords wr
    WHERE wr.GoatId = g.Id
    ORDER BY wr.WeighedDate DESC, wr.CreatedAt DESC
  ) lw
`;

// GET /goats
const getAll = async (req, res) => {
  try {
    const { status, gender } = req.query;
    const clauses = [];
    if (status) clauses.push(`g.CurrentStatus='${String(status).replace(/'/g, "''")}'`);
    if (gender) clauses.push(`g.Gender='${normalizeGender(gender).replace(/'/g, "''")}'`);
    let q = `SELECT g.*, lw.WeightKg AS CurrentWeightKg, lw.WeighedDate AS LastWeighedDate FROM dbo.GoatMaster g ${LATEST_WEIGHT_JOIN}`;
    if (clauses.length) q += ' WHERE ' + clauses.join(' AND ');
    q += ' ORDER BY g.Name';
    const result = await query(q);

    // Attach each goat's previous weigh-in too, so the grid can color the trend (gain/loss/no
    // change) without a per-row round trip. App-side grouping is simplest here — herds are small.
    const allWeights = (await query('SELECT GoatId, WeightKg, WeighedDate, CreatedAt FROM dbo.GoatWeightRecords ORDER BY WeighedDate DESC, CreatedAt DESC')).recordset;
    const byGoat = {};
    for (const w of allWeights) (byGoat[w.GoatId] = byGoat[w.GoatId] || []).push(w);

    const goats = result.recordset.map((g) => ({
      ...g,
      PreviousWeightKg: byGoat[g.Id]?.[1]?.WeightKg ?? null,
    }));
    return success(res, goats);
  } catch (err) {
    logger.error('Get goats:', err);
    return error(res, 'Failed to fetch goats');
  }
};

// GET /goats/:id
const getById = async (req, res) => {
  try {
    const goat = await queryOne(
      `SELECT g.*, lw.WeightKg AS CurrentWeightKg, lw.WeighedDate AS LastWeighedDate FROM dbo.GoatMaster g ${LATEST_WEIGHT_JOIN} WHERE g.Id=@id`,
      { id: { type: NVarChar(36), value: req.params.id } }
    );
    if (!goat) return error(res, 'Goat not found', 404);

    const weightHistory = (await query(
      'SELECT * FROM dbo.GoatWeightRecords WHERE GoatId=@id ORDER BY WeighedDate DESC, CreatedAt DESC',
      { id: { type: NVarChar(36), value: req.params.id } }
    )).recordset;

    return success(res, { ...goat, weightHistory });
  } catch (err) {
    logger.error('Get goat:', err);
    return error(res, 'Failed to fetch goat');
  }
};

// GET /goats/:id/weights — full weigh-in history since purchase, newest first.
const getWeights = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM dbo.GoatWeightRecords WHERE GoatId=@id ORDER BY WeighedDate DESC, CreatedAt DESC',
      { id: { type: NVarChar(36), value: req.params.id } }
    );
    return success(res, result.recordset);
  } catch (err) {
    logger.error('Get goat weights:', err);
    return error(res, 'Failed to fetch weight history');
  }
};

// POST /goats/:id/weights — log a weigh-in (recommended every ~2 weeks).
const addWeight = async (req, res) => {
  try {
    const goat = await queryOne('SELECT Id FROM dbo.GoatMaster WHERE Id=@id', { id: { type: NVarChar(36), value: req.params.id } });
    if (!goat) return error(res, 'Goat not found', 404);

    const weightKg = parseFloat(req.body.weightKg);
    if (!Number.isFinite(weightKg) || weightKg <= 0) return error(res, 'A valid weight (kg) is required', 400);

    const id = generateId();
    const now = today();
    await execute(`
      INSERT INTO dbo.GoatWeightRecords (Id,GoatId,WeighedDate,WeightKg,Notes,CreatedAt,UpdatedAt)
      VALUES (@id,@goatId,@date,@weight,@notes,@now,@now)
    `, {
      id:      { type: NVarChar(36),  value: id },
      goatId:  { type: NVarChar(36),  value: req.params.id },
      date:    { type: NVarChar(20),  value: req.body.weighedDate || now },
      weight:  { type: Decimal(6, 2), value: weightKg },
      notes:   { type: NVarChar(300), value: req.body.notes || '' },
      now:     { type: NVarChar(20),  value: now },
    });

    const record = await queryOne('SELECT * FROM dbo.GoatWeightRecords WHERE Id=@id', { id: { type: NVarChar(36), value: id } });
    return success(res, record, 'Weight logged', 201);
  } catch (err) {
    logger.error('Add goat weight:', err);
    return error(res, 'Failed to log weight');
  }
};

// DELETE /goats/:id/weights/:weightId — correct a mis-entered weigh-in.
const removeWeight = async (req, res) => {
  try {
    const rows = await execute(
      'DELETE FROM dbo.GoatWeightRecords WHERE Id=@weightId AND GoatId=@id',
      { id: { type: NVarChar(36), value: req.params.id }, weightId: { type: NVarChar(36), value: req.params.weightId } }
    );
    if (!rows) return error(res, 'Weight record not found', 404);
    return success(res, null, 'Weight record removed');
  } catch (err) {
    logger.error('Delete goat weight:', err);
    return error(res, 'Failed to delete weight record');
  }
};

// POST /goats
const create = async (req, res) => {
  try {
    const b = req.body;
    const id = generateId();
    const now = today();
    await execute(`
      INSERT INTO dbo.GoatMaster
        (Id,Name,TagNumber,Breed,Color,Gender,DateOfBirth,PurchaseDate,PurchaseCost,CurrentStatus,PhotoUrl,Notes,CreatedAt,UpdatedAt)
      VALUES
        (@id,@name,@tag,@breed,@color,@gender,@dob,@pDate,@pCost,@status,@photo,@notes,@now,@now)
    `, {
      id:     { type: NVarChar(36),      value: id },
      name:   { type: NVarChar(100),     value: b.name },
      tag:    { type: NVarChar(50),      value: b.tagNumber || '' },
      breed:  { type: NVarChar(100),     value: b.breed || '' },
      color:  { type: NVarChar(50),      value: b.color || '' },
      gender: { type: NVarChar(10),      value: normalizeGender(b.gender) },
      dob:    { type: NVarChar(50),      value: b.dateOfBirth || '' },
      pDate:  { type: NVarChar(50),      value: b.purchaseDate || '' },
      pCost:  { type: Decimal(10, 2),    value: parseFloat(b.purchaseCost || 0) },
      status: { type: NVarChar(50),      value: b.currentStatus || 'Active' },
      photo:  { type: NVarChar(500),     value: b.photoUrl || '' },
      notes:  { type: NVarChar(sql.MAX), value: b.notes || '' },
      now:    { type: NVarChar(20),      value: now },
    });
    const created = await queryOne('SELECT * FROM dbo.GoatMaster WHERE Id=@id', { id: { type: NVarChar(36), value: id } });
    return success(res, created, 'Goat added', 201);
  } catch (err) {
    logger.error('Create goat:', err);
    return error(res, 'Failed to add goat');
  }
};

// PUT /goats/:id
const update = async (req, res) => {
  try {
    const existing = await queryOne('SELECT Id FROM dbo.GoatMaster WHERE Id=@id', { id: { type: NVarChar(36), value: req.params.id } });
    if (!existing) return error(res, 'Goat not found', 404);

    const b = req.body;
    await execute(`
      UPDATE dbo.GoatMaster SET
        Name=@name, TagNumber=@tag, Breed=@breed, Color=@color, Gender=@gender,
        DateOfBirth=@dob, PurchaseDate=@pDate, PurchaseCost=@pCost,
        CurrentStatus=@status, PhotoUrl=@photo, Notes=@notes, UpdatedAt=@now
      WHERE Id=@id
    `, {
      id:     { type: NVarChar(36),      value: req.params.id },
      name:   { type: NVarChar(100),     value: b.name },
      tag:    { type: NVarChar(50),      value: b.tagNumber || '' },
      breed:  { type: NVarChar(100),     value: b.breed || '' },
      color:  { type: NVarChar(50),      value: b.color || '' },
      gender: { type: NVarChar(10),      value: normalizeGender(b.gender) },
      dob:    { type: NVarChar(50),      value: b.dateOfBirth || '' },
      pDate:  { type: NVarChar(50),      value: b.purchaseDate || '' },
      pCost:  { type: Decimal(10, 2),    value: parseFloat(b.purchaseCost || 0) },
      status: { type: NVarChar(50),      value: b.currentStatus || 'Active' },
      photo:  { type: NVarChar(500),     value: b.photoUrl || '' },
      notes:  { type: NVarChar(sql.MAX), value: b.notes || '' },
      now:    { type: NVarChar(20),      value: today() },
    });
    const updated = await queryOne('SELECT * FROM dbo.GoatMaster WHERE Id=@id', { id: { type: NVarChar(36), value: req.params.id } });
    return success(res, updated, 'Goat updated');
  } catch (err) {
    logger.error('Update goat:', err);
    return error(res, 'Failed to update goat');
  }
};

// DELETE /goats/:id
const remove = async (req, res) => {
  try {
    const rows = await execute('DELETE FROM dbo.GoatMaster WHERE Id=@id', { id: { type: NVarChar(36), value: req.params.id } });
    if (!rows) return error(res, 'Goat not found', 404);
    return success(res, null, 'Goat removed');
  } catch (err) {
    logger.error('Delete goat:', err);
    return error(res, 'Failed to delete goat');
  }
};

module.exports = { getAll, getById, create, update, remove, getWeights, addWeight, removeWeight };
