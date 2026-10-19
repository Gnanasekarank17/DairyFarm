// Ledger categories (Expense / Income types) live in dbo.LedgerCategories so users can add their
// own (e.g. "Machinery", "Pump") on top of the seeded system defaults in config/finance.js.
const { query, queryOne, execute, NVarChar, Bit, Int } = require('../database/db');
const { generateId } = require('../utils/helpers');

const LEDGERS = Object.freeze(['expense', 'income']);
const MAX_NAME = 60;

// Trim, collapse spaces, capitalise the first letter ("machinery" -> "Machinery").
const normaliseName = (name) => {
  const n = String(name || '').trim().replace(/\s+/g, ' ').slice(0, MAX_NAME);
  return n ? n.charAt(0).toUpperCase() + n.slice(1) : n;
};

/** Active category rows for one ledger, system defaults first then custom ones alphabetically. */
async function listCategories(ledger) {
  const r = await query(`
    SELECT Id, Ledger, Name, IsSystem, IsActive, SortOrder, CreatedAt
    FROM dbo.LedgerCategories
    WHERE Ledger=@ledger AND IsActive=1
    ORDER BY IsSystem DESC, SortOrder, Name
  `, { ledger: { type: NVarChar(10), value: ledger } });
  return r.recordset;
}

/** Just the names — what the controllers validate against and the summaries iterate. */
async function categoryNames(ledger) {
  return (await listCategories(ledger)).map((c) => c.Name);
}

/** Case-insensitive lookup that returns the stored spelling, or null if unknown / inactive. */
async function resolveCategory(ledger, name) {
  const wanted = normaliseName(name).toLowerCase();
  if (!wanted) return null;
  const names = await categoryNames(ledger);
  return names.find((n) => n.toLowerCase() === wanted) || null;
}

/**
 * Create a custom category. Re-activates a soft-deleted one with the same name.
 * Returns { row } or { error, status }.
 */
async function createCategory(ledger, rawName) {
  const name = normaliseName(rawName);
  if (name.length < 2) return { error: 'Category name must be at least 2 characters', status: 400 };
  if (!LEDGERS.includes(ledger)) return { error: 'Invalid ledger', status: 400 };

  const existing = await queryOne(
    'SELECT * FROM dbo.LedgerCategories WHERE Ledger=@ledger AND LOWER(Name)=LOWER(@name)',
    { ledger: { type: NVarChar(10), value: ledger }, name: { type: NVarChar(MAX_NAME), value: name } },
  );
  if (existing) {
    if (existing.IsActive) return { error: `"${existing.Name}" already exists`, status: 409 };
    // Re-activate a previously removed type, adopting the spelling the user just typed.
    await execute('UPDATE dbo.LedgerCategories SET IsActive=1, Name=@name WHERE Id=@id', {
      id: { type: NVarChar(36), value: existing.Id }, name: { type: NVarChar(MAX_NAME), value: name },
    });
    return { row: { ...existing, Name: name, IsActive: true } };
  }

  const id = generateId();
  await execute(`
    INSERT INTO dbo.LedgerCategories (Id, Ledger, Name, IsSystem, IsActive, SortOrder, CreatedAt)
    VALUES (@id, @ledger, @name, 0, 1, 500, @now)
  `, {
    id: { type: NVarChar(36), value: id },
    ledger: { type: NVarChar(10), value: ledger },
    name: { type: NVarChar(MAX_NAME), value: name },
    now: { type: NVarChar(30), value: new Date().toISOString() },
  });
  return { row: await queryOne('SELECT * FROM dbo.LedgerCategories WHERE Id=@id', { id: { type: NVarChar(36), value: id } }) };
}

/**
 * Soft-delete a custom category. System categories and categories still used by rows are refused.
 * `table` is the ledger table (dbo.Expenses / dbo.Income) to check for usage.
 */
async function deleteCategory(ledger, id, table) {
  const row = await queryOne('SELECT * FROM dbo.LedgerCategories WHERE Id=@id AND Ledger=@ledger', {
    id: { type: NVarChar(36), value: id }, ledger: { type: NVarChar(10), value: ledger },
  });
  if (!row) return { error: 'Category not found', status: 404 };
  if (row.IsSystem) return { error: 'Built-in categories cannot be removed', status: 400 };

  const used = await queryOne(`SELECT COUNT(*) AS N FROM ${table} WHERE Category=@name`, { name: { type: NVarChar(MAX_NAME), value: row.Name } });
  if (used && Number(used.N) > 0) {
    return { error: `"${row.Name}" is used by ${used.N} entr${Number(used.N) === 1 ? 'y' : 'ies'} and cannot be removed`, status: 400 };
  }
  await execute('UPDATE dbo.LedgerCategories SET IsActive=0 WHERE Id=@id', { id: { type: NVarChar(36), value: id } });
  return { ok: true };
}

module.exports = { LEDGERS, MAX_NAME, listCategories, categoryNames, resolveCategory, createCategory, deleteCategory, normaliseName, Bit, Int };
