const { query, queryOne, execute, NVarChar, Decimal } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const logger = require('../config/logger');

// POST /milk-production
const record = async (req, res) => {
  try {
    const b = req.body;
    const morning = parseFloat(b.morningMilk || 0);
    const evening = parseFloat(b.eveningMilk || 0);
    const total   = morning + evening;

    // Males are bulls (mating only) and cannot produce milk.
    const cow = await queryOne('SELECT Gender FROM dbo.CowMaster WHERE Id=@cid', {
      cid: { type: NVarChar(36), value: b.cowId },
    });
    if (!cow) return error(res, 'Cow not found', 404);
    if (String(cow.Gender).toLowerCase() === 'male') {
      return error(res, 'Milk production cannot be recorded for a male (bull). Bulls are for mating only.', 400);
    }

    const existing = await queryOne(
      'SELECT Id FROM dbo.MilkProduction WHERE CowId=@cid AND ProductionDate=@date',
      {
        cid:  { type: NVarChar(36), value: b.cowId },
        date: { type: NVarChar(20), value: b.productionDate || today() },
      }
    );

    if (existing) {
      await execute(`
        UPDATE dbo.MilkProduction SET
          MorningMilk=@morning, EveningMilk=@evening, TotalMilk=@total, Notes=@notes, UpdatedAt=@now
        WHERE Id=@id
      `, {
        id:      { type: NVarChar(36), value: existing.Id },
        morning: { type: Decimal(6, 2), value: morning },
        evening: { type: Decimal(6, 2), value: evening },
        total:   { type: Decimal(6, 2), value: total },
        notes:   { type: NVarChar(500), value: b.notes || '' },
        now:     { type: NVarChar(20),  value: today() },
      });
      const updated = await queryOne('SELECT * FROM dbo.MilkProduction WHERE Id=@id', { id: { type: NVarChar(36), value: existing.Id } });
      return success(res, updated);
    }

    const id = generateId();
    await execute(`
      INSERT INTO dbo.MilkProduction
        (Id,CowId,ProductionDate,MorningMilk,EveningMilk,TotalMilk,Notes,CreatedAt,UpdatedAt)
      VALUES
        (@id,@cid,@date,@morning,@evening,@total,@notes,@now,@now)
    `, {
      id:      { type: NVarChar(36),  value: id },
      cid:     { type: NVarChar(36),  value: b.cowId },
      date:    { type: NVarChar(20),  value: b.productionDate || today() },
      morning: { type: Decimal(6, 2), value: morning },
      evening: { type: Decimal(6, 2), value: evening },
      total:   { type: Decimal(6, 2), value: total },
      notes:   { type: NVarChar(500), value: b.notes || '' },
      now:     { type: NVarChar(20),  value: today() },
    });

    const created = await queryOne('SELECT * FROM dbo.MilkProduction WHERE Id=@id', { id: { type: NVarChar(36), value: id } });
    return success(res, created, 'Milk production recorded', 201);
  } catch (err) {
    logger.error('Record milk production:', err);
    return error(res, 'Failed to record milk production');
  }
};

// GET /milk-production
const getAll = async (req, res) => {
  try {
    const { cowId, from, to } = req.query;
    let q = `
      SELECT mp.*, cm.Name AS CowName, cm.TagNumber
      FROM dbo.MilkProduction mp
      JOIN dbo.CowMaster cm ON cm.Id = mp.CowId
      WHERE 1=1
    `;
    if (cowId) q += ` AND mp.CowId='${cowId.replace(/'/g, "''")}'`;
    if (from)  q += ` AND mp.ProductionDate >= '${from.replace(/'/g, "''")}'`;
    if (to)    q += ` AND mp.ProductionDate <= '${to.replace(/'/g, "''")}'`;
    q += ' ORDER BY mp.ProductionDate DESC';

    const result = await query(q);
    return success(res, result.recordset);
  } catch (err) {
    logger.error('Get milk production:', err);
    return error(res, 'Failed to fetch milk production');
  }
};

// GET /milk-production/summary
const getSummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    const y = parseInt(year || new Date().getFullYear());
    const m = parseInt(month || new Date().getMonth() + 1);
    const from = `${y}-${String(m).padStart(2,'0')}-01`;
    const to   = new Date(y, m, 0).toISOString().slice(0, 10);

    const result = await query(`
      SELECT mp.CowId, cm.Name AS CowName, cm.TagNumber,
             SUM(mp.MorningMilk) AS TotalMorning,
             SUM(mp.EveningMilk) AS TotalEvening,
             SUM(mp.TotalMilk)   AS TotalMilk,
             AVG(mp.TotalMilk)   AS AvgDaily,
             COUNT(mp.Id)        AS RecordedDays
      FROM dbo.MilkProduction mp
      JOIN dbo.CowMaster cm ON cm.Id = mp.CowId
      WHERE mp.ProductionDate >= '${from}' AND mp.ProductionDate <= '${to}'
      GROUP BY mp.CowId, cm.Name, cm.TagNumber
      ORDER BY TotalMilk DESC
    `);

    const totalFarm = result.recordset.reduce((s, r) => s + parseFloat(r.TotalMilk || 0), 0);
    return success(res, { cows: result.recordset, totalFarmMilk: totalFarm, period: { year: y, month: m } });
  } catch (err) {
    logger.error('Milk summary:', err);
    return error(res, 'Failed to fetch milk summary');
  }
};

// GET /milk-production/cow/:cowId
const getCowHistory = async (req, res) => {
  try {
    const { from, to } = req.query;
    let q = 'SELECT * FROM dbo.MilkProduction WHERE CowId=@cid';
    if (from) q += ` AND ProductionDate >= '${from.replace(/'/g, "''")}'`;
    if (to)   q += ` AND ProductionDate <= '${to.replace(/'/g, "''")}'`;
    q += ' ORDER BY ProductionDate DESC';

    const result = await query(q, { cid: { type: NVarChar(36), value: req.params.cowId } });
    return success(res, result.recordset);
  } catch (err) {
    logger.error('Get cow history:', err);
    return error(res, 'Failed to fetch cow milk history');
  }
};

module.exports = { record, getAll, getSummary, getCowHistory };
