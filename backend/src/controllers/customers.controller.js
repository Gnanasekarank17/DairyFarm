const { query, queryOne, execute, NVarChar, Bit, Decimal, sql } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const logger = require('../config/logger');

const getAll = async (req, res) => {
  try {
    const activeFilter = req.query.active;
    let qStr = 'SELECT * FROM dbo.Customers';
    if (activeFilter === 'true')  qStr += ' WHERE IsActive = 1';
    if (activeFilter === 'false') qStr += ' WHERE IsActive = 0';
    qStr += ' ORDER BY Name';
    const result = await query(qStr);
    return success(res, result.recordset);
  } catch (err) {
    logger.error('Get customers:', err);
    return error(res, 'Failed to fetch customers');
  }
};

const getById = async (req, res) => {
  try {
    const customer = await queryOne(
      'SELECT * FROM dbo.Customers WHERE Id = @id',
      { id: { type: NVarChar(36), value: req.params.id } }
    );
    if (!customer) return error(res, 'Customer not found', 404);
    return success(res, customer);
  } catch (err) {
    logger.error('Get customer:', err);
    return error(res, 'Failed to fetch customer');
  }
};

const create = async (req, res) => {
  try {
    const id = generateId();
    const now = today();
    const morningQty = parseFloat(req.body.morningQuantity) || 0;
    const eveningQty = parseFloat(req.body.eveningQuantity) || 0;
    await execute(`
      INSERT INTO dbo.Customers
        (Id,Name,Mobile,Email,Address,DailyQuantity,MorningQuantity,EveningQuantity,MilkType,RatePerLiter,BillingMode,IsActive,CreatedAt,UpdatedAt)
      VALUES
        (@id,@name,@mobile,@email,@address,@qty,@morningQty,@eveningQty,@milkType,@rate,@billing,1,@now,@now)
    `, {
      id:         { type: NVarChar(36),  value: id },
      name:       { type: NVarChar(150), value: req.body.name },
      mobile:     { type: NVarChar(20),  value: req.body.mobile },
      email:      { type: NVarChar(200), value: req.body.email || '' },
      address:    { type: NVarChar(500), value: req.body.address || '' },
      qty:        { type: Decimal(8,2),  value: morningQty + eveningQty || 1 },
      morningQty: { type: Decimal(8,2),  value: morningQty },
      eveningQty: { type: Decimal(8,2),  value: eveningQty },
      milkType:   { type: NVarChar(50),  value: req.body.milkType || 'Cow Milk' },
      rate:       { type: Decimal(8,2),  value: parseFloat(req.body.ratePerLiter) || 60 },
      billing:    { type: NVarChar(50),  value: req.body.billingMode || 'Monthly Full Check' },
      now:        { type: NVarChar(20),  value: now },
    });
    const created = await queryOne('SELECT * FROM dbo.Customers WHERE Id=@id', { id: { type: NVarChar(36), value: id } });
    return success(res, created, 'Customer created', 201);
  } catch (err) {
    logger.error('Create customer:', err);
    return error(res, 'Failed to create customer');
  }
};

const update = async (req, res) => {
  try {
    const b = req.body;
    const morningQty = parseFloat(b.morningQuantity) || 0;
    const eveningQty = parseFloat(b.eveningQuantity) || 0;
    await execute(`
      UPDATE dbo.Customers SET
        Name=@name, Mobile=@mobile, Email=@email, Address=@address,
        DailyQuantity=@qty, MorningQuantity=@morningQty, EveningQuantity=@eveningQty,
        MilkType=@milkType, RatePerLiter=@rate,
        BillingMode=@billing, UpdatedAt=@now
      WHERE Id=@id
    `, {
      id:         { type: NVarChar(36),  value: req.params.id },
      name:       { type: NVarChar(150), value: b.name },
      mobile:     { type: NVarChar(20),  value: b.mobile },
      email:      { type: NVarChar(200), value: b.email || '' },
      address:    { type: NVarChar(500), value: b.address || '' },
      qty:        { type: Decimal(8,2),  value: morningQty + eveningQty },
      morningQty: { type: Decimal(8,2),  value: morningQty },
      eveningQty: { type: Decimal(8,2),  value: eveningQty },
      milkType:   { type: NVarChar(50),  value: b.milkType },
      rate:       { type: Decimal(8,2),  value: parseFloat(b.ratePerLiter) },
      billing:    { type: NVarChar(50),  value: b.billingMode },
      now:        { type: NVarChar(20),  value: today() },
    });
    const updated = await queryOne('SELECT * FROM dbo.Customers WHERE Id=@id', { id: { type: NVarChar(36), value: req.params.id } });
    return success(res, updated);
  } catch (err) {
    logger.error('Update customer:', err);
    return error(res, 'Failed to update customer');
  }
};

const toggleActive = async (req, res) => {
  try {
    await execute(
      'UPDATE dbo.Customers SET IsActive = 1-IsActive, UpdatedAt=@now WHERE Id=@id',
      {
        id:  { type: NVarChar(36), value: req.params.id },
        now: { type: NVarChar(20), value: today() },
      }
    );
    const updated = await queryOne('SELECT * FROM dbo.Customers WHERE Id=@id', { id: { type: NVarChar(36), value: req.params.id } });
    return success(res, updated);
  } catch (err) {
    logger.error('Toggle customer:', err);
    return error(res, 'Failed to toggle customer status');
  }
};

const remove = async (req, res) => {
  try {
    const rows = await execute('DELETE FROM dbo.Customers WHERE Id=@id', { id: { type: NVarChar(36), value: req.params.id } });
    if (!rows) return error(res, 'Customer not found', 404);
    return success(res, null, 'Customer deleted');
  } catch (err) {
    logger.error('Delete customer:', err);
    return error(res, 'Failed to delete customer');
  }
};

module.exports = { getAll, getById, create, update, toggleActive, remove };
