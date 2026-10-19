// Scheduled jobs.
//  - Long-running server (Docker / npm start): `start()` registers node-cron timers.
//  - Vercel: no timers survive between requests, so vercel.json defines a daily Vercel Cron
//    that calls GET /api/v1/cron/daily, which runs `runDaily()` below.
const { query } = require('../database/db');
const pushService = require('./notifications/push.service');
const { daysUntil } = require('../utils/helpers');
const logger = require('../config/logger');
const config = require('../config');

const getPushTokens = async () => {
  try {
    const result = await query("SELECT PushToken FROM dbo.Users WHERE IsActive=1 AND PushToken IS NOT NULL AND PushToken != ''");
    return result.recordset.map(u => u.PushToken).filter(Boolean);
  } catch {
    return [];
  }
};

// 7 AM: remind to update milk delivery
const deliveryReminder = async () => {
  const tokens = await getPushTokens();
  if (tokens.length) await pushService.sendPush(tokens, '🥛 Morning Reminder', "Update today's milk delivery status");
  logger.info('Daily delivery reminder sent');
  return { tokens: tokens.length };
};

// 1st of every month, 8 AM: invoice generation reminder
const invoiceReminder = async (now = new Date()) => {
  const tokens = await getPushTokens();
  const monthName = now.toLocaleString('en-IN', { month: 'long' });
  if (tokens.length) await pushService.sendPush(
    tokens,
    '📄 Monthly Invoices',
    `Time to generate invoices for ${monthName} ${now.getFullYear()}`
  );
  logger.info('Invoice generation reminder sent');
  return { tokens: tokens.length };
};

// 9 AM: calving and health alerts
const dailyAlerts = async () => {
  const tokens = await getPushTokens();

  const pregnancies = (await query(
    "SELECT ExpectedCalvingDate, CowId FROM dbo.PregnancyRecords WHERE Status='Pregnant'"
  )).recordset;

  const dueSoon = pregnancies.filter(p => { const d = daysUntil(p.ExpectedCalvingDate); return d >= 0 && d <= 7; });
  const overdue = pregnancies.filter(p => daysUntil(p.ExpectedCalvingDate) < 0);

  if (tokens.length) {
    if (dueSoon.length > 0)
      await pushService.sendPush(tokens, '🐄 Calving Alert', `${dueSoon.length} cow(s) due within 7 days!`);
    if (overdue.length > 0)
      await pushService.sendPush(tokens, '⚠️ Overdue Calving', `${overdue.length} cow(s) are overdue for calving!`);
  }

  const healthRecords = (await query(
    "SELECT NextDueDate FROM dbo.HealthRecords WHERE NextDueDate IS NOT NULL AND NextDueDate != ''"
  )).recordset;

  const dueHealth = healthRecords.filter(h => { const d = daysUntil(h.NextDueDate); return d >= 0 && d <= 3; });
  if (tokens.length && dueHealth.length > 0)
    await pushService.sendPush(tokens, '💉 Health Alert', `${dueHealth.length} health record(s) due soon`);

  logger.info('Daily alerts sent');
  return { dueSoon: dueSoon.length, overdue: overdue.length, dueHealth: dueHealth.length };
};

// 8 AM: mating-cycle reminders (21-day interval) to admin/supervisor/caretaker
const matingCycleReminders = async () => {
  const tokens = await pushService.getTokensByRoles(['admin', 'supervisor', 'cattlecaretaker']);
  if (!tokens.length) return { due: 0, tokens: 0 };

  const pending = (await query(
    `SELECT br.Id, br.NextCheckDate, cm.Name AS CowName, cm.TagNumber
     FROM dbo.BreedingRecords br
     JOIN dbo.CowMaster cm ON cm.Id = br.CowId
     WHERE br.ConceptionStatus='Pending'
       AND br.ReminderSent=0
       AND br.NextCheckDate IS NOT NULL`
  )).recordset;

  const due = pending.filter((r) => daysUntil(r.NextCheckDate) <= 0);
  for (const r of due) {
    const label = `${r.CowName}${r.TagNumber ? ` (#${r.TagNumber})` : ''}`;
    await pushService.sendPush(
      tokens,
      '🐄 Mating cycle check',
      `${label} is due for a cycle check (${r.NextCheckDate}). Confirm pregnancy or re-mate.`,
      { type: 'mating_cycle_due', breedingId: r.Id }
    );
    await query(`UPDATE dbo.BreedingRecords SET ReminderSent=1 WHERE Id='${r.Id.replace(/'/g, "''")}'`);
  }

  if (due.length) logger.info(`Mating cycle reminders sent: ${due.length}`);
  return { due: due.length, tokens: tokens.length };
};

// Midnight: log daily milk totals (lightweight backup marker)
const midnightMilkLog = async () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10);

  const result = await query(
    `SELECT SUM(TotalMilk) AS Total FROM dbo.MilkProduction WHERE ProductionDate='${dateStr}'`
  );
  const total = (result.recordset[0] && result.recordset[0].Total) || 0;
  logger.info(`[Midnight] Farm total milk for ${dateStr}: ${total} L`);
  return { date: dateStr, totalMilk: total };
};

const jobs = { deliveryReminder, invoiceReminder, dailyAlerts, matingCycleReminders, midnightMilkLog };

const safeRun = async (name, fn) => {
  try {
    return { job: name, ok: true, result: await fn() };
  } catch (err) {
    logger.error(`${name} error:`, err);
    return { job: name, ok: false, error: err.message };
  }
};

/**
 * Run every job once (used by Vercel Cron). The invoice reminder only runs on the 1st of the month
 * in Indian time unless `force` is set.
 */
const runDaily = async ({ force = false, now = new Date() } = {}) => {
  const istDay = Number(now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric' }));
  const results = [
    await safeRun('midnightMilkLog', midnightMilkLog),
    await safeRun('deliveryReminder', deliveryReminder),
    await safeRun('matingCycleReminders', matingCycleReminders),
    await safeRun('dailyAlerts', dailyAlerts),
  ];
  if (force || istDay === 1) results.push(await safeRun('invoiceReminder', () => invoiceReminder(now)));
  return results;
};

let started = false;
const start = () => {
  if (started || config.isServerless) return;
  started = true;
  // Loaded lazily so the serverless bundle never schedules timers.
  const cron = require('node-cron');
  cron.schedule('0 7 * * *', () => safeRun('deliveryReminder', deliveryReminder));
  cron.schedule('0 8 1 * *', () => safeRun('invoiceReminder', () => invoiceReminder()));
  cron.schedule('0 9 * * *', () => safeRun('dailyAlerts', dailyAlerts));
  cron.schedule('0 8 * * *', () => safeRun('matingCycleReminders', matingCycleReminders));
  cron.schedule('0 0 * * *', () => safeRun('midnightMilkLog', midnightMilkLog));
  logger.info('Scheduler initialized');
};

module.exports = { start, runDaily, jobs };
