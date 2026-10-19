const { query, queryOne, execute, NVarChar, TinyInt, Decimal, sql } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const { setAnimalStatus, getAnimalNamesByIds, getAnimalById } = require('../utils/animalLookup');
const logger = require('../config/logger');

// POST /calving — also used for goat "kidding" (Species='Goat' on the pregnancy record).
const recordCalving = async (req, res) => {
  try {
    const b = req.body;
    const now = today();

    // Get pregnancy record from the animal (carries Species so we know which master table it's in).
    const pregnancy = await queryOne(
      'SELECT * FROM dbo.PregnancyRecords WHERE CowId=@cid AND Status=\'Pregnant\'',
      { cid: { type: NVarChar(36), value: b.cowId } }
    );
    const species = pregnancy?.Species || b.species || 'Cow';

    const calvingId = generateId();

    await execute(`
      INSERT INTO dbo.CalvingRecords
        (Id,CowId,Species,PregnancyId,DeliveryDate,DeliveryType,NumberOfCalves,Complications,Notes,CreatedAt,UpdatedAt)
      VALUES
        (@id,@cid,@species,@pregId,@delivDate,@type,@numCalves,@comp,@notes,@now,@now)
    `, {
      id:        { type: NVarChar(36),      value: calvingId },
      cid:       { type: NVarChar(36),      value: b.cowId },
      species:   { type: NVarChar(20),      value: species },
      pregId:    { type: NVarChar(36),      value: pregnancy?.Id || '' },
      delivDate: { type: NVarChar(20),      value: b.deliveryDate || now },
      type:      { type: NVarChar(50),      value: b.deliveryType || 'Normal' },
      numCalves: { type: TinyInt,           value: parseInt(b.numberOfCalves || 1) },
      comp:      { type: NVarChar(sql.MAX), value: b.complications || '' },
      notes:     { type: NVarChar(sql.MAX), value: b.notes || '' },
      now:       { type: NVarChar(20),      value: now },
    });

    // Record each calf/kid
    const calves = b.calves || [];
    const calfRecords = [];
    for (const calf of calves) {
      const calfId = generateId();
      await execute(`
        INSERT INTO dbo.CalfRecords
          (Id,CalvingId,MotherCowId,Name,Gender,BirthDate,BirthWeight,HealthStatus,Notes,CreatedAt,UpdatedAt)
        VALUES
          (@id,@calvId,@motherId,@name,@gender,@birthDate,@weight,@health,@notes,@now,@now)
      `, {
        id:       { type: NVarChar(36),   value: calfId },
        calvId:   { type: NVarChar(36),   value: calvingId },
        motherId: { type: NVarChar(36),   value: b.cowId },
        name:     { type: NVarChar(100),  value: calf.name || '' },
        gender:   { type: NVarChar(20),   value: calf.gender || 'Female' },
        birthDate:{ type: NVarChar(20),   value: calf.birthDate || now },
        weight:   { type: Decimal(6, 2),  value: parseFloat(calf.birthWeight || 0) },
        health:   { type: NVarChar(100),  value: calf.healthStatus || 'Healthy' },
        notes:    { type: NVarChar(sql.MAX), value: calf.notes || '' },
        now:      { type: NVarChar(20),   value: now },
      });
      calfRecords.push({ id: calfId, ...calf });
    }

    // Update pregnancy status
    if (pregnancy) {
      await execute(
        'UPDATE dbo.PregnancyRecords SET Status=\'Calved\',ActualCalvingDate=@date,UpdatedAt=@now WHERE Id=@id',
        {
          id:   { type: NVarChar(36), value: pregnancy.Id },
          date: { type: NVarChar(20), value: b.deliveryDate || now },
          now:  { type: NVarChar(20), value: now },
        }
      );
    }

    // Update animal status back to Active
    await setAnimalStatus(species, b.cowId, 'Active', now);

    const record = await queryOne('SELECT * FROM dbo.CalvingRecords WHERE Id=@id', { id: { type: NVarChar(36), value: calvingId } });
    return success(res, { ...record, calves: calfRecords }, 'Calving recorded', 201);
  } catch (err) {
    logger.error('Record calving:', err);
    return error(res, 'Failed to record calving');
  }
};

// GET /calving
const getAll = async (req, res) => {
  try {
    const { cowId } = req.query;
    let q = 'SELECT * FROM dbo.CalvingRecords WHERE 1=1';
    if (cowId) q += ` AND CowId='${cowId.replace(/'/g, "''")}'`;
    q += ' ORDER BY DeliveryDate DESC';
    const result = await query(q);
    const names = await getAnimalNamesByIds(result.recordset, 'CowId');

    // Attach calves for each record
    const records = [];
    for (const r of result.recordset) {
      const calves = (await query(
        'SELECT * FROM dbo.CalfRecords WHERE CalvingId=@id',
        { id: { type: NVarChar(36), value: r.Id } }
      )).recordset;
      records.push({ ...r, CowName: names[r.CowId]?.name || '', TagNumber: names[r.CowId]?.tagNumber || '', calves });
    }
    return success(res, records);
  } catch (err) {
    logger.error('Get calving records:', err);
    return error(res, 'Failed to fetch calving records');
  }
};

// GET /calving/:id
const getById = async (req, res) => {
  try {
    const record = await queryOne('SELECT * FROM dbo.CalvingRecords WHERE Id=@id', { id: { type: NVarChar(36), value: req.params.id } });
    if (!record) return error(res, 'Calving record not found', 404);

    const animal = await getAnimalById(record.Species, record.CowId);
    const calves = (await query(
      'SELECT * FROM dbo.CalfRecords WHERE CalvingId=@id',
      { id: { type: NVarChar(36), value: req.params.id } }
    )).recordset;

    return success(res, { ...record, CowName: animal?.Name || '', TagNumber: animal?.TagNumber || '', calves });
  } catch (err) {
    logger.error('Get calving record:', err);
    return error(res, 'Failed to fetch calving record');
  }
};

module.exports = { recordCalving, getAll, getById };
