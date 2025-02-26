const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { User, createUser, findByUsername, findByEmail } = require('../../models/user');

/**
 * GET /api/users
 * 
 * List users
 * For super-admins: all users or filtered by tenant
 * For tenant admins: only their tenant's users
 */
router.get('/', authenticate(['super-admin', 'admin', 'viewer']), async (req, res, next) => {
  try {
    const { tenantId } = req.query;
    let where = {};
    
    // Filter by tenant ID
    if (req.user.role !== 'super-admin') {
      // Regular users can only see users in their tenant
      where.tenantId = req.user.tenantId;
    } else if (tenantId) {
      // Super admins can filter by tenant
      where.tenantId = tenantId;
    }
    
    const users = await User.findAll({ where });
    
    res.json(users);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users
 * 
 * Create a new user
 * For super-admins: can create for any tenant
 * For tenant admins: can only create for their tenant
 */
router.post('/', authenticate(['super-admin', 'admin']), async (req, res, next) => {
  try {
    const { username, email, password, profile, tenantId } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    // Validate tenant permission
    let targetTenantId = tenantId;
    
    if (req.user.role !== 'super-admin') {
      // Regular admins can only create users in their tenant
      if (targetTenantId && targetTenantId !== req.user.tenantId) {
        return res.status(403).json({ error: 'Cannot create users for other tenants' });
      }
      
      targetTenantId = req.user.tenantId;
    }
    
    // Check if username already exists in the tenant
    const existingUsername = await findByUsername(username, targetTenantId);
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already exists in this tenant' });
    }
    
    // Check if email already exists in the tenant
    const existingEmail = await findByEmail(email, targetTenantId);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already exists in this tenant' });
    }
    
    // Create the user
    const user = await createUser({
      username,
      email,
      password,
      tenantId: targetTenantId,
      profile: profile || {}
    });
    
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id
 * 
 * Get user by ID
 * For super-admins: any user
 * For tenant admins: only their tenant's users
 */
router.get('/:id', authenticate(['super-admin', 'admin', 'viewer']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check tenant permission
    if (req.user.role !== 'super-admin' && user.tenantId !== req.user.tenantId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/:id
 * 
 * Update user
 * For super-admins: any user
 * For tenant admins: only their tenant's users
 */
router.put('/:id', authenticate(['super-admin', 'admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, profile, status } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check tenant permission
    if (req.user.role !== 'super-admin' && user.tenantId !== req.user.tenantId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (profile) user.profile = { ...user.profile, ...profile };
    if (status) user.status = status;
    
    await user.save();
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/:id/password
 * 
 * Update user password
 * For super-admins: any user
 * For tenant admins: only their tenant's users
 */
router.put('/:id/password', authenticate(['super-admin', 'admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check tenant permission
    if (req.user.role !== 'super-admin' && user.tenantId !== req.user.tenantId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Update password
    user.setPassword(password);
    await user.save();
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/users/:id
 * 
 * Delete user (or mark as inactive)
 * For super-admins: any user
 * For tenant admins: only their tenant's users
 */
router.delete('/:id', authenticate(['super-admin', 'admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check tenant permission
    if (req.user.role !== 'super-admin' && user.tenantId !== req.user.tenantId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Option 1: Hard delete (not recommended in production)
    // await user.destroy();
    
    // Option 2: Mark as inactive (soft delete)
    user.status = 'inactive';
    await user.save();
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;