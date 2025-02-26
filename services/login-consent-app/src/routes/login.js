const express = require('express');
const router = express.Router();
const hydraService = require('../services/hydra');
const tenantService = require('../services/tenant');
const { authenticate } = require('../models/user');

/**
 * GET /login
 * 
 * Handles the login request from Hydra. This endpoint renders the login form
 * or skips the login if the user is already authenticated.
 */
router.get('/', async (req, res, next) => {
  try {
    // The challenge is used to fetch information about the login request from Hydra
    const challenge = req.query.login_challenge;
    
    if (!challenge) {
      return res.status(400).json({ error: 'Login challenge is missing' });
    }

    // Fetch information about the login request from Hydra
    const loginRequest = await hydraService.getLoginRequest(challenge);
    
    // Extract client information and check if tenant can be identified
    const client = loginRequest.client || {};
    const clientMetadata = client.metadata || {};
    
    // Try to identify the tenant from client metadata or domain
    let tenant;
    try {
      if (clientMetadata.tenant_id) {
        tenant = await tenantService.getTenantById(clientMetadata.tenant_id);
      } else if (req.hostname) {
        // Try to identify by hostname
        tenant = await tenantService.getTenantByDomain(req.hostname);
      }
    } catch (error) {
      console.error('Error identifying tenant:', error);
    }

    // If the user is already authenticated, accept the login request
    if (loginRequest.skip) {
      const acceptResponse = await hydraService.acceptLogin(challenge, {
        subject: loginRequest.subject,
        remember: loginRequest.skip,
        remember_for: 3600 // Remember login for 1 hour
      });
      
      return res.redirect(acceptResponse.redirect_to);
    }

    // Render the login form
    res.render('login', {
      challenge,
      tenant: tenant || { name: 'SSO Service' },
      branding: tenant?.branding || {},
      client: client,
      loginHint: loginRequest.login_hint || '',
      error: req.query.error || null
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /login
 * 
 * Handles the login form submission. Authenticates the user and accepts
 * or rejects the login request.
 */
router.post('/', async (req, res, next) => {
  try {
    const { challenge, username, password, remember } = req.body;
    
    if (!challenge) {
      return res.status(400).json({ error: 'Login challenge is missing' });
    }

    // Fetch information about the login request
    const loginRequest = await hydraService.getLoginRequest(challenge);
    
    // Extract client and identify tenant
    const client = loginRequest.client || {};
    const clientMetadata = client.metadata || {};
    
    let tenantId;
    if (clientMetadata.tenant_id) {
      tenantId = clientMetadata.tenant_id;
    } else {
      // If no tenant ID in metadata, try to get from domain
      const tenant = await tenantService.getTenantByDomain(req.hostname);
      if (tenant) {
        tenantId = tenant.id;
      } else {
        return res.status(400).json({ error: 'Unable to identify tenant' });
      }
    }

    // Authenticate the user
    const user = await authenticate(username, password, tenantId);
    
    if (!user) {
      // Authentication failed, redirect back to the login form with an error
      return res.redirect(`/login?login_challenge=${challenge}&error=Invalid username or password`);
    }

    // Authentication successful, accept the login request
    const rememberLogin = remember === 'on';
    const acceptResponse = await hydraService.acceptLogin(challenge, {
      subject: user.id, // The user's ID
      remember: rememberLogin,
      remember_for: rememberLogin ? 3600 * 24 * 30 : 3600, // 30 days or 1 hour
      acr: '0', // Authentication Context Class Reference (optional)
      
      // You can add additional claims to the ID token here
      id_token: {
        email: user.email,
        name: user.profile.name || user.username,
        tenant_id: user.tenantId
      }
    });
    
    // Redirect to the redirect_to URL from Hydra
    res.redirect(acceptResponse.redirect_to);
  } catch (error) {
    next(error);
  }
});

module.exports = router;