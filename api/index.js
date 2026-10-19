// Vercel Serverless Function: serves the whole Express API.
// vercel.json rewrites /api/* and /health to this function.
module.exports = require('../backend/src/app');
