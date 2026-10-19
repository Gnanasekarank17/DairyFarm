const { query, queryOne, NVarChar, SmallInt, TinyInt } = require('../database/db');
const { success, error } = require('../utils/response');
const { today } = require('../utils/helpers');
const { normalizeRole } = require('../config/rbac');
const { calculateCustomerMonthBill } = require('../services/billing.service');
const logger = require('../config/logger');
const finance = require('../services/finance.service');

const getSummary = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) === 'customer') {
      return getCustomerSummary(req, res);
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const todayStr = today();

    const [custResult, invResult, cowResult, pregResult, financeMonth, financeTrend] = await Promise.all([
      query('SELECT IsActive FROM dbo.Customers'),
      query(`SELECT Amount, PaymentStatus FROM dbo.Invoices WHERE [Year]=${year} AND [Month]=${month}`),
      query('SELECT CurrentStatus FROM dbo.CowMaster'),
      query(`SELECT ExpectedCalvingDate FROM dbo.PregnancyRecords WHERE Status='Pregnant'`),
      finance.getMonthSummary(year, month),
      finance.getRecentTrend(year, month, 6),
    ]);

    const customers = custResult.recordset;
    const invoices  = invResult.recordset;
    const cows      = cowResult.recordset;
    const pregnancies = pregResult.recordset;

    // Today's delivery stats from Deliveries table
    const delivResult = await query(
      `SELECT DeliveryData FROM dbo.Deliveries WHERE [Year]=${year} AND [Month]=${month}`
    );
    let todayDelivered = 0, todayMissed = 0;
    delivResult.recordset.forEach(d => {
      const data = JSON.parse(d.DeliveryData || '{}');
      if (data[todayStr] === false) todayMissed++; else todayDelivered++;
    });

    const monthRevenue = invoices.reduce((s, i) => s + parseFloat(i.Amount || 0), 0);
    const pendingInvoices = invoices.filter(i => i.PaymentStatus !== 'Paid');
    const pendingAmount   = pendingInvoices.reduce((s, i) => s + parseFloat(i.Amount || 0), 0);

    const dueSoon = pregnancies.filter(p => {
      const days = Math.ceil((new Date(p.ExpectedCalvingDate) - now) / 86400000);
      return days >= 0 && days <= 30;
    }).length;

    return success(res, {
      customers: {
        total:    customers.length,
        active:   customers.filter(c => c.IsActive).length,
        inactive: customers.filter(c => !c.IsActive).length,
      },
      deliveries: {
        todayDelivered,
        todayMissed,
        activeCustomers: customers.filter(c => c.IsActive).length,
      },
      revenue: { monthly: monthRevenue, pendingAmount },
      payments: {
        paid:   invoices.filter(i => i.PaymentStatus === 'Paid').length,
        unpaid: pendingInvoices.length,
        pending: pendingInvoices.length,
      },
      cows: {
        total:     cows.length,
        active:    cows.filter(c => c.CurrentStatus === 'Active').length,
        pregnant:  cows.filter(c => c.CurrentStatus === 'Pregnant').length,
        dryPeriod: cows.filter(c => c.CurrentStatus === 'Dry Period').length,
      },
      pregnancies: { active: pregnancies.length, dueSoon },
      // Income vs expense for the current month + trailing 6-month trend (see finance.service.js)
      finance: {
        year,
        month,
        income: financeMonth.income.total,
        milkPayments: financeMonth.income.milkPayments,
        otherIncome: financeMonth.income.otherItemSales + financeMonth.income.manual,
        expense: financeMonth.expense.total,
        net: financeMonth.netProfit,
        expenseByCategory: financeMonth.expense.byCategory
          .filter((r) => r.total > 0)
          .sort((a, b) => b.total - a.total),
        trend: financeTrend,
      },
    });
  } catch (err) {
    logger.error('Dashboard summary:', err);
    return error(res, 'Failed to fetch dashboard data');
  }
};

const getCustomerSummary = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== 'customer') {
      return error(res, 'Customer access required', 403);
    }

    const customerId = req.user?.customerIds?.[0];
    if (!customerId) return error(res, 'Customer account is not linked', 404);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const lastMonthDate = new Date(year, month - 2, 1);
    const lastMonthYear = lastMonthDate.getFullYear();
    const lastMonth = lastMonthDate.getMonth() + 1;

    const customer = await queryOne('SELECT * FROM dbo.Customers WHERE Id=@id', {
      id: { type: NVarChar(36), value: customerId },
    });
    if (!customer) return error(res, 'Customer not found', 404);

    const delivery = await queryOne(
      'SELECT DeliveredDays,MissedDays,TotalQuantity,TotalAmount FROM dbo.Deliveries WHERE CustomerId=@id AND [Year]=@year AND [Month]=@month',
      {
        id: { type: NVarChar(36), value: customerId },
        year: { type: SmallInt, value: year },
        month: { type: TinyInt, value: month },
      }
    );

    const invoices = (await query(
      'SELECT Amount, PaymentStatus FROM dbo.Invoices WHERE CustomerId=@id',
      { id: { type: NVarChar(36), value: customerId } }
    )).recordset;

    const lastMonthInvoices = (await query(
      'SELECT Amount, PaymentStatus FROM dbo.Invoices WHERE CustomerId=@id AND [Year]=@year AND [Month]=@month',
      {
        id: { type: NVarChar(36), value: customerId },
        year: { type: SmallInt, value: lastMonthYear },
        month: { type: TinyInt, value: lastMonth },
      }
    )).recordset;

    const requests = (await query(
      `SELECT TOP 20 * FROM dbo.CustomerDeliveryRequests WHERE CustomerId=@id ORDER BY CreatedAt DESC`,
      { id: { type: NVarChar(36), value: customerId } }
    )).recordset;

    const pendingDues = invoices
      .filter((invoice) => invoice.PaymentStatus !== 'Paid')
      .reduce((sum, invoice) => sum + parseFloat(invoice.Amount || 0), 0);
    const lastMonthDue = lastMonthInvoices
      .filter((invoice) => invoice.PaymentStatus !== 'Paid')
      .reduce((sum, invoice) => sum + parseFloat(invoice.Amount || 0), 0);
    const currentMonthBill = await calculateCustomerMonthBill(customer, year, month);

    return success(res, {
      customer: {
        id: customer.Id,
        name: customer.Name,
        mobile: customer.Mobile,
        email: customer.Email,
        address: customer.Address,
        dailyQuantity: String(customer.DailyQuantity || 0),
        milkType: customer.MilkType,
        ratePerLiter: String(customer.RatePerLiter || 0),
        billingMode: customer.BillingMode,
      },
      currentMonth: { year, month },
      lastMonth: { year: lastMonthYear, month: lastMonth },
      milk: {
        averageLiters: currentMonthBill.deliveredDays > 0 ? currentMonthBill.totalQuantity / currentMonthBill.deliveredDays : parseFloat(customer.DailyQuantity || 0),
        totalLiters: currentMonthBill.totalQuantity,
        extraLiters: currentMonthBill.extraLiters,
      },
      delivery: {
        deliveredDays: currentMonthBill.deliveredDays,
        missedDays: currentMonthBill.missedDays,
      },
      billing: {
        pendingDues,
        lastMonthDue,
        currentMonthEstimate: currentMonthBill.amount,
        currentMonthCutoffDate: currentMonthBill.cutoffDate,
        invoiceCount: invoices.length,
        pendingInvoices: invoices.filter((invoice) => invoice.PaymentStatus !== 'Paid').length,
      },
      recentRequests: requests.map((request) => ({
        id: request.Id,
        requestDate: request.RequestDate,
        requestType: request.RequestType,
        extraQuantity: String(request.ExtraQuantity || 0),
        reason: request.Reason || '',
        status: request.Status,
        actionReason: request.ActionReason || '',
        actionBy: request.ActionBy || '',
        actionAt: request.ActionAt || '',
      })),
    });
  } catch (err) {
    logger.error('Customer dashboard summary:', err);
    return error(res, 'Failed to fetch customer dashboard data');
  }
};

module.exports = { getSummary, getCustomerSummary };
