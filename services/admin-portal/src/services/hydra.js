const axios = require('axios');

const hydraAdmin = axios.create({
  baseURL: process.env.HYDRA_ADMIN_URL || 'http://localhost:4445',
  timeout: 5000
});

/**
 * Create an OAuth 2.0 client
 * @param {Object} clientData Client configuration
 * @returns {Promise<Object>} Created client data
 */
async function createClient(clientData) {
  try {
    const response = await hydraAdmin.post('/clients', clientData);
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get client by ID
 * @param {string} clientId Client ID
 * @returns {Promise<Object>} Client data
 */
async function getClient(clientId) {
  try {
    const response = await hydraAdmin.get(`/clients/${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * List all clients
 * @param {number} limit Maximum number of clients to return
 * @param {number} offset Pagination offset
 * @returns {Promise<Array<Object>>} List of clients
 */
async function listClients(limit = 100, offset = 0) {
  try {
    const response = await hydraAdmin.get(`/clients?limit=${limit}&offset=${offset}`);
    return response.data;
  } catch (error) {
    console.error('Error listing clients:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Update an OAuth 2.0 client
 * @param {string} clientId Client ID
 * @param {Object} clientData Updated client configuration
 * @returns {Promise<Object>} Updated client data
 */
async function updateClient(clientId, clientData) {
  try {
    const response = await hydraAdmin.put(`/clients/${clientId}`, clientData);
    return response.data;
  } catch (error) {
    console.error('Error updating client:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Delete an OAuth 2.0 client
 * @param {string} clientId Client ID
 * @returns {Promise<void>}
 */
async function deleteClient(clientId) {
  try {
    await hydraAdmin.delete(`/clients/${clientId}`);
  } catch (error) {
    console.error('Error deleting client:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create a client for a specific tenant with the appropriate metadata
 * @param {Object} clientData Client base configuration
 * @param {string} tenantId Tenant UUID
 * @returns {Promise<Object>} Created client data
 */
async function createTenantClient(clientData, tenantId) {
  // Add tenant ID to the client metadata
  const clientWithTenantMetadata = {
    ...clientData,
    metadata: {
      ...(clientData.metadata || {}),
      tenant_id: tenantId
    }
  };

  return await createClient(clientWithTenantMetadata);
}

/**
 * List all clients for a specific tenant
 * @param {string} tenantId Tenant UUID
 * @param {number} limit Maximum number of clients to return
 * @param {number} offset Pagination offset
 * @returns {Promise<Array<Object>>} List of clients for the tenant
 */
async function listTenantClients(tenantId, limit = 100, offset = 0) {
  try {
    const allClients = await listClients(limit, offset);
    
    // Filter clients by tenant ID in metadata
    return allClients.filter(client => {
      const metadata = client.metadata || {};
      return metadata.tenant_id === tenantId;
    });
  } catch (error) {
    console.error('Error listing tenant clients:', error.message);
    throw error;
  }
}

/**
 * Generate a new client secret for an existing client
 * @param {string} clientId Client ID
 * @returns {Promise<Object>} Updated client with new secret
 */
async function regenerateClientSecret(clientId) {
  try {
    const response = await hydraAdmin.post(`/clients/${clientId}/regenerate-secret`);
    return response.data;
  } catch (error) {
    console.error('Error regenerating client secret:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  createClient,
  getClient,
  listClients,
  updateClient,
  deleteClient,
  createTenantClient,
  listTenantClients,
  regenerateClientSecret
};