/**
 * Update delivery records for June 2026 - Add sample missed days with reasons
 * Run: node src/utils/updateDeliveryData.js
 */
require('dotenv').config();
const { query, execute, NVarChar, SmallInt, Decimal, sql } = require('../database/db');
const { generateId } = require('./helpers');

const updateDeliveryData = async () => {
  try {
    console.log('🔄 Updating delivery data for 3 clients in June 2026...\n');

    // Get first 3 active customers
    const result = await query('SELECT TOP 3 Id, Name, DailyQuantity, RatePerLiter FROM dbo.Customers WHERE IsActive=1 ORDER BY Name');
    const customers = result.recordset;

    if (customers.length === 0) {
      console.log('❌ No active customers found.');
      process.exit(1);
    }

    // Sample delivery updates - different missed days with reasons & comments
    const sampleUpdates = [
      {
        missedDays: [
          { date: '2026-06-05', reason: 'Customer Out Of Station', comment: 'Customer went to native place for family event' },
          { date: '2026-06-12', reason: 'Milk Not Available', comment: 'Cow was not producing milk that day' },
        ],
      },
      {
        missedDays: [
          { date: '2026-06-04', reason: 'Holiday', comment: 'Local holiday - delivery not required' },
          { date: '2026-06-10', reason: 'Customer Requested Skip', comment: 'Customer requested to skip delivery' },
          { date: '2026-06-18', reason: 'Weather Conditions', comment: 'Heavy rain - delivery not possible' },
        ],
      },
      {
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
      const update = sampleUpdates[idx];

      // Get existing delivery record for June 2026
      const deliveryResult = await query(
        'SELECT Id, DeliveryData FROM dbo.Deliveries WHERE CustomerId=@cid AND [Year]=2026 AND [Month]=6',
        { cid: { type: NVarChar(36), value: customer.Id } }
      );

      if (deliveryResult.recordset.length === 0) {
        console.log(`⏭️  ${customer.Name} has no June 2026 delivery record. Skipping...`);
        continue;
      }

      const delivery = deliveryResult.recordset[0];
      const deliveryData = typeof delivery.DeliveryData === 'string' 
        ? JSON.parse(delivery.DeliveryData) 
        : delivery.DeliveryData;

      // Mark missed days as false
      update.missedDays.forEach((md) => {
        deliveryData[md.date] = false;
      });

      const deliveredCount = Object.values(deliveryData).filter(Boolean).length;
      const missedCount = Object.values(deliveryData).filter(v => v === false).length;
      const qty = parseFloat(customer.DailyQuantity || 0);
      const rate = parseFloat(customer.RatePerLiter || 0);
      const totalQty = deliveredCount * qty;
      const totalAmount = totalQty * rate;

      // Update delivery record
      await execute(
        `UPDATE dbo.Deliveries 
        SET DeliveryData=@data, DeliveredDays=@dd, MissedDays=@md, TotalQuantity=@tq, TotalAmount=@ta, UpdatedAt=@now 
        WHERE Id=@id`,
        {
          id: { type: NVarChar(36), value: delivery.Id },
          data: { type: NVarChar(sql.MAX), value: JSON.stringify(deliveryData) },
          dd: { type: SmallInt, value: deliveredCount },
          md: { type: SmallInt, value: missedCount },
          tq: { type: Decimal(10, 2), value: totalQty },
          ta: { type: Decimal(12, 2), value: totalAmount },
          now: { type: NVarChar(30), value: new Date().toISOString() },
        }
      );

      // Clear old audit logs for this delivery (optional - comment out if you want to keep history)
      // await execute('DELETE FROM dbo.AuditLog WHERE EntityId=@id', { id: { type: NVarChar(36), value: delivery.Id } });

      // Add audit log entries for each missed delivery
      for (const missedDay of update.missedDays) {
        await execute(
          `INSERT INTO dbo.AuditLog
            (Id, UserId, Action, Module, EntityId, PreviousValue, NewValue, Reason, Comments, IpAddress, CreatedAt)
          VALUES(@id, @uid, @action, @mod, @eid, @prev, @new, @reason, @comments, @ip, @now)`,
          {
            id: { type: NVarChar(36), value: generateId() },
            uid: { type: NVarChar(36), value: 'system' },
            action: { type: NVarChar(50), value: 'UPDATE_DELIVERY' },
            mod: { type: NVarChar(50), value: 'Deliveries' },
            eid: { type: NVarChar(36), value: delivery.Id },
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
      update.missedDays.forEach((md) => {
        console.log(`      • ${md.date}: [${md.reason}] ${md.comment}`);
      });
      console.log();
    }

    console.log('🎉 Delivery data updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Update failed:', err.message);
    console.error(err);
    process.exit(1);
  }
};

updateDeliveryData();
