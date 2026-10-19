const cron = require('node-cron');
const { query } = require('../database/db');
const pushService = require('./notifications/push.service');
const { daysUntil } = require('../utils/helpers');
const logger = require('../config/logger');

const getPushTokens = async () => {
  try {
    const result = await query('SELECT PushToken FROM dbo.Users WHERE IsActive=1 AND PushToken IS NOT NULL AND PushToken != \'\'');
    return result.recordset.map(u => u.PushToken).filter(Boolean);
  } catch {
    return [];
  }
};

// Daily 7 AM: remind to update milk delivery
cron.schedule('0 7 * * *', async () => {
  try {
    const tokens = await getPushTokens();
    if (tokens.length) await pushService.sendPush(tokens, '🥛 Morning Reminder', "Update today's milk delivery status");
    logger.info('Daily delivery reminder sent');
  } catch (err) {
    logger.error('Daily reminder error:', err);
  }
});

// 1st of every month at 8 AM: invoice generation reminder
cron.schedule('0 8 1 * *', async () => {
  try {
    const tokens = await getPushTokens();
    const now = new Date();
    const monthName = now.toLocaleString('en-IN', { month: 'long' });
    if (tokens.length) await pushService.sendPush(
      tokens,
      '📄 Monthly Invoices',
      `Time to generate invoices for ${monthName} ${now.getFullYear()}`
    );
    logger.info('Invoice generation reminder sent');
  } catch (err) {
    logger.error('Invoice reminder error:', err);
  }
});

// Daily 9 AM: calving and health alerts
cron.schedule('0 9 * * *', async () => {
  try {
    const tokens = await getPushTokens();

    // Calving alerts
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

    // Health record due-date alerts
    const healthRecords = (await query(
      'SELECT NextDueDate FROM dbo.HealthRecords WHERE NextDueDate IS NOT NULL AND NextDueDate != \'\''
    )).recordset;

    const dueHealth = healthRecords.filter(h => { const d = daysUntil(h.NextDueDate); return d >= 0 && d <= 3; });
    if (tokens.length && dueHealth.length > 0)
      await pushService.sendPush(tokens, '💉 Health Alert', `${dueHealth.length} health record(s) due soon`);

    logger.info('Daily alerts sent');
  } catch (err) {
    logger.error('Daily alerts error:', err);
  }
});

// Daily 8 AM: mating-cycle reminders (21-day interval) to admin/supervisor/caretaker
cron.schedule('0 8 * * *', async () => {
  try {
    const tokens = await pushService.getTokensByRoles(['admin', 'supervisor', 'cattlecaretaker']);
    if (!tokens.length) return;

    // Pending matings whose next cycle check falls today or is overdue, not yet reminded.
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
  } catch (err) {
    logger.error('Mating cycle reminder error:', err);
  }
});

// Daily midnight: log daily milk totals (lightweight backup marker)
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().slice(0, 10);

    const result = await query(
      `SELECT SUM(TotalMilk) AS Total FROM dbo.MilkProduction WHERE ProductionDate='${dateStr}'`
    );
    const total = result.recordset[0]?.Total || 0;
    logger.info(`[Midnight] Farm total milk for ${dateStr}: ${total} L`);
  } catch (err) {
    logger.error('Midnight job error:', err);
  }
});

logger.info('Scheduler initialized');
