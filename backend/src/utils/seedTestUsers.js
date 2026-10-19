require('dotenv').config();

const bcrypt = require('bcryptjs');
const { queryOne, execute, NVarChar } = require('../database/db');
const { generateId, today } = require('./helpers');
const { ROLE_LABELS, normalizeRole } = require('../config/rbac');

const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'Test@1234';

const TEST_USERS = [
  { name: 'Test Admin', mobile: '9000000001', email: 'admin.test@dairy.local', role: 'admin' },
  { name: 'Test Supervisor', mobile: '9000000002', email: 'supervisor.test@dairy.local', role: 'supervisor' },
  { name: 'Test Manager', mobile: '9000000003', email: 'manager.test@dairy.local', role: 'manager' },
  { name: 'Test Delivery Person', mobile: '9000000004', email: 'delivery.test@dairy.local', role: 'deliveryperson' },
  { name: 'Test Cattle Caretaker', mobile: '9000000005', email: 'cattle.test@dairy.local', role: 'cattlecaretaker' },
  { name: 'Test Farm Cleaner', mobile: '9000000006', email: 'cleaner.test@dairy.local', role: 'farmcleaner' },
  { name: 'Test Customer', mobile: '9000000007', email: 'customer.test@dairy.local', role: 'customer' },
];

const syncUserRole = async (userId, role) => {
  await execute('DELETE FROM dbo.UserRoles WHERE UserId=@id', {
    id: { type: NVarChar(36), value: userId },
  });

  await execute('INSERT INTO dbo.UserRoles (UserId,RoleId,CreatedAt) VALUES (@id,@role,@now)', {
    id: { type: NVarChar(36), value: userId },
    role: { type: NVarChar(50), value: role },
    now: { type: NVarChar(20), value: today() },
  });
};

const syncCustomerAccess = async (userId) => {
  const customer = await queryOne('SELECT TOP 1 Id, Name FROM dbo.Customers WHERE IsActive=1 ORDER BY Name');
  if (!customer) {
    console.log('Skipped customer link because no active customers exist. Run npm run db:seed first.');
    return;
  }

  await execute('DELETE FROM dbo.CustomerUserAccess WHERE UserId=@id', {
    id: { type: NVarChar(36), value: userId },
  });

  await execute('INSERT INTO dbo.CustomerUserAccess (UserId,CustomerId,IsPrimary,CreatedAt) VALUES (@id,@customerId,1,@now)', {
    id: { type: NVarChar(36), value: userId },
    customerId: { type: NVarChar(36), value: customer.Id },
    now: { type: NVarChar(20), value: today() },
  });

  console.log(`Linked Test Customer to customer record: ${customer.Name}`);
};

async function seedTestUsers() {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  for (const testUser of TEST_USERS) {
    const role = normalizeRole(testUser.role);
    if (!role || !ROLE_LABELS[role]) {
      throw new Error(`Invalid role configured for ${testUser.name}: ${testUser.role}`);
    }

    const existing = await queryOne('SELECT Id FROM dbo.Users WHERE Mobile=@mobile', {
      mobile: { type: NVarChar(20), value: testUser.mobile },
    });

    const now = today();
    if (existing) {
      await execute(`
        UPDATE dbo.Users SET Name=@name, Email=@email, Mobile=@mobile, Role=@role,
          PasswordHash=@passwordHash, IsActive=1, UpdatedAt=@now
        WHERE Id=@id
      `, {
        id: { type: NVarChar(36), value: existing.Id },
        name: { type: NVarChar(150), value: testUser.name },
        email: { type: NVarChar(200), value: testUser.email },
        mobile: { type: NVarChar(20), value: testUser.mobile },
        role: { type: NVarChar(50), value: role },
        passwordHash: { type: NVarChar(500), value: passwordHash },
        now: { type: NVarChar(20), value: now },
      });
      await syncUserRole(existing.Id, role);
      if (role === 'customer') await syncCustomerAccess(existing.Id);
      console.log(`Updated ${testUser.name} (${testUser.mobile}) as ${ROLE_LABELS[role]}`);
      continue;
    }

    const id = generateId();
    await execute(`
      INSERT INTO dbo.Users (Id,GoogleId,Name,Email,Mobile,Role,PasswordHash,IsActive,LastLogin,CreatedAt,UpdatedAt)
      VALUES (@id,NULL,@name,@email,@mobile,@role,@passwordHash,1,NULL,@now,@now)
    `, {
      id: { type: NVarChar(36), value: id },
      name: { type: NVarChar(150), value: testUser.name },
      email: { type: NVarChar(200), value: testUser.email },
      mobile: { type: NVarChar(20), value: testUser.mobile },
      role: { type: NVarChar(50), value: role },
      passwordHash: { type: NVarChar(500), value: passwordHash },
      now: { type: NVarChar(20), value: now },
    });
    await syncUserRole(id, role);
    if (role === 'customer') await syncCustomerAccess(id);
    console.log(`Created ${testUser.name} (${testUser.mobile}) as ${ROLE_LABELS[role]}`);
  }

  console.log(`\nTest password for all seeded users: ${TEST_PASSWORD}`);
}

seedTestUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to seed test users:', err);
    process.exit(1);
  });