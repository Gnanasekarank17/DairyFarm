const { query, queryOne, execute, NVarChar, Decimal, Int, Bit } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const { hasPermission } = require('../config/rbac');
const logger = require('../config/logger');

const VALID_UNITS = ['liter', 'kg'];

const normalizeUnit = (unit) => {
  const value = String(unit || '').trim().toLowerCase();
  if (value === 'l' || value === 'litre' || value === 'liter' || value === 'ltr') return 'liter';
  if (value === 'kg' || value === 'kilogram' || value === 'kgs') return 'kg';
  return VALID_UNITS.includes(value) ? value : 'liter';
};

const num = (v, fallback = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

// Internal fields (production cost, min stock level) are hidden from users who cannot manage products.
const projectForRole = (row, canManage) => {
  if (canManage) return row;
  const { Cost, MinStock, ...safe } = row;
  return safe;
};

// GET /products
const getAll = async (req, res) => {
  try {
    const canManage = hasPermission(req.user?.role, 'settings:manage');
    const activeFilter = req.query.active;
    let qStr = 'SELECT * FROM dbo.Products';
    if (activeFilter === 'true') qStr += ' WHERE IsActive = 1';
    if (activeFilter === 'false') qStr += ' WHERE IsActive = 0';
    qStr += ' ORDER BY SortOrder, Name';
    const result = await query(qStr);
    return success(res, result.recordset.map((r) => projectForRole(r, canManage)));
  } catch (err) {
    logger.error('Get products:', err);
    return error(res, 'Failed to fetch products');
  }
};

// GET /products/low-stock  (settings:manage) — products at or below their minimum stock level
const getLowStock = async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM dbo.Products
      WHERE IsActive = 1 AND Stock <= MinStock AND MinStock > 0
      ORDER BY (Stock - MinStock), Name
    `);
    return success(res, result.recordset);
  } catch (err) {
    logger.error('Get low-stock products:', err);
    return error(res, 'Failed to fetch low-stock products');
  }
};

// POST /products
const create = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return error(res, 'Product name is required', 400);

    const existing = await queryOne('SELECT Id FROM dbo.Products WHERE Name=@name', {
      name: { type: NVarChar(100), value: name },
    });
    if (existing) return error(res, 'A product with this name already exists', 409);

    const id = generateId();
    const now = today();
    await execute(`
      INSERT INTO dbo.Products
        (Id,Name,Description,Unit,Rate,Cost,Stock,MinStock,TaxPercent,ImageUrl,IsActive,SortOrder,CreatedAt,UpdatedAt)
      VALUES
        (@id,@name,@description,@unit,@rate,@cost,@stock,@minStock,@tax,@image,1,@sort,@now,@now)
    `, {
      id:   { type: NVarChar(36),  value: id },
      name: { type: NVarChar(100), value: name },
      description: { type: NVarChar(500), value: req.body.description ? String(req.body.description) : null },
      unit: { type: NVarChar(20),  value: normalizeUnit(req.body.unit) },
      rate: { type: Decimal(10, 2), value: num(req.body.rate) },
      cost: { type: Decimal(10, 2), value: num(req.body.cost) },
      stock: { type: Decimal(12, 2), value: num(req.body.stock) },
      minStock: { type: Decimal(12, 2), value: num(req.body.minStock) },
      tax: { type: Decimal(5, 2), value: num(req.body.taxPercent) },
      image: { type: NVarChar(500), value: req.body.imageUrl ? String(req.body.imageUrl) : null },
      sort: { type: Int, value: parseInt(req.body.sortOrder, 10) || 99 },
      now:  { type: NVarChar(20),  value: now },
    });
    const created = await queryOne('SELECT * FROM dbo.Products WHERE Id=@id', {
      id: { type: NVarChar(36), value: id },
    });
    return success(res, created, 'Product added', 201);
  } catch (err) {
    logger.error('Create product:', err);
    return error(res, 'Failed to add product');
  }
};

// PUT /products/:id
const update = async (req, res) => {
  try {
    const product = await queryOne('SELECT Id FROM dbo.Products WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    if (!product) return error(res, 'Product not found', 404);

    const name = String(req.body.name || '').trim();
    if (!name) return error(res, 'Product name is required', 400);

    const duplicate = await queryOne('SELECT Id FROM dbo.Products WHERE Name=@name AND Id<>@id', {
      name: { type: NVarChar(100), value: name },
      id: { type: NVarChar(36), value: req.params.id },
    });
    if (duplicate) return error(res, 'A product with this name already exists', 409);

    await execute(`
      UPDATE dbo.Products SET
        Name=@name, Description=@description, Unit=@unit, Rate=@rate, Cost=@cost,
        MinStock=@minStock, TaxPercent=@tax, ImageUrl=@image, SortOrder=@sort, UpdatedAt=@now
      WHERE Id=@id
    `, {
      id:   { type: NVarChar(36),  value: req.params.id },
      name: { type: NVarChar(100), value: name },
      description: { type: NVarChar(500), value: req.body.description ? String(req.body.description) : null },
      unit: { type: NVarChar(20),  value: normalizeUnit(req.body.unit) },
      rate: { type: Decimal(10, 2), value: num(req.body.rate) },
      cost: { type: Decimal(10, 2), value: num(req.body.cost) },
      minStock: { type: Decimal(12, 2), value: num(req.body.minStock) },
      tax: { type: Decimal(5, 2), value: num(req.body.taxPercent) },
      image: { type: NVarChar(500), value: req.body.imageUrl ? String(req.body.imageUrl) : null },
      sort: { type: Int, value: parseInt(req.body.sortOrder, 10) || 99 },
      now:  { type: NVarChar(20),  value: today() },
    });
    const updated = await queryOne('SELECT * FROM dbo.Products WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    return success(res, updated, 'Product updated');
  } catch (err) {
    logger.error('Update product:', err);
    return error(res, 'Failed to update product');
  }
};

// PATCH /products/:id/stock  — adjust stock by delta or set an absolute value
const adjustStock = async (req, res) => {
  try {
    const product = await queryOne('SELECT Id,Stock FROM dbo.Products WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    if (!product) return error(res, 'Product not found', 404);

    const hasSet = req.body.set !== undefined && req.body.set !== null && req.body.set !== '';
    const hasDelta = req.body.delta !== undefined && req.body.delta !== null && req.body.delta !== '';
    if (!hasSet && !hasDelta) return error(res, 'Provide either a "set" (absolute) or "delta" (relative) stock value', 400);

    const current = num(product.Stock);
    let next = hasSet ? num(req.body.set) : current + num(req.body.delta);
    if (next < 0) next = 0; // never allow negative stock

    await execute('UPDATE dbo.Products SET Stock=@stock, UpdatedAt=@now WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
      stock: { type: Decimal(12, 2), value: next },
      now: { type: NVarChar(20), value: today() },
    });
    const updated = await queryOne('SELECT * FROM dbo.Products WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    return success(res, updated, 'Stock updated');
  } catch (err) {
    logger.error('Adjust product stock:', err);
    return error(res, 'Failed to adjust stock');
  }
};

// PATCH /products/:id/toggle
const toggleActive = async (req, res) => {
  try {
    const product = await queryOne('SELECT Id,IsActive FROM dbo.Products WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    if (!product) return error(res, 'Product not found', 404);

    await execute('UPDATE dbo.Products SET IsActive=@active, UpdatedAt=@now WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
      active: { type: Bit, value: !product.IsActive },
      now: { type: NVarChar(20), value: today() },
    });
    return success(res, null, 'Product updated');
  } catch (err) {
    logger.error('Toggle product:', err);
    return error(res, 'Failed to update product');
  }
};

// DELETE /products/:id
const remove = async (req, res) => {
  try {
    const product = await queryOne('SELECT Id FROM dbo.Products WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    if (!product) return error(res, 'Product not found', 404);

    await execute('DELETE FROM dbo.Products WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
    });
    return success(res, null, 'Product deleted');
  } catch (err) {
    logger.error('Delete product:', err);
    return error(res, 'Failed to delete product');
  }
};

module.exports = { getAll, getLowStock, create, update, adjustStock, toggleActive, remove };
