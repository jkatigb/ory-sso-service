const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const hydraService = require('../services/hydra');

// Apply optional authentication to all dashboard routes
router.use(optionalAuth());

/**
 * GET /
 * 
 * Render the dashboard home or login page
 */
router.get('/', async (req, res, next) => {
  try {
    // If not authenticated, show login page
    if (!req.user) {
      return res.render('login', {
        title: 'SSO Admin Portal - Login'
      });
    }
    
    // For authenticated users, show dashboard
    let clientCount = 0;
    let tenantName = 'System Administrator';
    
    try {
      // Get client count based on role
      if (req.user.role === 'super-admin') {
        const clients = await hydraService.listClients();
        clientCount = clients.length;
      } else if (req.user.tenantId) {
        const clients = await hydraService.listTenantClients(req.user.tenantId);
        clientCount = clients.length;
        
        // For tenant admins, show tenant name
        tenantName = req.user.tenantName || 'Your Organization';
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
    
    res.render('dashboard', {
      title: 'SSO Admin Portal - Dashboard',
      user: req.user,
      tenantName,
      stats: {
        clientCount
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /tenants
 * 
 * Render tenant management page (super-admin only)
 */
router.get('/tenants', async (req, res, next) => {
  try {
    // If not authenticated or not super-admin, redirect to home
    if (!req.user || req.user.role !== 'super-admin') {
      return res.redirect('/');
    }
    
    res.render('tenants', {
      title: 'SSO Admin Portal - Tenant Management',
      user: req.user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /clients
 * 
 * Render client management page
 */
router.get('/clients', async (req, res, next) => {
  try {
    // If not authenticated, redirect to home
    if (!req.user) {
      return res.redirect('/');
    }
    
    res.render('clients', {
      title: 'SSO Admin Portal - Client Management',
      user: req.user,
      tenantId: req.user.tenantId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /branding
 * 
 * Render branding customization page (tenant admins only)
 */
router.get('/branding', async (req, res, next) => {
  try {
    // If not authenticated or super-admin (with no tenant), redirect to home
    if (!req.user || (req.user.role === 'super-admin' && !req.user.tenantId)) {
      return res.redirect('/');
    }
    
    res.render('branding', {
      title: 'SSO Admin Portal - Branding Customization',
      user: req.user,
      tenantId: req.user.tenantId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /users
 * 
 * Render user management page
 */
router.get('/users', async (req, res, next) => {
  try {
    // If not authenticated, redirect to home
    if (!req.user) {
      return res.redirect('/');
    }
    
    res.render('users', {
      title: 'SSO Admin Portal - User Management',
      user: req.user,
      tenantId: req.user.tenantId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /client/:id
 * 
 * Render single client details/edit page
 */
router.get('/client/:id', async (req, res, next) => {
  try {
    // If not authenticated, redirect to home
    if (!req.user) {
      return res.redirect('/');
    }
    
    const { id } = req.params;
    
    // Try to fetch client
    try {
      const client = await hydraService.getClient(id);
      
      // Check tenant permission
      if (req.user.role !== 'super-admin' && 
          (!client.metadata || client.metadata.tenant_id !== req.user.tenantId)) {
        return res.redirect('/clients');
      }
      
      res.render('client-detail', {
        title: `SSO Admin Portal - Client: ${client.client_name || client.client_id}`,
        user: req.user,
        client
      });
    } catch (error) {
      // If client not found, redirect to clients list
      return res.redirect('/clients');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;