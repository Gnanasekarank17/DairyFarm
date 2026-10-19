/**
 * Seed delivery data for June 2026 - 3 sample clients with mixed delivered/missed days
 * Run: node src/utils/seedDeliveryData.js
 */
require('dotenv').config();
const { query, execute, NVarChar, SmallInt, Decimal, sql } = require('../database/db');
const { generateId } = require('./helpers');

const seedDeliveryData = async () => {
  try {
    console.log('📊 Seeding delivery data for 3 clients in June 2026...\n');

    // Get first 3 active customers
    const result = await query('SELECT TOP 3 Id, Name, DailyQuantity, RatePerLiter FROM dbo.Customers WHERE IsActive=1 ORDER BY Name');
    const customers = result.recordset;

    if (customers.length === 0) {
      console.log('❌ No active customers found. Please add customers first.');
      process.exit(1);
    }

    // Sample delivery data for 3 clients - different missed days with reasons
    const sampleData = [
      {
        customerId: null,
        missedDays: [
          { date: '2026-06-05', reason: 'Customer Out Of Station', comment: 'Customer went to native place for family event' },
          { date: '2026-06-12', reason: 'Milk Not Available', comment: 'Cow was not producing milk that day' },
        ],
      },
      {
        customerId: null,
        missedDays: [
          { date: '2026-06-04', reason: 'Holiday', comment: 'Local holiday - delivery not required' },
          { date: '2026-06-10', reason: 'Customer Requested Skip', comment: 'Customer requested to skip delivery' },
          { date: '2026-06-18', reason: 'Weather Conditions', comment: 'Heavy rain - delivery not possible' },
        ],
      },
      {
        customerId: null,
        missedDays: [
          { date: '2026-06-08', reason: 'Payment Pending', comment: 'Previous month payment not received' },
          { date: '2026-06-15', reason: 'Delivery Issue', comment: 'Vehicle broke down on delivery route' },
          { date: '2026-06-22', reason: 'Customer Cancelled', comment: 'Customer cancelled for the day' },
          { date: '2026-06-28', reason: 'Festival Leave', comment: 'Festival holiday - delivery suspended' },
        ],
      },
    ];

    for (let idx = 0; idx < customers.length; idx++) {
      const customer = customers[idx];
      const template = sampleData[idx];
      template.customerId = customer.Id;

      // Check if delivery record already exists for June 2026
      const existing = await query(
        'SELECT Id FROM dbo.Deliveries WHERE CustomerId=@cid AND [Year]=2026 AND [Month]=6',
        { cid: { type: NVarChar(36), value: customer.Id } }
      );

      if (existing.recordset.length > 0) {
        console.log(`⏭️  ${customer.Name} already has June 2026 delivery record. Skipping...`);
        continue;
      }

      // Create delivery data for all 30 days of June, all true initially
      const deliveryData = {};
      for (let d = 1; d <= 30; d++) {
        const dateStr = `2026-06-${String(d).padStart(2, '0')}`;
        deliveryData[dateStr] = true;
      }

      // Mark missed days as false
      template.missedDays.forEach((md) => {
        deliveryData[md.date] = false;
      });

      const deliveredCount = Object.values(deliveryData).filter(Boolean).length;
      const missedCount = 30 - deliveredCount;
      const qty = parseFloat(customer.DailyQuantity || 0);
      const rate = parseFloat(customer.RatePerLiter || 0);
      const totalQty = deliveredCount * qty;
      const totalAmount = totalQty * rate;

      const deliveryId = generateId();

      // Insert delivery record
      await execute(
        `INSERT INTO dbo.Deliveries
          (Id, CustomerId, [Year], [Month], DeliveryData, DeliveredDays, MissedDays, TotalQuantity, TotalAmount, CreatedAt, UpdatedAt)
        VALUES(@id, @cid, 2026, 6, @data, @dd, @md, @tq, @ta, @now, @now)`,
        {
          id: { type: NVarChar(36), value: deliveryId },
          cid: { type: NVarChar(36), value: customer.Id },
          data: { type: NVarChar(sql.MAX), value: JSON.stringify(deliveryData) },
          dd: { type: SmallInt, value: deliveredCount },
          md: { type: SmallInt, value: missedCount },
          tq: { type: Decimal(10, 2), value: totalQty },
          ta: { type: Decimal(12, 2), value: totalAmount },
          now: { type: NVarChar(20), value: new Date().toISOString() },
        }
      );

      // Add audit log entries for each missed delivery with reason & comment
      for (const missedDay of template.missedDays) {
        await execute(
          `INSERT INTO dbo.AuditLog
            (Id, UserId, Action, Module, EntityId, PreviousValue, NewValue, Reason, Comments, IpAddress, CreatedAt)
          VALUES(@id, @uid, @action, @mod, @eid, @prev, @new, @reason, @comments, @ip, @now)`,
          {
            id: { type: NVarChar(36), value: generateId() },
            uid: { type: NVarChar(36), value: 'system' },
            action: { type: NVarChar(50), value: 'UPDATE_DELIVERY' },
            mod: { type: NVarChar(50), value: 'Deliveries' },
            eid: { type: NVarChar(36), value: deliveryId },
            prev: { type: NVarChar(50), value: 'Delivered' },
            new: { type: NVarChar(50), value: 'Not Delivered' },
            reason: { type: NVarChar(200), value: missedDay.reason },
            comments: { type: NVarChar(500), value: missedDay.comment },
            ip: { type: NVarChar(50), value: '127.0.0.1' },
            now: { type: NVarChar(30), value: new Date().toISOString() },
          }
        );
      }

      // Print summary
      console.log(`✅ ${customer.Name}`);
      console.log(`   📅 June 2026: ${deliveredCount} days delivered, ${missedCount} missed`);
      console.log(`   🥛 Total: ${totalQty.toFixed(1)}L @ ₹${totalAmount.toFixed(0)}`);
      console.log(`   📝 Missed days with comments:`);
      template.missedDays.forEach((md) => {
        console.log(`      • ${md.date}: [${md.reason}] ${md.comment}`);
      });
      console.log();
    }

    console.log('🎉 Delivery sample data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    console.error(err);
    process.exit(1);
  }
};

seedDeliveryData();
