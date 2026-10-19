// The breeding/pregnancy/calving pipeline is polymorphic: BreedingRecords.CowId (kept as-is to
// avoid a larger rename) references either dbo.CowMaster (Species='Cow'|'Buffalo') or
// dbo.GoatMaster (Species='Goat') — there's no single-table FK for that, so these helpers do the
// species -> table dispatch that a FK constraint would normally handle.
const { query, queryOne, execute, NVarChar } = require('../database/db');

const SPECIES_TABLE = { Cow: 'CowMaster', Buffalo: 'CowMaster', Goat: 'GoatMaster' };

const tableForSpecies = (species) => SPECIES_TABLE[species] || 'CowMaster';

const getAnimalById = async (species, id) => queryOne(
  `SELECT * FROM dbo.${tableForSpecies(species)} WHERE Id=@id`,
  { id: { type: NVarChar(36), value: id } },
);

const setAnimalStatus = async (species, id, status, now) => execute(
  `UPDATE dbo.${tableForSpecies(species)} SET CurrentStatus=@status,UpdatedAt=@now WHERE Id=@id`,
  {
    id: { type: NVarChar(36), value: id },
    status: { type: NVarChar(50), value: status },
    now: { type: NVarChar(20), value: now },
  },
);

const getSpeciesConfig = async (species) => queryOne(
  'SELECT * FROM dbo.SpeciesBreedingConfig WHERE Species=@species',
  { species: { type: NVarChar(20), value: species } },
);

// Batch name/tag lookup for a list of {Id, Species} pairs — used to enrich breeding/pregnancy/
// calving list responses without a cross-table SQL JOIN.
const getAnimalNamesByIds = async (records, idField, speciesField = 'Species') => {
  const bySpecies = {};
  for (const r of records) {
    const species = r[speciesField] || 'Cow';
    (bySpecies[species] = bySpecies[species] || new Set()).add(r[idField]);
  }
  const names = {};
  for (const [species, idSet] of Object.entries(bySpecies)) {
    const table = tableForSpecies(species);
    const ids = Array.from(idSet).map((id) => `'${String(id).replace(/'/g, "''")}'`).join(',');
    if (!ids) continue;
    const result = await query(`SELECT Id, Name, TagNumber FROM dbo.${table} WHERE Id IN (${ids})`);
    for (const row of result.recordset) names[row.Id] = { name: row.Name, tagNumber: row.TagNumber };
  }
  return names;
};

module.exports = { tableForSpecies, getAnimalById, setAnimalStatus, getSpeciesConfig, getAnimalNamesByIds };
