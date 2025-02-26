const express = require('express');
const router = express.Router();
const { Tenant, TenantBranding, createTenant, getTenantById, listTenants } = require('../../models/tenant');
const { authenticate } = require('../../middleware/auth');

/**
 * GET /api/tenants
 * 
 * List all tenants
 * Restricted to super-admins only
 */
router.get('/', authenticate(['super-admin']), async (req, res, next) => {
  try {
    const tenants = await listTenants();
    res.json(tenants);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tenants
 * 
 * Create a new tenant
 * Restricted to super-admins only
 */
router.post('/', authenticate(['super-admin']), async (req, res, next) => {
  try {
    const { name, domain, active, config, branding } = req.body;
    
    const tenant = await createTenant(
      { name, domain, active, config },
      branding || {}
    );
    
    res.status(201).json(tenant);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tenants/:id
 * 
 * Get tenant by ID
 * Restricted to super-admins or tenant admins of that specific tenant
 */
router.get('/:id', authenticate(['super-admin', 'admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check access permission (super-admin or admin of this tenant)
    if (req.user.role !== 'super-admin' && req.user.tenantId !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const tenant = await getTenantById(id);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json(tenant);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/tenants/:id
 * 
 * Update tenant
 * Restricted to super-admins or tenant admins of that specific tenant
 */
router.put('/:id', authenticate(['super-admin', 'admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, domain, active, config, branding } = req.body;
    
    // Check access permission (super-admin or admin of this tenant)
    if (req.user.role !== 'super-admin' && req.user.tenantId !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Start a transaction
    const transaction = await Tenant.sequelize.transaction();
    
    try {
      // Update tenant
      const [updatedRows] = await Tenant.update(
        { name, domain, active, config },
        { 
          where: { id },
          transaction
        }
      );
      
      if (updatedRows === 0) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Tenant not found' });
      }
      
      // Update branding if provided
      if (branding) {
        await TenantBranding.update(
          branding,
          { 
            where: { tenantId: id },
            transaction
          }
        );
      }
      
      await transaction.commit();
      
      // Fetch the updated tenant
      const tenant = await getTenantById(id);
      res.json(tenant);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/tenants/:id
 * 
 * Delete tenant (or mark as inactive)
 * Restricted to super-admins only
 */
router.delete('/:id', authenticate(['super-admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Option 1: Hard delete (not recommended in production)
    // await Tenant.destroy({ where: { id } });
    
    // Option 2: Mark as inactive (soft delete)
    const [updatedRows] = await Tenant.update(
      { active: false },
      { where: { id } }
    );
    
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;