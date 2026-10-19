// Factory for the two money ledgers (Expenses / Income). Both tables share the same shape
// apart from the date column and the counter-party column, so one controller serves both.
const { query, queryOne, execute, NVarChar, Decimal } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const { PAYMENT_MODES } = require('../config/finance');
const categoriesService = require('../services/categories.service');
const logger = require('../config/logger');

const num = (v, fallback = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

const str = (v, max) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
};

const isIsoDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v).getTime());

/**
 * @param {object} cfg
 * @param {string} cfg.table        SQL table, e.g. 'dbo.Expenses'
 * @param {string} cfg.singular     'Expense' | 'Income' — used in messages
 * @param {string} cfg.dateColumn   'ExpenseDate' | 'IncomeDate'
 * @param {string} cfg.dateField    body/request field, e.g. 'expenseDate'
 * @param {string} cfg.partyColumn  'Vendor' | 'Source'
 * @param {string} cfg.partyField   body field, e.g. 'vendor'
 * @param {string} cfg.ledger        'expense' | 'income' (key into dbo.LedgerCategories)
 * @param {string[]} cfg.categories seeded defaults; the DB table is the source of truth
 */
function createLedgerController(cfg) {
  const { table, singular, dateColumn, dateField, partyColumn, partyField, categories, ledger } = cfg;
  const lower = singular.toLowerCase();

  // Validates + normalises the request body. Returns { error } or { values }.
  const parseBody = async (body) => {
    const category = await categoriesService.resolveCategory(ledger, body.category);
    if (!category) {
      const names = await categoriesService.categoryNames(ledger);
      return { error: `Category must be one of: ${names.join(', ')} (or add a new category first)` };
    }
    const amount = num(body.amount);
    if (!(amount > 0)) return { error: 'Amount must be greater than 0' };

    const accountName = str(body.accountName, 150);
    if (category === 'Other' && !accountName) {
      return { error: `Account name is required for Other ${lower} entries` };
    }

    const date = String(body[dateField] || today()).slice(0, 10);
    if (!isIsoDate(date)) return { error: 'Date must be in YYYY-MM-DD format' };

    const paymentMode = str(body.paymentMode, 50) || 'Cash';
    if (!PAYMENT_MODES.includes(paymentMode)) {
      return { error: `Payment mode must be one of: ${PAYMENT_MODES.join(', ')}` };
    }

    const hasQty = body.quantity !== undefined && body.quantity !== null && body.quantity !== '';
    return {
      values: {
        category: { type: NVarChar(60), value: category },
        accountName: { type: NVarChar(150), value: accountName },
        itemName: { type: NVarChar(150), value: str(body.itemName, 150) },
        party: { type: NVarChar(150), value: str(body[partyField], 150) },
        quantity: { type: Decimal(10, 2), value: hasQty ? num(body.quantity) : null },
        unit: { type: NVarChar(20), value: str(body.unit, 20) },
        amount: { type: Decimal(12, 2), value: amount },
        date: { type: NVarChar(20), value: date },
        mode: { type: NVarChar(50), value: paymentMode },
        notes: { type: NVarChar(500), value: str(body.notes, 500) },
      },
    };
  };

  const byId = (id) => ({ id: { type: NVarChar(36), value: id } });
  const fetchOne = (id) => queryOne(`SELECT * FROM ${table} WHERE Id=@id`, byId(id));

  // GET /?year=&month=&category=&from=&to=
  const getAll = async (req, res) => {
    try {
      const { year, month, category, from, to } = req.query;
      const filters = [];
      const params = {};

      let rangeFrom = null;
      let rangeTo = null;
      if (year && month) {
        const y = Number(year); const m = Number(month);
        rangeFrom = `${y}-${String(m).padStart(2, '0')}-01`;
        rangeTo = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
      } else if (year) {
        rangeFrom = `${Number(year)}-01-01`;
        rangeTo = `${Number(year)}-12-31`;
      }
      if (from && isIsoDate(String(from))) rangeFrom = String(from);
      if (to && isIsoDate(String(to))) rangeTo = String(to);

      if (rangeFrom) { filters.push(`${dateColumn} >= @from`); params.from = { type: NVarChar(20), value: rangeFrom }; }
      if (rangeTo) { filters.push(`${dateColumn} <= @to`); params.to = { type: NVarChar(20), value: rangeTo }; }
      if (category) { filters.push('Category = @category'); params.category = { type: NVarChar(60), value: String(category) }; }

      const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
      const result = await query(`SELECT * FROM ${table} ${where} ORDER BY ${dateColumn} DESC, CreatedAt DESC`, params);
      return success(res, result.recordset);
    } catch (err) {
      logger.error(`Get ${lower} list:`, err);
      return error(res, `Failed to fetch ${lower} entries`);
    }
  };

  // GET /summary/:year/:month — totals by category + grand total
  const getMonthlySummary = async (req, res) => {
    try {
      const y = parseInt(req.params.year, 10);
      const m = parseInt(req.params.month, 10);
      if (!y || !m || m < 1 || m > 12) return error(res, 'Invalid year/month', 400);
      const from = `${y}-${String(m).padStart(2, '0')}-01`;
      const to = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);

      const result = await query(`
        SELECT Category, SUM(Amount) AS Total, COUNT(*) AS Count
        FROM ${table}
        WHERE ${dateColumn} >= @from AND ${dateColumn} <= @to
        GROUP BY Category
      `, { from: { type: NVarChar(20), value: from }, to: { type: NVarChar(20), value: to } });

      // Active categories from the DB, plus any inactive/legacy names still present in rows.
      const names = await categoriesService.categoryNames(ledger);
      result.recordset.forEach((r) => { if (!names.includes(r.Category)) names.push(r.Category); });
      const byCategory = names.map((cat) => {
        const row = result.recordset.find((r) => r.Category === cat);
        return { category: cat, total: row ? num(row.Total) : 0, count: row ? Number(row.Count) : 0 };
      });
      const grandTotal = byCategory.reduce((sum, r) => sum + r.total, 0);
      return success(res, { year: y, month: m, byCategory, grandTotal });
    } catch (err) {
      logger.error(`Get ${lower} summary:`, err);
      return error(res, `Failed to fetch ${lower} summary`);
    }
  };

  // GET /:id
  const getById = async (req, res) => {
    try {
      const row = await fetchOne(req.params.id);
      if (!row) return error(res, `${singular} not found`, 404);
      return success(res, row);
    } catch (err) {
      logger.error(`Get ${lower}:`, err);
      return error(res, `Failed to fetch ${lower}`);
    }
  };

  // POST /
  const create = async (req, res) => {
    try {
      const parsed = await parseBody(req.body || {});
      if (parsed.error) return error(res, parsed.error, 400);

      const id = generateId();
      const now = new Date().toISOString();
      await execute(`
        INSERT INTO ${table}
          (Id,Category,AccountName,ItemName,${partyColumn},Quantity,Unit,Amount,${dateColumn},PaymentMode,Notes,CreatedBy,CreatedAt,UpdatedAt)
        VALUES
          (@id,@category,@accountName,@itemName,@party,@quantity,@unit,@amount,@date,@mode,@notes,@createdBy,@now,@now)
      `, {
        ...parsed.values,
        id: { type: NVarChar(36), value: id },
        createdBy: { type: NVarChar(36), value: req.user?.id || null },
        now: { type: NVarChar(30), value: now },
      });

      return success(res, await fetchOne(id), `${singular} recorded`, 201);
    } catch (err) {
      logger.error(`Create ${lower}:`, err);
      return error(res, `Failed to record ${lower}`);
    }
  };

  // PUT /:id
  const update = async (req, res) => {
    try {
      const existing = await queryOne(`SELECT Id FROM ${table} WHERE Id=@id`, byId(req.params.id));
      if (!existing) return error(res, `${singular} not found`, 404);

      const parsed = await parseBody(req.body || {});
      if (parsed.error) return error(res, parsed.error, 400);

      await execute(`
        UPDATE ${table} SET
          Category=@category, AccountName=@accountName, ItemName=@itemName, ${partyColumn}=@party,
          Quantity=@quantity, Unit=@unit, Amount=@amount, ${dateColumn}=@date,
          PaymentMode=@mode, Notes=@notes, UpdatedAt=@now
        WHERE Id=@id
      `, {
        ...parsed.values,
        id: { type: NVarChar(36), value: req.params.id },
        now: { type: NVarChar(30), value: new Date().toISOString() },
      });

      return success(res, await fetchOne(req.params.id), `${singular} updated`);
    } catch (err) {
      logger.error(`Update ${lower}:`, err);
      return error(res, `Failed to update ${lower}`);
    }
  };

  // DELETE /:id
  const remove = async (req, res) => {
    try {
      const existing = await queryOne(`SELECT Id FROM ${table} WHERE Id=@id`, byId(req.params.id));
      if (!existing) return error(res, `${singular} not found`, 404);
      await execute(`DELETE FROM ${table} WHERE Id=@id`, byId(req.params.id));
      return success(res, null, `${singular} deleted`);
    } catch (err) {
      logger.error(`Delete ${lower}:`, err);
      return error(res, `Failed to delete ${lower}`);
    }
  };

  // GET /categories: active expense/income types (system + custom)
  const getCategories = async (req, res) => {
    try {
      return success(res, await categoriesService.listCategories(ledger));
    } catch (err) {
      logger.error(`Get ${lower} categories:`, err);
      return error(res, `Failed to fetch ${lower} categories`);
    }
  };

  // POST /categories { name }: add a custom type, e.g. "Machinery", "Pump"
  const createCategory = async (req, res) => {
    try {
      const result = await categoriesService.createCategory(ledger, req.body?.name);
      if (result.error) return error(res, result.error, result.status);
      return success(res, result.row, 'Category added', 201);
    } catch (err) {
      logger.error(`Create ${lower} category:`, err);
      return error(res, `Failed to add ${lower} category`);
    }
  };

  // DELETE /categories/:id: remove a custom type that is not in use
  const removeCategory = async (req, res) => {
    try {
      const result = await categoriesService.deleteCategory(ledger, req.params.id, table);
      if (result.error) return error(res, result.error, result.status);
      return success(res, null, 'Category removed');
    } catch (err) {
      logger.error(`Delete ${lower} category:`, err);
      return error(res, `Failed to remove ${lower} category`);
    }
  };

  return { CATEGORIES: categories, getAll, getMonthlySummary, getById, create, update, remove, getCategories, createCategory, removeCategory };
}

module.exports = { createLedgerController };
