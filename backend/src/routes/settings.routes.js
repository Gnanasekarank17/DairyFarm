const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const { query, execute, NVarChar } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId } = require('../utils/helpers');

router.use(authenticate);

// GET /settings
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT [Key],[Value] FROM dbo.Settings');
    const settings = {};
    result.recordset.forEach(r => { settings[r.Key] = r.Value; });
    return success(res, settings);
  } catch (err) {
    return error(res, 'Failed to fetch settings');
  }
});

// PUT /settings
router.put('/', requirePermission(PERMISSIONS.SETTINGS_MANAGE), async (req, res) => {
  try {
    const now = new Date().toISOString().slice(0, 10);
    for (const [key, value] of Object.entries(req.body)) {
      // MERGE: upsert via check then insert/update
      const existing = await query(
        'SELECT [Key] FROM dbo.Settings WHERE [Key]=@k',
        { k: { type: NVarChar(100), value: key } }
      );
      if (existing.recordset.length > 0) {
        await execute(
          'UPDATE dbo.Settings SET [Value]=@v,UpdatedAt=@now WHERE [Key]=@k',
          {
            k:   { type: NVarChar(100),         value: key },
            v:   { type: NVarChar(4000),         value: String(value) },
            now: { type: NVarChar(20),           value: now },
          }
        );
      } else {
        await execute(
          'INSERT INTO dbo.Settings ([Key],[Value],UpdatedAt) VALUES (@k,@v,@now)',
          {
            k:   { type: NVarChar(100), value: key },
            v:   { type: NVarChar(4000), value: String(value) },
            now: { type: NVarChar(20),  value: now },
          }
        );
      }
    }
    return success(res, null, 'Settings saved');
  } catch (err) {
    return error(res, 'Failed to save settings');
  }
});

module.exports = router;
