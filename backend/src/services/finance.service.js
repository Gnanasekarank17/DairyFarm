// Finance aggregation shared by the reports routes and the dashboard controller.
// Income = milk collections (Payments) + delivered product orders + manual Income ledger.
// Expense = Expenses ledger.
const { query, NVarChar } = require('../database/db');
const { AUTO_INCOME } = require('../config/finance');
const { categoryNames } = require('./categories.service');

const toNum = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

// Dates come back as 'yyyy-MM-dd' strings from the NVARCHAR ledgers but as JS Date objects from
// real DATE columns (dbo.Payments.PaymentDate). Normalise both to 'yyyy-MM-dd'.
const isoDate = (v) => {
  if (!v) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
};

const monthRange = (year, month) => {
  const y = Number(year);
  const m = Number(month);
  const from = `${y}-${String(m).padStart(2, '0')}-01`;
  const to = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  return { from, to };
};

const rangeParams = (from, to) => ({
  from: { type: NVarChar(20), value: from },
  to: { type: NVarChar(20), value: to },
});

// Active DB categories in order, plus any legacy/inactive names still present in the rows.
const fillCategories = (categories, rows) => {
  const names = [...categories];
  rows.forEach((r) => { if (!names.includes(r.Category)) names.push(r.Category); });
  return names.map((cat) => {
    const row = rows.find((r) => r.Category === cat);
    return { category: cat, total: row ? toNum(row.Total) : 0, count: row ? Number(row.Count || 0) : 0 };
  });
};

// Totals for one calendar month, broken down by category.
async function getMonthSummary(year, month) {
  const { from, to } = monthRange(year, month);
  const p = rangeParams(from, to);

  const [milk, orders, incomeRows, expenseRows, incomeCats, expenseCats] = await Promise.all([
    query('SELECT ISNULL(SUM(AmountPaid),0) AS Total FROM dbo.Payments WHERE PaymentDate >= @from AND PaymentDate <= @to', p),
    query("SELECT ISNULL(SUM(TotalAmount),0) AS Total FROM dbo.ProductOrders WHERE Status='Delivered' AND OrderDate >= @from AND OrderDate <= @to", p),
    query('SELECT Category, SUM(Amount) AS Total, COUNT(*) AS Count FROM dbo.Income WHERE IncomeDate >= @from AND IncomeDate <= @to GROUP BY Category', p),
    query('SELECT Category, SUM(Amount) AS Total, COUNT(*) AS Count FROM dbo.Expenses WHERE ExpenseDate >= @from AND ExpenseDate <= @to GROUP BY Category', p),
    categoryNames('income'),
    categoryNames('expense'),
  ]);

  const milkPayments = toNum(milk.recordset[0]?.Total);
  const otherItemSales = toNum(orders.recordset[0]?.Total);
  const incomeByCategory = fillCategories(incomeCats, incomeRows.recordset);
  const manualIncome = incomeByCategory.reduce((s, r) => s + r.total, 0);
  const expenseByCategory = fillCategories(expenseCats, expenseRows.recordset);
  const totalExpense = expenseByCategory.reduce((s, r) => s + r.total, 0);
  const totalIncome = milkPayments + otherItemSales + manualIncome;

  return {
    year: Number(year),
    month: Number(month),
    income: {
      milkPayments,
      otherItemSales,
      manual: manualIncome,
      byCategory: incomeByCategory,
      total: totalIncome,
    },
    expense: { byCategory: expenseByCategory, total: totalExpense },
    netProfit: totalIncome - totalExpense,
  };
}

// Income / expense / net for every month of a calendar year (Jan..Dec), in one round trip per source.
async function getYearTrend(year) {
  const y = Number(year);
  const p = rangeParams(`${y}-01-01`, `${y}-12-31`);
  // Works for both NVARCHAR 'yyyy-MM-dd' columns and real DATE columns (Payments.PaymentDate).
  const byMonth = (col) => `MONTH(TRY_CONVERT(date, ${col}))`;

  const [milk, orders, income, expense] = await Promise.all([
    query(`SELECT ${byMonth('PaymentDate')} AS M, SUM(AmountPaid) AS Total FROM dbo.Payments WHERE PaymentDate >= @from AND PaymentDate <= @to GROUP BY ${byMonth('PaymentDate')}`, p),
    query(`SELECT ${byMonth('OrderDate')} AS M, SUM(TotalAmount) AS Total FROM dbo.ProductOrders WHERE Status='Delivered' AND OrderDate >= @from AND OrderDate <= @to GROUP BY ${byMonth('OrderDate')}`, p),
    query(`SELECT ${byMonth('IncomeDate')} AS M, SUM(Amount) AS Total FROM dbo.Income WHERE IncomeDate >= @from AND IncomeDate <= @to GROUP BY ${byMonth('IncomeDate')}`, p),
    query(`SELECT ${byMonth('ExpenseDate')} AS M, SUM(Amount) AS Total FROM dbo.Expenses WHERE ExpenseDate >= @from AND ExpenseDate <= @to GROUP BY ${byMonth('ExpenseDate')}`, p),
  ]);

  const pick = (rs, m) => toNum(rs.recordset.find((r) => Number(r.M) === m)?.Total);

  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const inc = pick(milk, m) + pick(orders, m) + pick(income, m);
    const exp = pick(expense, m);
    return { year: y, month: m, income: inc, expense: exp, net: inc - exp };
  });
}

// Trailing N months ending at (year, month) — used by the dashboard sparkline.
async function getRecentTrend(year, month, months = 6) {
  const y = Number(year);
  const m = Number(month);
  const years = new Set([y]);
  if (m - months + 1 <= 0) years.add(y - 1);
  const trends = (await Promise.all([...years].sort().map(getYearTrend))).flat();

  const out = [];
  for (let i = months - 1; i >= 0; i--) {
    let mm = m - i;
    let yy = y;
    if (mm <= 0) { mm += 12; yy -= 1; }
    const point = trends.find((t) => t.year === yy && t.month === mm) || { year: yy, month: mm, income: 0, expense: 0, net: 0 };
    out.push(point);
  }
  return out;
}

// Flat cash-book for one month: manual income + expenses + auto income lines, newest first.
async function getLedger(year, month) {
  const { from, to } = monthRange(year, month);
  const p = rangeParams(from, to);

  const [income, expenses, payments, orders] = await Promise.all([
    query('SELECT Id, Category, AccountName, ItemName, Source, Quantity, Unit, Amount, IncomeDate, PaymentMode, Notes FROM dbo.Income WHERE IncomeDate >= @from AND IncomeDate <= @to', p),
    query('SELECT Id, Category, AccountName, ItemName, Vendor, Quantity, Unit, Amount, ExpenseDate, PaymentMode, Notes FROM dbo.Expenses WHERE ExpenseDate >= @from AND ExpenseDate <= @to', p),
    query(`SELECT p.Id, p.InvoiceNumber, p.AmountPaid, p.PaymentDate, p.PaymentMode, p.Notes, c.Name AS CustomerName
           FROM dbo.Payments p LEFT JOIN dbo.Customers c ON c.Id = p.CustomerId
           WHERE p.PaymentDate >= @from AND p.PaymentDate <= @to AND p.AmountPaid > 0`, p),
    query(`SELECT o.Id, o.TotalAmount, o.OrderDate, c.Name AS CustomerName
           FROM dbo.ProductOrders o LEFT JOIN dbo.Customers c ON c.Id = o.CustomerId
           WHERE o.Status='Delivered' AND o.OrderDate >= @from AND o.OrderDate <= @to`, p),
  ]);

  const rows = [
    ...income.recordset.map((r) => ({
      id: r.Id, type: 'Income', source: 'income', date: isoDate(r.IncomeDate),
      category: r.Category === 'Other' && r.AccountName ? `Other - ${r.AccountName}` : r.Category,
      description: [r.ItemName, r.Quantity ? `${toNum(r.Quantity)} ${r.Unit || ''}`.trim() : null].filter(Boolean).join(' • '),
      party: r.Source || '', paymentMode: r.PaymentMode || '', notes: r.Notes || '',
      income: toNum(r.Amount), expense: 0,
    })),
    ...expenses.recordset.map((r) => ({
      id: r.Id, type: 'Expense', source: 'expenses', date: isoDate(r.ExpenseDate),
      category: r.Category === 'Other' && r.AccountName ? `Other - ${r.AccountName}` : r.Category,
      description: [r.ItemName, r.Quantity ? `${toNum(r.Quantity)} ${r.Unit || ''}`.trim() : null].filter(Boolean).join(' • '),
      party: r.Vendor || '', paymentMode: r.PaymentMode || '', notes: r.Notes || '',
      income: 0, expense: toNum(r.Amount),
    })),
    ...payments.recordset.map((r) => ({
      id: r.Id, type: 'Income', source: 'payments', date: isoDate(r.PaymentDate),
      category: AUTO_INCOME.MILK_COLLECTION,
      description: r.InvoiceNumber || '', party: r.CustomerName || '',
      paymentMode: r.PaymentMode || '', notes: r.Notes || '',
      income: toNum(r.AmountPaid), expense: 0,
    })),
    ...orders.recordset.map((r) => ({
      id: r.Id, type: 'Income', source: 'orders', date: isoDate(r.OrderDate),
      category: AUTO_INCOME.PRODUCT_SALE,
      description: 'Delivered product order', party: r.CustomerName || '',
      paymentMode: '', notes: '',
      income: toNum(r.TotalAmount), expense: 0,
    })),
  ];

  rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  let balance = 0;
  rows.forEach((r) => { balance += r.income - r.expense; r.balance = balance; });
  rows.reverse();

  const totalIncome = rows.reduce((s, r) => s + r.income, 0);
  const totalExpense = rows.reduce((s, r) => s + r.expense, 0);
  return { year: Number(year), month: Number(month), rows, totalIncome, totalExpense, net: totalIncome - totalExpense };
}

module.exports = { isoDate, monthRange, getMonthSummary, getYearTrend, getRecentTrend, getLedger };
