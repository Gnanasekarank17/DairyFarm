// Vercel Blob storage wrapper. The store is connected to the Vercel project, which
// injects BLOB_READ_WRITE_TOKEN. Nothing is written to the local filesystem.
const vercelBlob = require('@vercel/blob');
const { Readable } = require('stream');
const config = require('../config');

const isConfigured = () => Boolean(config.blob.token);

const assertConfigured = () => {
  if (!isConfigured()) {
    const err = new Error('Blob storage is not configured (BLOB_READ_WRITE_TOKEN missing)');
    err.code = 'BLOB_NOT_CONFIGURED';
    throw err;
  }
};

const tokenOpts = () => ({ token: config.blob.token });

/**
 * Upload a Buffer/string. `access: 'private'` blobs can only be read through `download()`.
 * Returns { url, downloadUrl, pathname, contentType, size }.
 */
const upload = async (pathname, body, { contentType, access = 'private', addRandomSuffix = true } = {}) => {
  assertConfigured();
  const result = await vercelBlob.put(pathname, body, {
    access,
    contentType,
    addRandomSuffix,
    ...tokenOpts(),
  });
  return {
    url: result.url,
    downloadUrl: result.downloadUrl,
    pathname: result.pathname,
    contentType: result.contentType,
    size: Buffer.isBuffer(body) ? body.length : Buffer.byteLength(String(body)),
  };
};

const list = async ({ prefix, limit = 100, cursor } = {}) => {
  assertConfigured();
  return vercelBlob.list({ prefix, limit, cursor, ...tokenOpts() });
};

const head = async (urlOrPathname) => {
  assertConfigured();
  return vercelBlob.head(urlOrPathname, tokenOpts());
};

const remove = async (urlsOrPathnames) => {
  assertConfigured();
  return vercelBlob.del(urlsOrPathnames, tokenOpts());
};

/**
 * Read a blob (works for private blobs). Resolves to { stream (Node Readable), contentType, size, pathname }
 * or null when the blob does not exist.
 */
const download = async (urlOrPathname, { access = 'private' } = {}) => {
  assertConfigured();
  const res = await vercelBlob.get(urlOrPathname, { access, useCache: false, ...tokenOpts() });
  if (!res || res.statusCode !== 200 || !res.stream) return null;
  return {
    stream: Readable.fromWeb(res.stream),
    contentType: (res.blob && res.blob.contentType) || 'application/octet-stream',
    size: res.blob ? res.blob.size : undefined,
    pathname: res.blob ? res.blob.pathname : undefined,
  };
};

module.exports = { isConfigured, upload, list, head, remove, download };
