/**
 * Run this script once to seed sample data:
 *   node src/utils/seedData.js
 */
require('dotenv').config();
const { getPool, execute, query, NVarChar, Decimal, Bit } = require('../database/db');
const { generateId, today } = require('./helpers');

const CUSTOMERS = [
  { name: 'Ramu Kumar',        mobile: '9876543210', email: 'ramu@gmail.com',  address: '12 Gandhi Street, Chennai',       dailyQuantity: 2,   milkType: 'Cow Milk',     ratePerLiter: 60, billingMode: 'Monthly Full Check' },
  { name: 'Sita Devi',         mobile: '9876543211', email: '',                address: '45 Anna Nagar, Chennai',           dailyQuantity: 1.5, milkType: 'Buffalo Milk', ratePerLiter: 70, billingMode: 'Monthly Full Check' },
  { name: 'Mohan Lal',         mobile: '9876543212', email: 'mohan@gmail.com', address: '8 Nehru Road, Tambaram',           dailyQuantity: 3,   milkType: 'Cow Milk',     ratePerLiter: 58, billingMode: 'Monthly Full Check' },
  { name: 'Priya Anand',       mobile: '9876543213', email: '',                address: '22 Velachery Main Road',           dailyQuantity: 1,   milkType: 'Cow Milk',     ratePerLiter: 62, billingMode: 'Daily Check' },
  { name: 'Suresh Nadar',      mobile: '9876543214', email: 'suresh@gmail.com',address: '67 OMR, Sholinganallur',           dailyQuantity: 2.5, milkType: 'Buffalo Milk', ratePerLiter: 72, billingMode: 'Monthly Full Check' },
  { name: 'Kavitha Raj',       mobile: '9876543215', email: '',                address: '3 Adyar Main Road',               dailyQuantity: 2,   milkType: 'Cow Milk',     ratePerLiter: 60, billingMode: 'Monthly Full Check' },
  { name: 'Vijay Kumar',       mobile: '9876543216', email: '',                address: '15 T Nagar, Chennai',             dailyQuantity: 1,   milkType: 'Aavin Milk',   ratePerLiter: 55, billingMode: 'Monthly Full Check' },
  { name: 'Meena Krishnan',    mobile: '9876543217', email: 'meena@gmail.com', address: '28 Besant Nagar, Chennai',        dailyQuantity: 3,   milkType: 'Cow Milk',     ratePerLiter: 60, billingMode: 'Monthly Full Check' },
  { name: 'Arjun Patel',       mobile: '9876543218', email: '',                address: '90 Chromepet Main Road',          dailyQuantity: 1.5, milkType: 'Buffalo Milk', ratePerLiter: 68, billingMode: 'Daily Check' },
  { name: 'Lakshmi Narayanan', mobile: '9876543219', email: '',                address: '5 Perungudi Road',                dailyQuantity: 2,   milkType: 'Cow Milk',     ratePerLiter: 60, billingMode: 'Monthly Full Check' },
  { name: 'Dhruv Sharma',      mobile: '9876543220', email: '',                address: '11 Pallavaram Road',              dailyQuantity: 1,   milkType: 'Cow Milk',     ratePerLiter: 60, billingMode: 'Monthly Full Check' },
  { name: 'Anitha Murthy',     mobile: '9876543221', email: '',                address: '33 Porur Main Road',              dailyQuantity: 2.5, milkType: 'Buffalo Milk', ratePerLiter: 70, billingMode: 'Monthly Full Check' },
  { name: 'Karthik Sundaram',  mobile: '9876543222', email: '',                address: '7 Madipakkam',                    dailyQuantity: 2,   milkType: 'Cow Milk',     ratePerLiter: 60, billingMode: 'Monthly Full Check' },
  { name: 'Divya Kannan',      mobile: '9876543223', email: '',                address: '18 Ambattur Estate',              dailyQuantity: 1,   milkType: 'Cow Milk',     ratePerLiter: 62, billingMode: 'Monthly Full Check' },
  { name: 'Senthil Kumar',     mobile: '9876543224', email: '',                address: '42 Virugambakkam',                dailyQuantity: 3,   milkType: 'Cow Milk',     ratePerLiter: 58, billingMode: 'Monthly Full Check' },
  { name: 'Radha Krishnan',    mobile: '9876543225', email: '',                address: '6 Kodambakkam High Road',         dailyQuantity: 1.5, milkType: 'Buffalo Milk', ratePerLiter: 70, billingMode: 'Monthly Full Check' },
  { name: 'Balaji Venkat',     mobile: '9876543226', email: '',                address: '88 West Mambalam',                dailyQuantity: 2,   milkType: 'Cow Milk',     ratePerLiter: 60, billingMode: 'Monthly Full Check' },
  { name: 'Uma Shankar',       mobile: '9876543227', email: '',                address: '14 Poonamallee High Road',        dailyQuantity: 1,   milkType: 'Aavin Milk',   ratePerLiter: 55, billingMode: 'Daily Check' },
  { name: 'Nirmala Devi',      mobile: '9876543228', email: '',                address: '55 Chitlapakkam',                 dailyQuantity: 2.5, milkType: 'Cow Milk',     ratePerLiter: 60, billingMode: 'Monthly Full Check' },
  { name: 'Ganesh Babu',       mobile: '9876543229', email: '',                address: '27 Kovilambakkam',                dailyQuantity: 2,   milkType: 'Buffalo Milk', ratePerLiter: 68, billingMode: 'Monthly Full Check' },
];

const COWS = [
  { name: 'Lakshmi',    tagNumber: 'T001', breed: 'Holstein Friesian', color: 'Black & White',  dateOfBirth: '2020-03-15', purchaseDate: '2021-06-10', purchaseCost: 65000, currentStatus: 'Active',     notes: 'High milk producer' },
  { name: 'Gouri',      tagNumber: 'T002', breed: 'Gir',               color: 'Brown',           dateOfBirth: '2019-08-22', purchaseDate: '2020-11-05', purchaseCost: 55000, currentStatus: 'Pregnant',   notes: 'Third pregnancy' },
  { name: 'Kamdhenu',   tagNumber: 'T003', breed: 'Sahiwal',            color: 'Reddish Brown',  dateOfBirth: '2021-01-10', purchaseDate: '2022-02-20', purchaseCost: 48000, currentStatus: 'Active',     notes: '' },
  { name: 'Radha',      tagNumber: 'T004', breed: 'Murrah (Buffalo)',   color: 'Black',           dateOfBirth: '2018-05-30', purchaseDate: '2019-07-15', purchaseCost: 75000, currentStatus: 'Active',     notes: 'Good butter fat content' },
  { name: 'Nandini',    tagNumber: 'T005', breed: 'Jersey Cross',       color: 'Light Brown',    dateOfBirth: '2020-12-25', purchaseDate: '2021-09-10', purchaseCost: 52000, currentStatus: 'Dry Period', notes: 'Drying off before calving' },
  { name: 'Saraswathi', tagNumber: 'T006', breed: 'HF Cross',           color: 'White & Brown',  dateOfBirth: '2019-04-18', purchaseDate: '2020-08-30', purchaseCost: 60000, currentStatus: 'Active',     notes: '' },
  { name: 'Parvathi',   tagNumber: 'T007', breed: 'Gir Cross',          color: 'Yellow',          dateOfBirth: '2021-07-12', purchaseDate: '2022-05-25', purchaseCost: 45000, currentStatus: 'Pregnant',   notes: 'First pregnancy' },
  { name: 'Annapoorna', tagNumber: 'T008', breed: 'Surti (Buffalo)',    color: 'Gray',            dateOfBirth: '2018-11-08', purchaseDate: '2019-12-20', purchaseCost: 70000, currentStatus: 'Active',     notes: 'Very calm temperament' },
  { name: 'Meenakshi',  tagNumber: 'T009', breed: 'Tharparkar',         color: 'White',           dateOfBirth: '2022-02-28', purchaseDate: '2023-01-15', purchaseCost: 42000, currentStatus: 'Active',     notes: 'New addition' },
  { name: 'Tulsi',      tagNumber: 'T010', breed: 'Red Sindhi',         color: 'Deep Red',        dateOfBirth: '2020-09-05', purchaseDate: '2021-10-20', purchaseCost: 50000, currentStatus: 'Active',     notes: '' },
];

const seed = async () => {
  try {
    console.log('Connecting to SQL Server...');
    await getPool();
    console.log('Connected.\n');

    // Check if already seeded
    const existing = await query('SELECT COUNT(*) AS cnt FROM dbo.Customers');
    if (existing.recordset[0].cnt > 0) {
      console.log('⚠️  Data already exists. Skipping seed to avoid duplicates.');
      process.exit(0);
    }

    // --- Customers ---
    console.log('Seeding 20 customers...');
    for (const c of CUSTOMERS) {
      await execute(`
        INSERT INTO dbo.Customers
          (Id,Name,Mobile,Email,Address,DailyQuantity,MilkType,RatePerLiter,BillingMode,IsActive,CreatedAt,UpdatedAt)
        VALUES(@id,@name,@mobile,@email,@address,@qty,@milkType,@rate,@billing,1,@now,@now)
      `, {
        id:       { type: NVarChar(36),  value: generateId() },
        name:     { type: NVarChar(150), value: c.name },
        mobile:   { type: NVarChar(20),  value: c.mobile },
        email:    { type: NVarChar(200), value: c.email },
        address:  { type: NVarChar(500), value: c.address },
        qty:      { type: Decimal(8,2),  value: c.dailyQuantity },
        milkType: { type: NVarChar(50),  value: c.milkType },
        rate:     { type: Decimal(8,2),  value: c.ratePerLiter },
        billing:  { type: NVarChar(50),  value: c.billingMode },
        now:      { type: NVarChar(20),  value: today() },
      });
    }
    console.log(`✓ Seeded ${CUSTOMERS.length} customers`);

    // --- Cows ---
    console.log('Seeding 10 cows...');
    const cowIds = {};
    for (const cow of COWS) {
      const id = generateId();
      cowIds[cow.name] = id;
      await execute(`
        INSERT INTO dbo.CowMaster
          (Id,Name,TagNumber,Breed,Color,DateOfBirth,PurchaseDate,PurchaseCost,CurrentStatus,PhotoUrl,Notes,CreatedAt,UpdatedAt)
        VALUES(@id,@name,@tag,@breed,@color,@dob,@pDate,@pCost,@status,'',@notes,@now,@now)
      `, {
        id:     { type: NVarChar(36),   value: id },
        name:   { type: NVarChar(100),  value: cow.name },
        tag:    { type: NVarChar(50),   value: cow.tagNumber },
        breed:  { type: NVarChar(100),  value: cow.breed },
        color:  { type: NVarChar(50),   value: cow.color },
        dob:    { type: NVarChar(20),   value: cow.dateOfBirth },
        pDate:  { type: NVarChar(20),   value: cow.purchaseDate },
        pCost:  { type: Decimal(10,2),  value: cow.purchaseCost },
        status: { type: NVarChar(50),   value: cow.currentStatus },
        notes:  { type: NVarChar(500),  value: cow.notes },
        now:    { type: NVarChar(20),   value: today() },
      });
    }
    console.log(`✓ Seeded ${COWS.length} cows`);

    // --- Breeding & Pregnancy for pregnant cows ---
    const pregnantCows = COWS.filter(c => c.currentStatus === 'Pregnant');
    console.log(`Seeding breeding & pregnancy records for ${pregnantCows.length} pregnant cows...`);
    const matingDate = '2026-03-15';
    const expectedCalving = (() => {
      const d = new Date(matingDate);
      d.setDate(d.getDate() + 283);
      return d.toISOString().slice(0, 10);
    })();

    for (const cow of pregnantCows) {
      const cowId      = cowIds[cow.name];
      const breedingId = generateId();
      const pregId     = generateId();

      await execute(`
        INSERT INTO dbo.BreedingRecords
          (Id,CowId,MatingDate,BullName,BreedingMethod,TechnicianName,Notes,CreatedAt,UpdatedAt)
        VALUES(@id,@cid,@mDate,'Star Bull','Artificial Insemination','Dr. Rajan','Sample record',@now,@now)
      `, {
        id:    { type: NVarChar(36), value: breedingId },
        cid:   { type: NVarChar(36), value: cowId },
        mDate: { type: NVarChar(20), value: matingDate },
        now:   { type: NVarChar(20), value: today() },
      });

      await execute(`
        INSERT INTO dbo.PregnancyRecords
          (Id,CowId,BreedingId,IsConfirmed,ConfirmationDate,Veterinarian,ExpectedCalvingDate,ActualCalvingDate,Status,CreatedAt,UpdatedAt)
        VALUES(@id,@cid,@breedId,1,'2026-04-15','Dr. Sundar',@expected,NULL,'Pregnant',@now,@now)
      `, {
        id:       { type: NVarChar(36), value: pregId },
        cid:      { type: NVarChar(36), value: cowId },
        breedId:  { type: NVarChar(36), value: breedingId },
        expected: { type: NVarChar(20), value: expectedCalving },
        now:      { type: NVarChar(20), value: today() },
      });
    }
    console.log(`✓ Seeded breeding & pregnancy records`);

    // --- Sample Deliveries for 3 clients in June 2026 ---
    console.log('\nSeeding sample delivery data for 3 clients in June 2026...');
    const top3Customers = await query('SELECT TOP 3 Id, Name, DailyQuantity, RatePerLiter FROM dbo.Customers ORDER BY Name');
    const June2026Deliveries = [
      {
        customerId: null,
        deliveredDays: {},
        missedDays: [
          { date: '2026-06-05', reason: 'Customer Out Of Station', comments: 'Customer went to native place for family event' },
          { date: '2026-06-12', reason: 'Milk Not Available', comments: 'Cow was not producing milk that day' },
        ],
      },
      {
        customerId: null,
        deliveredDays: {},
        missedDays: [
          { date: '2026-06-04', reason: 'Holiday', comments: 'Local holiday - delivery not required' },
          { date: '2026-06-10', reason: 'Customer Requested Skip', comments: 'Customer requested to skip delivery' },
          { date: '2026-06-18', reason: 'Weather Conditions', comments: 'Heavy rain - delivery not possible' },
        ],
      },
      {
        customerId: null,
        deliveredDays: {},
        missedDays: [
          { date: '2026-06-08', reason: 'Payment Pending', comments: 'Previous month payment not received' },
          { date: '2026-06-15', reason: 'Delivery Issue', comments: 'Vehicle broke down on delivery route' },
          { date: '2026-06-22', reason: 'Customer Cancelled', comments: 'Customer cancelled for the day' },
          { date: '2026-06-28', reason: 'Festival Leave', comments: 'Festival holiday - delivery suspended' },
        ],
      },
    ];

    const deliveryRecords = [];

    for (let idx = 0; idx < top3Customers.recordset.length; idx++) {
      const c = top3Customers.recordset[idx];
      const template = June2026Deliveries[idx];
      template.customerId = c.Id;

      // Create delivery data object for entire June (1-30 all marked as true initially)
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
      const qty = parseFloat(c.DailyQuantity || 0);
      const rate = parseFloat(c.RatePerLiter || 0);
      const totalQty = deliveredCount * qty;
      const totalAmount = totalQty * rate;

      const deliveryId = generateId();

      // Insert delivery record
      await execute(`
        INSERT INTO dbo.Deliveries
          (Id,CustomerId,[Year],[Month],DeliveryData,DeliveredDays,MissedDays,TotalQuantity,TotalAmount,CreatedAt,UpdatedAt)
        VALUES(@id,@cid,2026,6,@data,@dd,@md,@tq,@ta,@now,@now)
      `, {
        id:   { type: NVarChar(36),  value: deliveryId },
        cid:  { type: NVarChar(36),  value: c.Id },
        data: { type: NVarChar(sql.MAX), value: JSON.stringify(deliveryData) },
        dd:   { type: SmallInt,      value: deliveredCount },
        md:   { type: SmallInt,      value: missedCount },
        tq:   { type: Decimal(10,2), value: totalQty },
        ta:   { type: Decimal(12,2), value: totalAmount },
        now:  { type: NVarChar(20),  value: today() },
      });

      // Add audit log entries for each missed delivery
      for (const missedDay of template.missedDays) {
        await execute(`
          INSERT INTO dbo.AuditLog
            (Id,UserId,Action,Module,EntityId,PreviousValue,NewValue,Reason,Comments,IpAddress,CreatedAt)
          VALUES(@id,'system','UPDATE_DELIVERY','Deliveries',@delivId,'Delivered','Not Delivered',@reason,@comments,'127.0.0.1',@now)
        `, {
          id:       { type: NVarChar(36),  value: generateId() },
          delivId:  { type: NVarChar(36),  value: deliveryId },
          reason:   { type: NVarChar(200), value: missedDay.reason },
          comments: { type: NVarChar(500), value: missedDay.comments },
          now:      { type: NVarChar(30),  value: new Date().toISOString() },
        });
      }

      deliveryRecords.push({
        customerName: c.Name,
        deliveredDays: deliveredCount,
        missedDays: missedCount,
        totalQuantity: totalQty,
        totalAmount: totalAmount,
        missedDates: template.missedDays,
      });
    }

    console.log(`✓ Seeded delivery records for 3 clients in June 2026`);
    deliveryRecords.forEach((r) => {
      console.log(`  • ${r.customerName}: ${r.deliveredDays} delivered, ${r.missedDays} missed`);
      r.missedDates.forEach((md) => {
        console.log(`    - ${md.date}: ${md.reason} (${md.comments})`);
      });
    });

    console.log('\n🎉 Sample data seeded successfully!');
    console.log(`   ${CUSTOMERS.length} customers | ${COWS.length} cows | ${pregnantCows.length} pregnancy records | 3 delivery samples`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
