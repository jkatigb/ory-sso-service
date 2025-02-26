const axios = require('axios');

const hydraAdmin = axios.create({
  baseURL: process.env.HYDRA_ADMIN_URL || 'http://localhost:4445',
  timeout: 5000
});

/**
 * Get login request information
 * @param {string} challenge The login challenge sent by Hydra
 * @returns {Promise<Object>} Login request information
 */
async function getLoginRequest(challenge) {
  try {
    const response = await hydraAdmin.get(`/oauth2/auth/requests/login?login_challenge=${challenge}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching login request:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Accept a login request
 * @param {string} challenge The login challenge
 * @param {Object} body The acceptance details
 * @returns {Promise<Object>} Response with redirect URL
 */
async function acceptLogin(challenge, body) {
  try {
    const response = await hydraAdmin.put(`/oauth2/auth/requests/login/accept?login_challenge=${challenge}`, body);
    return response.data;
  } catch (error) {
    console.error('Error accepting login request:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Reject a login request
 * @param {string} challenge The login challenge
 * @param {Object} body The rejection details
 * @returns {Promise<Object>} Response with redirect URL
 */
async function rejectLogin(challenge, body) {
  try {
    const response = await hydraAdmin.put(`/oauth2/auth/requests/login/reject?login_challenge=${challenge}`, body);
    return response.data;
  } catch (error) {
    console.error('Error rejecting login request:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get consent request information
 * @param {string} challenge The consent challenge sent by Hydra
 * @returns {Promise<Object>} Consent request information
 */
async function getConsentRequest(challenge) {
  try {
    const response = await hydraAdmin.get(`/oauth2/auth/requests/consent?consent_challenge=${challenge}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching consent request:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Accept a consent request
 * @param {string} challenge The consent challenge
 * @param {Object} body The acceptance details
 * @returns {Promise<Object>} Response with redirect URL
 */
async function acceptConsent(challenge, body) {
  try {
    const response = await hydraAdmin.put(`/oauth2/auth/requests/consent/accept?consent_challenge=${challenge}`, body);
    return response.data;
  } catch (error) {
    console.error('Error accepting consent request:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Reject a consent request
 * @param {string} challenge The consent challenge
 * @param {Object} body The rejection details
 * @returns {Promise<Object>} Response with redirect URL
 */
async function rejectConsent(challenge, body) {
  try {
    const response = await hydraAdmin.put(`/oauth2/auth/requests/consent/reject?consent_challenge=${challenge}`, body);
    return response.data;
  } catch (error) {
    console.error('Error rejecting consent request:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get logout request information
 * @param {string} challenge The logout challenge sent by Hydra
 * @returns {Promise<Object>} Logout request information
 */
async function getLogoutRequest(challenge) {
  try {
    const response = await hydraAdmin.get(`/oauth2/auth/requests/logout?logout_challenge=${challenge}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching logout request:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Accept a logout request
 * @param {string} challenge The logout challenge
 * @returns {Promise<Object>} Response with redirect URL
 */
async function acceptLogout(challenge) {
  try {
    const response = await hydraAdmin.put(`/oauth2/auth/requests/logout/accept?logout_challenge=${challenge}`);
    return response.data;
  } catch (error) {
    console.error('Error accepting logout request:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Reject a logout request
 * @param {string} challenge The logout challenge
 * @param {Object} body The rejection details
 * @returns {Promise<Object>} Response with redirect URL
 */
async function rejectLogout(challenge, body) {
  try {
    const response = await hydraAdmin.put(`/oauth2/auth/requests/logout/reject?logout_challenge=${challenge}`, body);
    return response.data;
  } catch (error) {
    console.error('Error rejecting logout request:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Introspect an OAuth2 token (validate access token or refresh token)
 * @param {string} token The token to introspect
 * @returns {Promise<Object>} Token metadata
 */
async function introspectToken(token) {
  try {
    const response = await hydraAdmin.post('/oauth2/introspect', {
      token
    });
    return response.data;
  } catch (error) {
    console.error('Error introspecting token:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  getLoginRequest,
  acceptLogin,
  rejectLogin,
  getConsentRequest,
  acceptConsent,
  rejectConsent,
  getLogoutRequest,
  acceptLogout,
  rejectLogout,
  introspectToken
};