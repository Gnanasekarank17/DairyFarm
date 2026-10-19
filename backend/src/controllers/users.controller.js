const bcrypt = require('bcryptjs');
const { query, queryOne, execute, NVarChar, Bit } = require('../database/db');
const { success, error } = require('../utils/response');
const { generateId, today } = require('../utils/helpers');
const { normalizeRole, permissionsForRole } = require('../config/rbac');
const logger = require('../config/logger');

const userSelect = `
  SELECT Id AS id, Name AS name, Email AS email, Mobile AS mobile, Role AS role,
         IsActive AS isActive, LastLogin AS lastLogin, CreatedAt AS createdAt, UpdatedAt AS updatedAt
  FROM dbo.Users
`;

const publicUser = (user) => ({
  ...user,
  role: normalizeRole(user.role),
  permissions: permissionsForRole(user.role),
});

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

const getAll = async (req, res) => {
  try {
    const result = await query(`${userSelect} ORDER BY Name`);
    return success(res, result.recordset.map(publicUser));
  } catch (err) {
    logger.error('Get users:', err);
    return error(res, 'Failed to fetch users');
  }
};

const getRoles = async (req, res) => {
  try {
    const roles = (await query('SELECT Id AS id, Name AS name, Description AS description FROM dbo.Roles ORDER BY Name')).recordset;
    const permissions = (await query('SELECT RoleId AS roleId, PermissionId AS permissionId FROM dbo.RolePermissions ORDER BY RoleId, PermissionId')).recordset;

    return success(res, roles.map((role) => ({
      ...role,
      permissions: permissions.filter((item) => item.roleId === role.id).map((item) => item.permissionId),
    })));
  } catch (err) {
    logger.error('Get roles:', err);
    return error(res, 'Failed to fetch roles');
  }
};

const create = async (req, res) => {
  try {
    const role = normalizeRole(req.body.role);
    const name = String(req.body.name || '').trim();
    const mobile = String(req.body.mobile || '').replace(/\D/g, '');
    const email = String(req.body.email || '').trim();
    const password = String(req.body.password || '');

    if (!name || !mobile || !password || !role) {
      return error(res, 'Name, mobile number, password, and valid role are required', 400);
    }

    if (mobile.length !== 10) {
      return error(res, 'Mobile number must be 10 digits', 400);
    }

    const existing = await queryOne(
      'SELECT Id FROM dbo.Users WHERE Mobile=@mobile OR (Email=@email AND @email <> \'\')',
      {
        mobile: { type: NVarChar(20), value: mobile },
        email: { type: NVarChar(200), value: email },
      }
    );

    if (existing) return error(res, 'A user already exists with this mobile number or email', 409);

    const id = generateId();
    const now = today();
    const passwordHash = await bcrypt.hash(password, 10);

    await execute(`
      INSERT INTO dbo.Users (Id,GoogleId,Name,Email,Mobile,Role,PasswordHash,IsActive,LastLogin,CreatedAt,UpdatedAt)
      VALUES (@id,NULL,@name,@email,@mobile,@role,@passwordHash,1,NULL,@now,@now)
    `, {
      id: { type: NVarChar(36), value: id },
      name: { type: NVarChar(150), value: name },
      email: { type: NVarChar(200), value: email },
      mobile: { type: NVarChar(20), value: mobile },
      role: { type: NVarChar(50), value: role },
      passwordHash: { type: NVarChar(500), value: passwordHash },
      now: { type: NVarChar(20), value: now },
    });

    await syncUserRole(id, role);

    const created = await queryOne(`${userSelect} WHERE Id=@id`, { id: { type: NVarChar(36), value: id } });
    return success(res, publicUser(created), 'User created', 201);
  } catch (err) {
    logger.error('Create user:', err);
    return error(res, 'Failed to create user');
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await queryOne('SELECT * FROM dbo.Users WHERE Id=@id', {
      id: { type: NVarChar(36), value: id },
    });

    if (!existing) return error(res, 'User not found', 404);

    const role = normalizeRole(req.body.role ?? existing.Role);
    const name = String(req.body.name ?? existing.Name).trim();
    const mobile = String(req.body.mobile ?? existing.Mobile ?? '').replace(/\D/g, '');
    const email = String(req.body.email ?? existing.Email ?? '').trim();
    const isActive = req.body.isActive === undefined ? existing.IsActive : Boolean(req.body.isActive);

    if (!name || !mobile || !role) {
      return error(res, 'Name, mobile number, and valid role are required', 400);
    }

    const duplicate = await queryOne(
      'SELECT Id FROM dbo.Users WHERE Id<>@id AND (Mobile=@mobile OR (Email=@email AND @email <> \'\'))',
      {
        id: { type: NVarChar(36), value: id },
        mobile: { type: NVarChar(20), value: mobile },
        email: { type: NVarChar(200), value: email },
      }
    );

    if (duplicate) return error(res, 'Another user already has this mobile number or email', 409);

    await execute(`
      UPDATE dbo.Users SET Name=@name, Email=@email, Mobile=@mobile, Role=@role,
        IsActive=@isActive, UpdatedAt=@now
      WHERE Id=@id
    `, {
      id: { type: NVarChar(36), value: id },
      name: { type: NVarChar(150), value: name },
      email: { type: NVarChar(200), value: email },
      mobile: { type: NVarChar(20), value: mobile },
      role: { type: NVarChar(50), value: role },
      isActive: { type: Bit, value: isActive },
      now: { type: NVarChar(20), value: today() },
    });

    if (req.body.password) {
      const passwordHash = await bcrypt.hash(String(req.body.password), 10);
      await execute('UPDATE dbo.Users SET PasswordHash=@passwordHash WHERE Id=@id', {
        id: { type: NVarChar(36), value: id },
        passwordHash: { type: NVarChar(500), value: passwordHash },
      });
    }

    await syncUserRole(id, role);

    const updated = await queryOne(`${userSelect} WHERE Id=@id`, { id: { type: NVarChar(36), value: id } });
    return success(res, publicUser(updated));
  } catch (err) {
    logger.error('Update user:', err);
    return error(res, 'Failed to update user');
  }
};

const toggleActive = async (req, res) => {
  try {
    await execute('UPDATE dbo.Users SET IsActive = 1-IsActive, UpdatedAt=@now WHERE Id=@id', {
      id: { type: NVarChar(36), value: req.params.id },
      now: { type: NVarChar(20), value: today() },
    });

    const updated = await queryOne(`${userSelect} WHERE Id=@id`, { id: { type: NVarChar(36), value: req.params.id } });
    if (!updated) return error(res, 'User not found', 404);
    return success(res, publicUser(updated));
  } catch (err) {
    logger.error('Toggle user:', err);
    return error(res, 'Failed to update user status');
  }
};

// GET /users/:id
const getById = async (req, res) => {
  try {
    const user = await queryOne(`${userSelect} WHERE Id=@id`, { id: { type: NVarChar(36), value: req.params.id } });
    if (!user) return error(res, 'User not found', 404);
    return success(res, publicUser(user));
  } catch (err) {
    logger.error('Get user:', err);
    return error(res, 'Failed to fetch user');
  }
};

// DELETE /users/:id
const remove = async (req, res) => {
  try {
    const id = req.params.id;
    if (req.user?.id === id) return error(res, 'You cannot delete your own account', 400);

    const target = await queryOne('SELECT Id, Role, IsActive FROM dbo.Users WHERE Id=@id', {
      id: { type: NVarChar(36), value: id },
    });
    if (!target) return error(res, 'User not found', 404);

    // Never allow removing the last active admin.
    if (normalizeRole(target.Role) === 'admin') {
      const admins = await queryOne("SELECT COUNT(*) AS n FROM dbo.Users WHERE LOWER(Role)='admin' AND IsActive=1");
      if ((admins?.n || 0) <= 1) return error(res, 'Cannot delete the last active admin account', 400);
    }

    // Remove dependent rows first, then the user.
    await execute('DELETE FROM dbo.UserRoles WHERE UserId=@id', { id: { type: NVarChar(36), value: id } });
    await execute('DELETE FROM dbo.CustomerUserAccess WHERE UserId=@id', { id: { type: NVarChar(36), value: id } });
    await execute('DELETE FROM dbo.Users WHERE Id=@id', { id: { type: NVarChar(36), value: id } });
    return success(res, null, 'User deleted');
  } catch (err) {
    logger.error('Delete user:', err);
    return error(res, 'Failed to delete user');
  }
};

module.exports = { getAll, getRoles, getById, create, update, toggleActive, remove };