const express = require('express');
const router = express.Router();
const { authenticateAdmin, createTenantAdmin } = require('../models/tenant');
const { authenticate } = require('../middleware/auth');

/**
 * POST /auth/login
 * 
 * Authenticate an admin and get a JWT token
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const result = await authenticateAdmin(email, password);
    
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /auth/me
 * 
 * Get current authenticated admin's profile
 */
router.get('/me', authenticate(), async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/admin
 * 
 * Create a new tenant admin (super-admin only)
 */
router.post('/admin', authenticate(['super-admin']), async (req, res, next) => {
  try {
    const { email, name, password, tenantId, role } = req.body;
    
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password are required' });
    }
    
    // Create new admin
    const admin = await createTenantAdmin({
      email,
      name,
      password,
      tenantId,
      role: role || 'admin'
    });
    
    res.status(201).json(admin.toJSON());
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/tenant-admin
 * 
 * Create a new admin for the current tenant (tenant admins only)
 */
router.post('/tenant-admin', authenticate(['admin']), async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password are required' });
    }
    
    // Create new admin for the current tenant
    const admin = await createTenantAdmin({
      email,
      name,
      password,
      tenantId: req.user.tenantId,
      role: 'admin' // Tenant admins can only create other admins, not super-admins
    });
    
    res.status(201).json(admin.toJSON());
  } catch (error) {
    next(error);
  }
});

module.exports = router;