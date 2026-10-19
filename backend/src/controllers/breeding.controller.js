const { query, queryOne, execute, NVarChar, Int, sql } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today, calcExpectedCalvingDate, calcNextMatingCheck } = require('../utils/helpers');
const { getAnimalById, setAnimalStatus, getSpeciesConfig, getAnimalNamesByIds } = require('../utils/animalLookup');
const pushService = require('../services/notifications/push.service');
const logger = require('../config/logger');

// Roles that receive mating-cycle notifications.
const CYCLE_NOTIFY_ROLES = ['admin', 'supervisor', 'cattlecaretaker'];

const VALID_SPECIES = ['Cow', 'Buffalo', 'Goat'];
const normalizeSpecies = (s) => (VALID_SPECIES.includes(s) ? s : 'Cow');

const daysUntil = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / 86400000);
};

const animalLabelFor = (animal) =>
  animal ? `${animal.Name}${animal.TagNumber ? ` (#${animal.TagNumber})` : ''}` : 'Animal';

// Average gestation for a species' config row (Min/Max range) — Cow/Buffalo have Min=Max=283
// so this is a no-op for them; Goat's 145-155 range collapses to the 150-day standard average.
const avgGestationDays = (config) => Math.round(((config?.GestationDaysMin || 283) + (config?.GestationDaysMax || 283)) / 2);

const notifyRoles = async (title, body, data = {}) => {
  try {
    const tokens = await pushService.getTokensByRoles(CYCLE_NOTIFY_ROLES);
    if (tokens.length) await pushService.sendPush(tokens, title, body, data);
  } catch (err) {
    logger.error('Breeding notify error:', err);
  }
};

// POST /breeding — record a mating. Pregnancy is NOT assumed until conception is confirmed.
const createBreedingRecord = async (req, res) => {
  try {
    const b = req.body;
    const species = normalizeSpecies(b.species);
    const id  = generateId();
    const now = today();
    const matingDate = b.matingDate || now;
    const config = await getSpeciesConfig(species);
    const nextCheckDate = calcNextMatingCheck(matingDate, config?.HeatCycleDays);

    // The bred animal must be female; males are the mating partner (bull/buck), not the bred animal.
    const bredAnimal = await getAnimalById(species, b.cowId);
    if (!bredAnimal) return error(res, `${species} not found`, 404);
    if (String(bredAnimal.Gender).toLowerCase() === 'male') {
      return error(res, `Cannot record mating for a male. Select a female ${species.toLowerCase()}; the male is the mating partner.`, 400);
    }

    const prior = await queryOne(
      'SELECT COUNT(*) AS n FROM dbo.BreedingRecords WHERE CowId=@cid',
      { cid: { type: NVarChar(36), value: b.cowId } }
    );
    const cycleNumber = (prior?.n || 0) + 1;

    await execute(`
      INSERT INTO dbo.BreedingRecords
        (Id,CowId,Species,MatingDate,BullName,BreedingMethod,TechnicianName,Notes,
         NextCheckDate,ConceptionStatus,CycleNumber,ReminderSent,CreatedAt,UpdatedAt)
      VALUES
        (@id,@cid,@species,@mDate,@bull,@method,@tech,@notes,
         @nextCheck,'Pending',@cycle,0,@now,@now)
    `, {
      id:        { type: NVarChar(36),      value: id },
      cid:       { type: NVarChar(36),      value: b.cowId },
      species:   { type: NVarChar(20),      value: species },
      mDate:     { type: NVarChar(20),      value: matingDate },
      bull:      { type: NVarChar(150),     value: b.bullName || '' },
      method:    { type: NVarChar(50),      value: b.breedingMethod || 'Natural' },
      tech:      { type: NVarChar(150),     value: b.technicianName || '' },
      notes:     { type: NVarChar(sql.MAX), value: b.notes || '' },
      nextCheck: { type: NVarChar(20),      value: nextCheckDate },
      cycle:     { type: Int,               value: cycleNumber },
      now:       { type: NVarChar(20),      value: now },
    });

    // Animal is now Mated (awaiting conception confirmation), not Pregnant yet.
    await setAnimalStatus(species, b.cowId, 'Mated', now);

    await notifyRoles(
      '🐄 Mating recorded',
      `${animalLabelFor(bredAnimal)} mated on ${matingDate}. Next cycle check on ${nextCheckDate} — confirm pregnancy or re-mate.`,
      { type: 'mating_recorded', breedingId: id, cowId: b.cowId, species, nextCheckDate }
    );

    const record = await queryOne('SELECT * FROM dbo.BreedingRecords WHERE Id=@id', { id: { type: NVarChar(36), value: id } });
    return success(res, { ...record, nextCheckDate }, 'Mating recorded', 201);
  } catch (err) {
    logger.error('Create breeding record:', err);
    return error(res, 'Failed to create breeding record');
  }
};

// GET /breeding
const getAll = async (req, res) => {
  try {
    const { cowId, status, conception } = req.query;
    let q = `
      SELECT br.*,
             pr.Id AS PregnancyId, pr.IsConfirmed, pr.ConfirmationDate,
             pr.ExpectedCalvingDate, pr.Status AS PregnancyStatus
      FROM dbo.BreedingRecords br
      LEFT JOIN dbo.PregnancyRecords pr ON pr.BreedingId = br.Id
      WHERE 1=1
    `;
    const params = {};
    if (cowId) { q += ' AND br.CowId=@cowId'; params.cowId = { type: NVarChar(36), value: cowId }; }
    if (status) { q += ' AND pr.Status=@status'; params.status = { type: NVarChar(50), value: status }; }
    if (conception) { q += ' AND br.ConceptionStatus=@conception'; params.conception = { type: NVarChar(20), value: conception }; }
    q += ' ORDER BY br.MatingDate DESC';
    const result = await query(q, params);
    const names = await getAnimalNamesByIds(result.recordset, 'CowId');
    const records = result.recordset.map((r) => ({
      ...r,
      CowName: names[r.CowId]?.name || '',
      TagNumber: names[r.CowId]?.tagNumber || '',
      daysUntilCheck: r.NextCheckDate ? daysUntil(r.NextCheckDate) : null,
      daysUntilCalving: r.ExpectedCalvingDate ? daysUntil(r.ExpectedCalvingDate) : null,
    }));
    return success(res, records);
  } catch (err) {
    logger.error('Get breeding records:', err);
    return error(res, 'Failed to fetch breeding records');
  }
};

// GET /breeding/:id
const getById = async (req, res) => {
  try {
    const record = await queryOne('SELECT * FROM dbo.BreedingRecords WHERE Id=@id', { id: { type: NVarChar(36), value: req.params.id } });
    if (!record) return error(res, 'Breeding record not found', 404);
    const animal = await getAnimalById(record.Species, record.CowId);
    return success(res, { ...record, CowName: animal?.Name || '', TagNumber: animal?.TagNumber || '' });
  } catch (err) {
    logger.error('Get breeding record:', err);
    return error(res, 'Failed to fetch breeding record');
  }
};

// PUT /breeding/:id/confirm-pregnancy
const confirmPregnancy = async (req, res) => {
  try {
    const { veterinarian, confirmationDate } = req.body;
    const now = today();

    await execute(`
      UPDATE dbo.PregnancyRecords SET
        IsConfirmed=1, ConfirmationDate=@cDate, Veterinarian=@vet, UpdatedAt=@now
      WHERE BreedingId=@breedId
    `, {
      breedId: { type: NVarChar(36),  value: req.params.id },
      cDate:   { type: NVarChar(20),  value: confirmationDate || now },
      vet:     { type: NVarChar(150), value: veterinarian || '' },
      now:     { type: NVarChar(20),  value: now },
    });

    const updated = await queryOne(
      'SELECT * FROM dbo.PregnancyRecords WHERE BreedingId=@id',
      { id: { type: NVarChar(36), value: req.params.id } }
    );
    return success(res, { ...updated, daysUntilCalving: daysUntil(updated?.ExpectedCalvingDate) });
  } catch (err) {
    logger.error('Confirm pregnancy:', err);
    return error(res, 'Failed to confirm pregnancy');
  }
};

// GET /breeding/upcoming-calving
const getUpcomingCalving = async (req, res) => {
  try {
    const result = await query(`
      SELECT pr.*, br.MatingDate, br.BullName
      FROM dbo.PregnancyRecords pr
      LEFT JOIN dbo.BreedingRecords br ON br.Id = pr.BreedingId
      WHERE pr.Status = 'Pregnant'
      ORDER BY pr.ExpectedCalvingDate ASC
    `);
    const names = await getAnimalNamesByIds(result.recordset, 'CowId');
    const records = result.recordset.map((r) => ({
      ...r,
      CowName: names[r.CowId]?.name || '',
      TagNumber: names[r.CowId]?.tagNumber || '',
      daysUntilCalving: daysUntil(r.ExpectedCalvingDate),
    }));
    return success(res, records);
  } catch (err) {
    logger.error('Get upcoming calving:', err);
    return error(res, 'Failed to fetch upcoming calving');
  }
};

// PUT /breeding/:id/conception — confirm conceived or record a re-mating cycle.
const setConception = async (req, res) => {
  try {
    const { conceived, confirmationDate, veterinarian, nextMatingDate } = req.body;
    const now = today();

    const breeding = await queryOne('SELECT * FROM dbo.BreedingRecords WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    if (!breeding) return error(res, 'Breeding record not found', 404);

    const species = normalizeSpecies(breeding.Species);
    const config = await getSpeciesConfig(species);
    const animal = await getAnimalById(species, breeding.CowId);
    const isConceived = conceived === true || conceived === 'true';

    if (isConceived) {
      await execute(
        "UPDATE dbo.BreedingRecords SET ConceptionStatus='Conceived', ReminderSent=1, UpdatedAt=@now WHERE Id=@id",
        { id: { type: NVarChar(36), value: req.params.id }, now: { type: NVarChar(20), value: now } }
      );

      const expectedCalving = calcExpectedCalvingDate(breeding.MatingDate, avgGestationDays(config));
      const existingPreg = await queryOne('SELECT Id FROM dbo.PregnancyRecords WHERE BreedingId=@id', {
        id: { type: NVarChar(36), value: req.params.id },
      });

      if (existingPreg) {
        await execute(`
          UPDATE dbo.PregnancyRecords SET
            IsConfirmed=1, ConfirmationDate=@cDate, Veterinarian=@vet,
            ExpectedCalvingDate=@exp, Status='Pregnant', UpdatedAt=@now
          WHERE BreedingId=@id
        `, {
          id:    { type: NVarChar(36),  value: req.params.id },
          cDate: { type: NVarChar(20),  value: confirmationDate || now },
          vet:   { type: NVarChar(150), value: veterinarian || '' },
          exp:   { type: NVarChar(20),  value: expectedCalving },
          now:   { type: NVarChar(20),  value: now },
        });
      } else {
        await execute(`
          INSERT INTO dbo.PregnancyRecords
            (Id,CowId,Species,BreedingId,IsConfirmed,ConfirmationDate,Veterinarian,
             ExpectedCalvingDate,ActualCalvingDate,Status,CreatedAt,UpdatedAt)
          VALUES
            (@id,@cid,@species,@breedId,1,@cDate,@vet,@exp,NULL,'Pregnant',@now,@now)
        `, {
          id:      { type: NVarChar(36),  value: generateId() },
          cid:     { type: NVarChar(36),  value: breeding.CowId },
          species: { type: NVarChar(20),  value: species },
          breedId: { type: NVarChar(36),  value: req.params.id },
          cDate:   { type: NVarChar(20),  value: confirmationDate || now },
          vet:     { type: NVarChar(150), value: veterinarian || '' },
          exp:     { type: NVarChar(20),  value: expectedCalving },
          now:     { type: NVarChar(20),  value: now },
        });
      }

      await setAnimalStatus(species, breeding.CowId, 'Pregnant', now);

      await notifyRoles(
        '✅ Pregnancy confirmed',
        `${animalLabelFor(animal)} confirmed pregnant. Expected delivery ${expectedCalving} (~${avgGestationDays(config)} days).`,
        { type: 'pregnancy_confirmed', cowId: breeding.CowId, species, expectedCalvingDate: expectedCalving }
      );

      return success(res, {
        conceptionStatus: 'Conceived',
        expectedCalvingDate: expectedCalving,
        daysUntilCalving: daysUntil(expectedCalving),
      }, 'Pregnancy confirmed');
    }

    // Not conceived — close this attempt, schedule the next mating cycle.
    await execute(
      "UPDATE dbo.BreedingRecords SET ConceptionStatus='NotConceived', ReminderSent=1, UpdatedAt=@now WHERE Id=@id",
      { id: { type: NVarChar(36), value: req.params.id }, now: { type: NVarChar(20), value: now } }
    );

    const newMatingDate = nextMatingDate || breeding.NextCheckDate || calcNextMatingCheck(breeding.MatingDate, config?.HeatCycleDays);
    const newNextCheck = calcNextMatingCheck(newMatingDate, config?.HeatCycleDays);
    const newId = generateId();

    await execute(`
      INSERT INTO dbo.BreedingRecords
        (Id,CowId,Species,MatingDate,BullName,BreedingMethod,TechnicianName,Notes,
         NextCheckDate,ConceptionStatus,CycleNumber,ReminderSent,CreatedAt,UpdatedAt)
      VALUES
        (@id,@cid,@species,@mDate,@bull,@method,@tech,@notes,
         @nextCheck,'Pending',@cycle,0,@now,@now)
    `, {
      id:        { type: NVarChar(36),      value: newId },
      cid:       { type: NVarChar(36),      value: breeding.CowId },
      species:   { type: NVarChar(20),      value: species },
      mDate:     { type: NVarChar(20),      value: newMatingDate },
      bull:      { type: NVarChar(150),     value: breeding.BullName || '' },
      method:    { type: NVarChar(50),      value: breeding.BreedingMethod || 'Natural' },
      tech:      { type: NVarChar(150),     value: breeding.TechnicianName || '' },
      notes:     { type: NVarChar(sql.MAX), value: breeding.Notes || '' },
      nextCheck: { type: NVarChar(20),      value: newNextCheck },
      cycle:     { type: Int,               value: (breeding.CycleNumber || 1) + 1 },
      now:       { type: NVarChar(20),      value: now },
    });

    await setAnimalStatus(species, breeding.CowId, 'Mated', now);

    await notifyRoles(
      '🔁 Re-mating scheduled',
      `${animalLabelFor(animal)} not conceived. New mating on ${newMatingDate}. Next cycle check on ${newNextCheck}.`,
      { type: 'rematch_scheduled', breedingId: newId, cowId: breeding.CowId, species, nextCheckDate: newNextCheck }
    );

    return success(res, {
      conceptionStatus: 'NotConceived',
      nextMatingDate: newMatingDate,
      nextCheckDate: newNextCheck,
    }, 'Re-mating scheduled');
  } catch (err) {
    logger.error('Set conception:', err);
    return error(res, 'Failed to update conception status');
  }
};

module.exports = { createBreedingRecord, getAll, getById, confirmPregnancy, setConception, getUpcomingCalving };
