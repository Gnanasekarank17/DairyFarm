// Shared finance constants — single source of truth for the Expenses and Income ledgers.
// The mobile app mirrors these lists in src/types/index.ts; keep both in sync.

const EXPENSE_CATEGORIES = Object.freeze([
  'Cattle Feed',
  'Medicine',
  'Doctor Fee',
  'Labour Salary',
  'Electricity (EB)',
  'Petty Cash',
  'Other',
]);

// Manual income entries. Milk collections (dbo.Payments) and delivered product orders
// (dbo.ProductOrders) are pulled in automatically by the finance reports, so they are
// deliberately NOT categories here — that would double count them.
const INCOME_CATEGORIES = Object.freeze([
  'Milk Sale (Direct)',
  'Cattle Sale',
  'Calf Sale',
  'Manure Sale',
  'Goat / Poultry Sale',
  'Egg Sale',
  'Subsidy / Grant',
  'Other',
]);

const PAYMENT_MODES = Object.freeze(['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other']);

// Labels used for the auto-derived income lines in the finance reports.
const AUTO_INCOME = Object.freeze({
  MILK_COLLECTION: 'Milk Collection (Payments)',
  PRODUCT_SALE: 'Product Sale (Orders)',
});

module.exports = { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_MODES, AUTO_INCOME };
