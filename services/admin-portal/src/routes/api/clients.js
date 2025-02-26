const express = require('express');
const router = express.Router();
const hydraService = require('../../services/hydra');
const { authenticate } = require('../../middleware/auth');

/**
 * GET /api/clients
 * 
 * List OAuth2 clients
 * For super-admins: all clients
 * For tenant admins: only their tenant's clients
 */
router.get('/', authenticate(['super-admin', 'admin', 'viewer']), async (req, res, next) => {
  try {
    let clients;
    
    if (req.user.role === 'super-admin') {
      // Super admins can see all clients
      clients = await hydraService.listClients();
    } else {
      // Tenant admins/viewers can only see their tenant's clients
      clients = await hydraService.listTenantClients(req.user.tenantId);
    }
    
    res.json(clients);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/clients
 * 
 * Create a new OAuth2 client
 * For super-admins: can create for any tenant
 * For tenant admins: can only create for their tenant
 */
router.post('/', authenticate(['super-admin', 'admin']), async (req, res, next) => {
  try {
    const clientData = req.body;
    let tenantId = clientData.metadata?.tenant_id;
    
    // Validate tenant ID
    if (req.user.role !== 'super-admin') {
      // Regular admins can only create clients for their own tenant
      if (tenantId && tenantId !== req.user.tenantId) {
        return res.status(403).json({ error: 'Cannot create clients for other tenants' });
      }
      
      // Ensure tenant ID is set
      tenantId = req.user.tenantId;
    }
    
    // Create client through Hydra
    const client = await hydraService.createTenantClient(clientData, tenantId);
    
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/clients/:id
 * 
 * Get client by ID
 * For super-admins: any client
 * For tenant admins: only their tenant's clients
 */
router.get('/:id', authenticate(['super-admin', 'admin', 'viewer']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Fetch the client
    const client = await hydraService.getClient(id);
    
    // Check tenant access permission
    if (req.user.role !== 'super-admin') {
      const clientTenantId = client.metadata?.tenant_id;
      
      if (!clientTenantId || clientTenantId !== req.user.tenantId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    
    res.json(client);
  } catch (error) {
    // Check if it's a 404 error from Hydra
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Client not found' });
    }
    next(error);
  }
});

/**
 * PUT /api/clients/:id
 * 
 * Update an OAuth2 client
 * For super-admins: any client
 * For tenant admins: only their tenant's clients
 */
router.put('/:id', authenticate(['super-admin', 'admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const clientData = req.body;
    
    // First get the existing client to check permissions
    let existingClient;
    try {
      existingClient = await hydraService.getClient(id);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ error: 'Client not found' });
      }
      throw error;
    }
    
    // Check tenant access permission
    if (req.user.role !== 'super-admin') {
      const clientTenantId = existingClient.metadata?.tenant_id;
      
      if (!clientTenantId || clientTenantId !== req.user.tenantId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Ensure tenant ID remains the same
      if (!clientData.metadata) {
        clientData.metadata = {};
      }
      clientData.metadata.tenant_id = req.user.tenantId;
    }
    
    // Update the client
    const updatedClient = await hydraService.updateClient(id, clientData);
    
    res.json(updatedClient);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/clients/:id
 * 
 * Delete an OAuth2 client
 * For super-admins: any client
 * For tenant admins: only their tenant's clients
 */
router.delete('/:id', authenticate(['super-admin', 'admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // First get the existing client to check permissions
    let existingClient;
    try {
      existingClient = await hydraService.getClient(id);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ error: 'Client not found' });
      }
      throw error;
    }
    
    // Check tenant access permission
    if (req.user.role !== 'super-admin') {
      const clientTenantId = existingClient.metadata?.tenant_id;
      
      if (!clientTenantId || clientTenantId !== req.user.tenantId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    
    // Delete the client
    await hydraService.deleteClient(id);
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/clients/:id/regenerate-secret
 * 
 * Regenerate client secret
 * For super-admins: any client
 * For tenant admins: only their tenant's clients
 */
router.post('/:id/regenerate-secret', authenticate(['super-admin', 'admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // First get the existing client to check permissions
    let existingClient;
    try {
      existingClient = await hydraService.getClient(id);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ error: 'Client not found' });
      }
      throw error;
    }
    
    // Check tenant access permission
    if (req.user.role !== 'super-admin') {
      const clientTenantId = existingClient.metadata?.tenant_id;
      
      if (!clientTenantId || clientTenantId !== req.user.tenantId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    
    // Regenerate the client secret
    const updatedClient = await hydraService.regenerateClientSecret(id);
    
    res.json(updatedClient);
  } catch (error) {
    next(error);
  }
});

module.exports = router;