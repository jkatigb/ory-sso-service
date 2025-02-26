const express = require('express');
const router = express.Router();
const hydraService = require('../services/hydra');
const tenantService = require('../services/tenant');

/**
 * GET /logout
 * 
 * Handles the logout request from Hydra. This endpoint renders the logout confirmation 
 * page or immediately accepts the logout if no confirmation is needed.
 */
router.get('/', async (req, res, next) => {
  try {
    // The challenge is used to fetch information about the logout request from Hydra
    const challenge = req.query.logout_challenge;
    
    if (!challenge) {
      return res.status(400).json({ error: 'Logout challenge is missing' });
    }

    // Fetch information about the logout request from Hydra
    const logoutRequest = await hydraService.getLogoutRequest(challenge);
    
    // Determine if we should ask for logout confirmation
    const skipConfirmation = true; // Set to false if you want to confirm logout
    
    // If we want to skip confirmation, immediately accept logout
    if (skipConfirmation) {
      const acceptResponse = await hydraService.acceptLogout(challenge);
      return res.redirect(acceptResponse.redirect_to);
    }

    // Try to identify the tenant from the hostname
    let tenant;
    try {
      tenant = await tenantService.getTenantByDomain(req.hostname);
    } catch (error) {
      console.error('Error identifying tenant:', error);
    }

    // Render the logout confirmation page
    res.render('logout', {
      challenge,
      tenant: tenant || { name: 'SSO Service' },
      branding: tenant?.branding || {},
      client: logoutRequest.client || {},
      error: req.query.error || null
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /logout
 * 
 * Handles the logout confirmation form submission. Accepts or rejects the logout
 * request based on user's choice.
 */
router.post('/', async (req, res, next) => {
  try {
    const { challenge, submit } = req.body;
    
    if (!challenge) {
      return res.status(400).json({ error: 'Logout challenge is missing' });
    }

    // If user clicked "Cancel", reject the logout request
    if (submit === 'cancel') {
      // Reject the logout request
      const rejectResponse = await hydraService.rejectLogout(challenge, {
        error: 'access_denied',
        error_description: 'The user denied the logout request'
      });
      
      return res.redirect(rejectResponse.redirect_to);
    }

    // User clicked "Logout", so we accept the logout request
    const acceptResponse = await hydraService.acceptLogout(challenge);
    
    // Redirect to the redirect_to URL from Hydra
    res.redirect(acceptResponse.redirect_to);
  } catch (error) {
    next(error);
  }
});

module.exports = router;