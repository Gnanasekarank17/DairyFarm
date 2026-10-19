const jwt = require('jsonwebtoken');
const config = require('../config');
const { PERMISSIONS, hasPermission, normalizeRole } = require('../config/rbac');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (normalizeRole(req.user?.role) !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  const userRole = normalizeRole(req.user?.role);
  const allowedRoles = roles.map(normalizeRole).filter(Boolean);

  if (!userRole || !allowedRoles.includes(userRole)) {
    return res.status(403).json({ success: false, message: 'Role access required' });
  }

  next();
};

const requirePermission = (permission) => (req, res, next) => {
  if (!hasPermission(req.user?.role, permission)) {
    return res.status(403).json({ success: false, message: 'Permission denied' });
  }

  next();
};

module.exports = { authenticate, requireAdmin, requireRole, requirePermission, PERMISSIONS };
