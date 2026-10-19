const { query, queryOne, execute, NVarChar, Decimal } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const logger = require('../config/logger');

const VALID_STATUS = ['Active', 'Inactive'];

// Resolve the rate applicable to a milk type on a given date.
// Historical deliveries must retain the rate effective on the delivery date.
const getEffectiveRate = async (milkType, date) => {
  const row = await queryOne(`
    SELECT TOP 1 RatePerLiter FROM dbo.MilkRates
    WHERE MilkType=@milkType AND Status='Active'
      AND EffectiveFrom <= @date
      AND (EffectiveTo IS NULL OR EffectiveTo >= @date)
    ORDER BY EffectiveFrom DESC
  `, {
    milkType: { type: NVarChar(50), value: milkType },
    date: { type: NVarChar(20), value: date },
  });
  return row ? parseFloat(row.RatePerLiter) : null;
};

// GET /milk-rates
const getAll = async (req, res) => {
  try {
    const milkType = req.query.milkType;
    let qStr = 'SELECT * FROM dbo.MilkRates';
    const params = {};
    if (milkType) {
      qStr += ' WHERE MilkType=@milkType';
      params.milkType = { type: NVarChar(50), value: String(milkType) };
    }
    qStr += ' ORDER BY MilkType, EffectiveFrom DESC';
    const result = await query(qStr, params);
    return success(res, result.recordset);
  } catch (err) {
    logger.error('Get milk rates:', err);
    return error(res, 'Failed to fetch milk rates');
  }
};

// GET /milk-rates/effective?milkType=Cow Milk&date=2026-09-01
const getEffective = async (req, res) => {
  try {
    const milkType = String(req.query.milkType || '').trim();
    const date = String(req.query.date || today()).trim();
    if (!milkType) return error(res, 'milkType is required', 400);
    const rate = await getEffectiveRate(milkType, date);
    if (rate === null) return error(res, 'No effective rate found for the given milk type and date', 404);
    return success(res, { milkType, date, ratePerLiter: rate });
  } catch (err) {
    logger.error('Get effective milk rate:', err);
    return error(res, 'Failed to fetch effective rate');
  }
};

// POST /milk-rates
// Adding a new rate for a milk type auto-closes the previous open rate the day before
// the new EffectiveFrom, so exactly one rate is open per milk type at any time.
const create = async (req, res) => {
  try {
    const milkType = String(req.body.milkType || '').trim();
    const effectiveFrom = String(req.body.effectiveFrom || '').trim();
    const ratePerLiter = parseFloat(req.body.ratePerLiter);
    if (!milkType) return error(res, 'milkType is required', 400);
    if (!effectiveFrom) return error(res, 'effectiveFrom is required', 400);
    if (!Number.isFinite(ratePerLiter) || ratePerLiter < 0) return error(res, 'A valid ratePerLiter is required', 400);

    // Close any currently-open rate for this milk type whose window overlaps the new start.
    const dayBefore = new Date(effectiveFrom);
    dayBefore.setDate(dayBefore.getDate() - 1);
    const prevTo = dayBefore.toISOString().slice(0, 10);

    await execute(`
      UPDATE dbo.MilkRates
      SET EffectiveTo=@prevTo, UpdatedAt=@now
      WHERE MilkType=@milkType AND Status='Active'
        AND (EffectiveTo IS NULL OR EffectiveTo >= @effectiveFrom)
        AND EffectiveFrom < @effectiveFrom
    `, {
      milkType: { type: NVarChar(50), value: milkType },
      prevTo: { type: NVarChar(20), value: prevTo },
      effectiveFrom: { type: NVarChar(20), value: effectiveFrom },
      now: { type: NVarChar(20), value: today() },
    });

    const id = generateId();
    const now = today();
    await execute(`
      INSERT INTO dbo.MilkRates (Id,MilkType,RatePerLiter,EffectiveFrom,EffectiveTo,Status,Notes,CreatedBy,CreatedAt,UpdatedAt)
      VALUES (@id,@milkType,@rate,@effectiveFrom,NULL,'Active',@notes,@createdBy,@now,@now)
    `, {
      id: { type: NVarChar(36), value: id },
      milkType: { type: NVarChar(50), value: milkType },
      rate: { type: Decimal(10, 2), value: ratePerLiter },
      effectiveFrom: { type: NVarChar(20), value: effectiveFrom },
      notes: { type: NVarChar(300), value: req.body.notes ? String(req.body.notes) : null },
      createdBy: { type: NVarChar(36), value: req.user?.id || null },
      now: { type: NVarChar(20), value: now },
    });
    const created = await queryOne('SELECT * FROM dbo.MilkRates WHERE Id=@id', {
      id: { type: NVarChar(36), value: id },
    });
    return success(res, created, 'Milk rate added', 201);
  } catch (err) {
    logger.error('Create milk rate:', err);
    return error(res, 'Failed to add milk rate');
  }
};

// PUT /milk-rates/:id  (correct an existing rate's amount/notes/status - not its history windows)
const update = async (req, res) => {
  try {
    const rate = await queryOne('SELECT Id FROM dbo.MilkRates WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    if (!rate) return error(res, 'Milk rate not found', 404);

    const ratePerLiter = parseFloat(req.body.ratePerLiter);
    if (!Number.isFinite(ratePerLiter) || ratePerLiter < 0) return error(res, 'A valid ratePerLiter is required', 400);
    const status = VALID_STATUS.includes(req.body.status) ? req.body.status : undefined;

    await execute(`
      UPDATE dbo.MilkRates SET
        RatePerLiter=@rate,
        Notes=@notes,
        Status=COALESCE(@status, Status),
        UpdatedAt=@now
      WHERE Id=@id
    `, {
      id: { type: NVarChar(36), value: req.params.id },
      rate: { type: Decimal(10, 2), value: ratePerLiter },
      notes: { type: NVarChar(300), value: req.body.notes ? String(req.body.notes) : null },
      status: { type: NVarChar(20), value: status || null },
      now: { type: NVarChar(20), value: today() },
    });
    const updated = await queryOne('SELECT * FROM dbo.MilkRates WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    return success(res, updated, 'Milk rate updated');
  } catch (err) {
    logger.error('Update milk rate:', err);
    return error(res, 'Failed to update milk rate');
  }
};

// DELETE /milk-rates/:id
const remove = async (req, res) => {
  try {
    const rate = await queryOne('SELECT Id FROM dbo.MilkRates WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    if (!rate) return error(res, 'Milk rate not found', 404);
    await execute('DELETE FROM dbo.MilkRates WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    return success(res, null, 'Milk rate deleted');
  } catch (err) {
    logger.error('Delete milk rate:', err);
    return error(res, 'Failed to delete milk rate');
  }
};

module.exports = { getAll, getEffective, create, update, remove, getEffectiveRate };
