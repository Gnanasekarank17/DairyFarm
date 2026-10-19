// Income ledger — manual income (cattle/calf/manure sales, subsidies, direct milk sales, other).
// Milk collections and product orders are NOT entered here; the finance reports pull them
// automatically from dbo.Payments / dbo.ProductOrders.
const { createLedgerController } = require('./ledger.factory');
const { INCOME_CATEGORIES } = require('../config/finance');

module.exports = createLedgerController({
  ledger: 'income',
  table: 'dbo.Income',
  singular: 'Income',
  dateColumn: 'IncomeDate',
  dateField: 'incomeDate',
  partyColumn: 'Source',
  partyField: 'source',
  categories: INCOME_CATEGORIES,
});
