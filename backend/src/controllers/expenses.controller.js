// Expenses ledger — cattle feed, medicine, doctor fee, labour salary, EB, petty cash, other.
// Built from the shared ledger factory; see ledger.factory.js for the handlers.
const { createLedgerController } = require('./ledger.factory');
const { EXPENSE_CATEGORIES } = require('../config/finance');

module.exports = createLedgerController({
  ledger: 'expense',
  table: 'dbo.Expenses',
  singular: 'Expense',
  dateColumn: 'ExpenseDate',
  dateField: 'expenseDate',
  partyColumn: 'Vendor',
  partyField: 'vendor',
  categories: EXPENSE_CATEGORIES,
});
