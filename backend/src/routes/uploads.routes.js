// File uploads (animal photos, documents) stored in Vercel Blob.
// Body: { fileName, contentType, data } where data is base64 (optionally a data: URL).
const express = require('express');
const path = require('path');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { success, error } = require('../utils/response');
const blob = require('../services/blob.service');
const logger = require('../config/logger');

router.use(authenticate);

const MAX_BYTES = 4 * 1024 * 1024; // Vercel function request bodies are capped at 4.5 MB
const ALLOWED_TYPES = /^(image\/(jpeg|png|webp|gif|heic)|application\/pdf)$/i;
const FOLDERS = ['photos', 'documents'];

const decodeBase64 = (data) => {
  const str = String(data || '');
  const m = str.match(/^data:([^;]+);base64,(.*)$/s);
  return { contentType: m ? m[1] : null, buffer: Buffer.from(m ? m[2] : str, 'base64') };
};

// POST /uploads?folder=photos
router.post('/', async (req, res) => {
  try {
    if (!blob.isConfigured()) return error(res, 'File storage is not configured', 503);
    const folder = FOLDERS.includes(req.query.folder) ? req.query.folder : 'photos';
    const { fileName, data } = req.body || {};
    if (!data) return error(res, 'data (base64) is required', 400);

    const decoded = decodeBase64(data);
    const contentType = String(req.body.contentType || decoded.contentType || 'application/octet-stream');
    if (!ALLOWED_TYPES.test(contentType)) return error(res, `Unsupported file type: ${contentType}`, 415);
    if (!decoded.buffer.length) return error(res, 'Empty file', 400);
    if (decoded.buffer.length > MAX_BYTES) return error(res, 'File too large (max 4 MB)', 413);

    const safeName = path.basename(String(fileName || 'file')).replace(/[^\w.\-]+/g, '_').slice(0, 80);
    const stored = await blob.upload(`${folder}/${safeName}`, decoded.buffer, {
      contentType,
      access: 'public',      // photo URLs are saved on records and rendered directly by the app
      addRandomSuffix: true, // unguessable URL
    });
    logger.info(`Upload stored: ${stored.pathname} (${stored.size} bytes) by ${(req.user && req.user.id) || 'unknown'}`);
    return success(res, stored, 'File uploaded', 201);
  } catch (err) {
    logger.error('Upload:', err);
    return error(res, 'Upload failed');
  }
});

// GET /uploads?folder=photos&cursor=...
router.get('/', async (req, res) => {
  try {
    if (!blob.isConfigured()) return success(res, { blobs: [], hasMore: false }, 'File storage is not configured');
    const folder = FOLDERS.includes(req.query.folder) ? req.query.folder : 'photos';
    const result = await blob.list({ prefix: `${folder}/`, limit: 100, cursor: req.query.cursor || undefined });
    return success(res, { blobs: result.blobs, hasMore: result.hasMore, cursor: result.cursor || null });
  } catch (err) {
    logger.error('Upload list:', err);
    return error(res, 'Failed to list files');
  }
});

// DELETE /uploads?url=https://....public.blob.vercel-storage.com/photos/xxx
router.delete('/', async (req, res) => {
  try {
    const target = String(req.query.url || req.query.pathname || '');
    if (!FOLDERS.some((f) => target.includes(`${f}/`))) return error(res, 'Invalid file path', 400);
    await blob.remove(target);
    return success(res, { url: target }, 'File deleted');
  } catch (err) {
    logger.error('Upload delete:', err);
    return error(res, 'Failed to delete file');
  }
});

module.exports = router;
