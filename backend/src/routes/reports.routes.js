const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const { query } = require('../database/db');
const { success, error } = require('../utils/response');
const finance = require('../services/finance.service');
const logger = require('../config/logger');

router.use(authenticate);
router.use(requirePermission(PERMISSIONS.REPORTS_VIEW));

// GET /reports/monthly-excel/:year/:month
router.get('/monthly-excel/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const y = parseInt(year); const m = parseInt(month);

    const invoices = (await query(
      `SELECT * FROM dbo.Invoices WHERE [Year]=${y} AND [Month]=${m} ORDER BY CustomerName`
    )).recordset;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Dairy Farm App';
    const ws = wb.addWorksheet(`${month}-${year}`);

    ws.columns = [
      { header: 'Invoice No',      key: 'InvoiceNumber',  width: 22 },
      { header: 'Customer',        key: 'CustomerName',   width: 25 },
      { header: 'Daily Qty (L)',   key: 'DailyQuantity',  width: 14 },
      { header: 'Rate/L (₹)',      key: 'RatePerLiter',   width: 12 },
      { header: 'Delivered Days',  key: 'DeliveredDays',  width: 16 },
      { header: 'Missed Days',     key: 'MissedDays',     width: 13 },
      { header: 'Total Qty (L)',   key: 'TotalQuantity',  width: 14 },
      { header: 'Amount (₹)',      key: 'Amount',         width: 14 },
      { header: 'Status',          key: 'PaymentStatus',  width: 12 },
    ];

    // Style header row
    ws.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D6A4F' } };
    });

    invoices.forEach(inv => ws.addRow(inv));

    // Summary row
    const totalAmount = invoices.reduce((s, i) => s + parseFloat(i.Amount || 0), 0);
    const summaryRow = ws.addRow({ CustomerName: 'TOTAL', Amount: totalAmount });
    summaryRow.font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Monthly_Report_${year}_${month}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    return error(res, 'Report generation failed');
  }
});

// GET /reports/delivery-exceptions
router.get('/delivery-exceptions', async (req, res) => {
  try {
    const result = await query(`
      SELECT al.*, u.Name AS UserName
      FROM dbo.AuditLog al
      LEFT JOIN dbo.Users u ON u.Id = al.UserId
      WHERE al.Action='UPDATE_DELIVERY'
      ORDER BY al.CreatedAt DESC
    `);
    return success(res, result.recordset);
  } catch (err) {
    return error(res, 'Failed to fetch delivery exceptions');
  }
});

// GET /reports/pending-payments
router.get('/pending-payments', async (req, res) => {
  try {
    const result = await query(`
      SELECT i.*, c.Mobile, c.Email
      FROM dbo.Invoices i
      JOIN dbo.Customers c ON c.Id = i.CustomerId
      WHERE i.PaymentStatus IN ('Pending','Partial')
      ORDER BY i.CreatedAt DESC
    `);
    const total = result.recordset.reduce((s, r) => s + parseFloat(r.Amount || 0), 0);
    return success(res, { pending: result.recordset, totalPending: total });
  } catch (err) {
    return error(res, 'Failed to fetch pending payments report');
  }
});

// GET /reports/pregnant-cows
router.get('/pregnant-cows', async (req, res) => {
  try {
    const result = await query(`
      SELECT pr.*, cm.Name AS CowName, cm.TagNumber, br.MatingDate, br.BullName
      FROM dbo.PregnancyRecords pr
      JOIN dbo.CowMaster cm ON cm.Id = pr.CowId
      LEFT JOIN dbo.BreedingRecords br ON br.Id = pr.BreedingId
      WHERE pr.Status = 'Pregnant'
      ORDER BY pr.ExpectedCalvingDate ASC
    `);
    const enriched = result.recordset.map(p => ({
      ...p,
      daysRemaining: Math.ceil((new Date(p.ExpectedCalvingDate) - new Date()) / 86400000),
    }));
    return success(res, enriched);
  } catch (err) {
    return error(res, 'Failed to fetch pregnant cows report');
  }
});

// GET /reports/milk-production/:year/:month
router.get('/milk-production/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const y = parseInt(year); const m = parseInt(month);
    const from = `${y}-${String(m).padStart(2,'0')}-01`;
    const to   = new Date(y, m, 0).toISOString().slice(0, 10);

    const result = await query(`
      SELECT mp.CowId, cm.Name AS CowName, cm.TagNumber,
             SUM(mp.TotalMilk) AS TotalMilk,
             AVG(mp.TotalMilk) AS AvgDaily,
             COUNT(mp.Id)      AS RecordedDays
      FROM dbo.MilkProduction mp
      JOIN dbo.CowMaster cm ON cm.Id = mp.CowId
      WHERE mp.ProductionDate >= '${from}' AND mp.ProductionDate <= '${to}'
      GROUP BY mp.CowId, cm.Name, cm.TagNumber
      ORDER BY TotalMilk DESC
    `);

    const grandTotal = result.recordset.reduce((s, r) => s + parseFloat(r.TotalMilk || 0), 0);
    return success(res, { year, month, data: result.recordset, grandTotal });
  } catch (err) {
    return error(res, 'Failed to fetch milk production report');
  }
});

// GET /reports/monthly-finance/:year/:month — income (milk payments + product orders + manual income)
// vs expenses by category, with net profit/loss.
router.get('/monthly-finance/:year/:month', async (req, res) => {
  try {
    const y = parseInt(req.params.year, 10);
    const m = parseInt(req.params.month, 10);
    if (!y || !m || m < 1 || m > 12) return error(res, 'Invalid year/month', 400);
    return success(res, await finance.getMonthSummary(y, m));
  } catch (err) {
    logger.error('Monthly finance report:', err);
    return error(res, 'Failed to fetch monthly finance report');
  }
});

// GET /reports/finance-ledger/:year/:month — flat cash book (every income + expense line) with running balance
router.get('/finance-ledger/:year/:month', async (req, res) => {
  try {
    const y = parseInt(req.params.year, 10);
    const m = parseInt(req.params.month, 10);
    if (!y || !m || m < 1 || m > 12) return error(res, 'Invalid year/month', 400);
    return success(res, await finance.getLedger(y, m));
  } catch (err) {
    logger.error('Finance ledger report:', err);
    return error(res, 'Failed to fetch finance ledger');
  }
});

// GET /reports/finance-trend/:year — Jan..Dec income / expense / net for charts
router.get('/finance-trend/:year', async (req, res) => {
  try {
    const y = parseInt(req.params.year, 10);
    if (!y) return error(res, 'Invalid year', 400);
    return success(res, { year: y, months: await finance.getYearTrend(y) });
  } catch (err) {
    logger.error('Finance trend report:', err);
    return error(res, 'Failed to fetch finance trend');
  }
});

module.exports = router;
