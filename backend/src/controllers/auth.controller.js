const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, queryOne, execute, NVarChar, Bit } = require('../database/db');
const config = require('../config');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const { ROLES, normalizeRole, permissionsForRole } = require('../config/rbac');
const logger = require('../config/logger');

const client = new OAuth2Client(config.google.clientId);

const getCustomerIdsForUser = async (userId) => {
  if (!userId || String(userId).startsWith('pin-')) return [];

  const result = await query(
    'SELECT CustomerId AS customerId FROM dbo.CustomerUserAccess WHERE UserId=@id ORDER BY IsPrimary DESC, CreatedAt',
    { id: { type: NVarChar(36), value: userId } }
  );

  return result.recordset.map((item) => item.customerId);
};

const buildAuthResponse = async (user) => {
  const role = normalizeRole(user.Role || user.role) || ROLES.SUPERVISOR;
  const appUser = {
    id: user.Id || user.id,
    name: user.Name || user.name,
    email: user.Email || user.email || '',
    mobile: user.Mobile || user.mobile || '',
    role,
    permissions: permissionsForRole(role),
    customerIds: await getCustomerIdsForUser(user.Id || user.id),
  };
  const token = jwt.sign(appUser, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  return { token, user: appUser };
};

const syncUserRole = async (userId, role) => {
  await execute(`
    IF OBJECT_ID('dbo.UserRoles', 'U') IS NOT NULL
    BEGIN
      DELETE FROM dbo.UserRoles WHERE UserId=@id;
      IF EXISTS (SELECT 1 FROM dbo.Roles WHERE Id=@role)
        INSERT INTO dbo.UserRoles (UserId,RoleId,CreatedAt) VALUES (@id,@role,@now);
    END
  `, {
    id: { type: NVarChar(36), value: userId },
    role: { type: NVarChar(50), value: role },
    now: { type: NVarChar(20), value: today() },
  });
};

const googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;
    const ticket = await client.verifyIdToken({ idToken, audience: config.google.clientId });
    const { sub: googleId, name, email } = ticket.getPayload();

    let user = await queryOne('SELECT * FROM dbo.Users WHERE GoogleId=@gid', { gid: { type: NVarChar(128), value: googleId } });
    const userCount = (await query('SELECT COUNT(*) AS cnt FROM dbo.Users')).recordset[0].cnt;

    if (!user) {
      const id = generateId();
      const role = userCount === 0 ? ROLES.ADMIN : ROLES.SUPERVISOR;
      await execute(`
        INSERT INTO dbo.Users (Id,GoogleId,Name,Email,Mobile,Role,IsActive,LastLogin,CreatedAt,UpdatedAt)
        VALUES (@id,@gid,@name,@email,NULL,@role,1,@now,@now,@now)
      `, {
        id: { type: NVarChar(36), value: id }, gid: { type: NVarChar(128), value: googleId },
        name: { type: NVarChar(150), value: name }, email: { type: NVarChar(200), value: email },
        role: { type: NVarChar(20), value: role }, now: { type: NVarChar(20), value: today() },
      });
      await syncUserRole(id, role);
      user = await queryOne('SELECT * FROM dbo.Users WHERE Id=@id', { id: { type: NVarChar(36), value: id } });
    } else {
      await execute('UPDATE dbo.Users SET LastLogin=@now WHERE Id=@id', {
        id: { type: NVarChar(36), value: user.Id }, now: { type: NVarChar(20), value: today() },
      });
      await syncUserRole(user.Id, normalizeRole(user.Role) || ROLES.SUPERVISOR);
    }

    return success(res, await buildAuthResponse(user));
  } catch (err) {
    logger.error('Google sign-in:', err);
    return error(res, 'Authentication failed', 401);
  }
};

const pinLogin = async (req, res) => {
  try {
    const { pin } = req.body;

    let role = null;
    let name = null;

    if (pin === config.adminPin) {
      role = 'admin';
      name = 'Owner';
    } else if (config.staffPin && pin === config.staffPin) {
      role = ROLES.SUPERVISOR;
      name = 'Staff';
    }

    if (!role) return error(res, 'Invalid PIN', 401);

    const user = { Id: `pin-${role}`, Name: name, Email: '', Mobile: '', Role: role };
    const auth = await buildAuthResponse(user);
    const token = jwt.sign(auth.user, config.jwt.secret, { expiresIn: '12h' });
    return success(res, { ...auth, token });
  } catch (err) {
    logger.error('PIN login:', err);
    return error(res, 'Login failed');
  }
};

const mobilePasswordLogin = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return error(res, 'Mobile number and password required', 400);
    }

    const normalizedMobile = String(mobile).replace(/\D/g, '');

    const user = await queryOne('SELECT * FROM dbo.Users WHERE Mobile=@mobile AND IsActive=1', {
      mobile: { type: NVarChar(20), value: normalizedMobile }
    });

    if (!user) {
      return error(res, 'Invalid mobile number or password', 401);
    }

    const storedPassword = user.PasswordHash || '';
    const isBcryptHash = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');
    const isValidPassword = isBcryptHash
      ? await bcrypt.compare(password, storedPassword)
      : storedPassword === password;

    if (!isValidPassword) {
      return error(res, 'Invalid mobile number or password', 401);
    }

    if (!isBcryptHash) {
      const passwordHash = await bcrypt.hash(password, 10);
      await execute('UPDATE dbo.Users SET PasswordHash=@passwordHash WHERE Id=@id', {
        id: { type: NVarChar(36), value: user.Id },
        passwordHash: { type: NVarChar(500), value: passwordHash },
      });
    }

    // Update last login
    await execute('UPDATE dbo.Users SET LastLogin=@now WHERE Id=@id', {
      id: { type: NVarChar(36), value: user.Id },
      now: { type: NVarChar(20), value: today() },
    });

    await syncUserRole(user.Id, normalizeRole(user.Role) || ROLES.SUPERVISOR);

    return success(res, await buildAuthResponse(user));
  } catch (err) {
    logger.error('Mobile password login:', err);
    return error(res, 'Login failed');
  }
};

const updatePushToken = async (req, res) => {
  try {
    await execute('UPDATE dbo.Users SET PushToken=@pt WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.user.id },
      pt: { type: NVarChar(300), value: req.body.pushToken },
    });
    return success(res, null, 'Push token updated');
  } catch (err) {
    logger.error('Update push token:', err);
    return error(res, 'Failed to update push token');
  }
};

const me = (req, res) => success(res, req.user);

module.exports = { googleSignIn, pinLogin, mobilePasswordLogin, updatePushToken, me };
