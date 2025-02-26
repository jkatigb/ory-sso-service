const express = require('express');
const router = express.Router();
const hydraService = require('../services/hydra');
const tenantService = require('../services/tenant');
const { User } = require('../models/user');

/**
 * GET /consent
 * 
 * Handles the consent request from Hydra. This endpoint renders the consent form
 * or skips the consent if the user previously gave consent for the client.
 */
router.get('/', async (req, res, next) => {
  try {
    // The challenge is used to fetch information about the consent request from Hydra
    const challenge = req.query.consent_challenge;
    
    if (!challenge) {
      return res.status(400).json({ error: 'Consent challenge is missing' });
    }

    // Fetch information about the consent request from Hydra
    const consentRequest = await hydraService.getConsentRequest(challenge);
    
    // Extract client information and check if tenant can be identified
    const client = consentRequest.client || {};
    const clientMetadata = client.metadata || {};
    
    // Try to identify the tenant
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

    // Get user information
    const userId = consentRequest.subject;
    let user = null;
    
    if (userId) {
      user = await User.findByPk(userId);
    }

    // If the user has previously given consent, we can skip showing the UI
    if (consentRequest.skip) {
      // Determine which scopes to grant based on what's been requested and previously granted
      const grantScope = consentRequest.requested_scope || [];
      
      // Create a session object to persist in Hydra
      const session = {
        access_token: {
          // Data included in the access token
          tenant_id: user?.tenantId
        },
        id_token: {
          // Data included in the ID token (OpenID Connect)
          email: user?.email,
          name: user?.profile?.name || user?.username,
          tenant_id: user?.tenantId
        }
      };
      
      // Accept the consent request
      const acceptResponse = await hydraService.acceptConsent(challenge, {
        grant_scope: grantScope,
        grant_access_token_audience: consentRequest.requested_access_token_audience,
        remember: true, // Remember the consent
        remember_for: 3600 * 24 * 30, // 30 days
        session: session
      });
      
      // Redirect to the redirect_to URL from Hydra
      return res.redirect(acceptResponse.redirect_to);
    }

    // Render the consent form
    res.render('consent', {
      challenge,
      tenant: tenant || { name: 'SSO Service' },
      branding: tenant?.branding || {},
      client: client,
      user: user,
      scopes: consentRequest.requested_scope || [],
      error: req.query.error || null
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /consent
 * 
 * Handles the consent form submission. Grants or denies the requested scopes
 * based on user's choice.
 */
router.post('/', async (req, res, next) => {
  try {
    const { challenge, submit, grant_scope, remember } = req.body;
    
    if (!challenge) {
      return res.status(400).json({ error: 'Consent challenge is missing' });
    }

    // Fetch information about the consent request
    const consentRequest = await hydraService.getConsentRequest(challenge);
    
    // Get user information
    const userId = consentRequest.subject;
    let user = null;
    
    if (userId) {
      user = await User.findByPk(userId);
    }

    // If user clicked "Deny", reject the consent request
    if (submit === 'deny') {
      const rejectResponse = await hydraService.rejectConsent(challenge, {
        error: 'access_denied',
        error_description: 'The user denied access to your application'
      });
      
      return res.redirect(rejectResponse.redirect_to);
    }

    // User clicked "Allow", so we grant consent
    // Convert the grant_scope array to a proper array if it's not
    let grantScopes = Array.isArray(grant_scope) ? grant_scope : [grant_scope].filter(Boolean);
    
    // If no scopes were selected, use all requested scopes (simpler UX)
    if (!grantScopes.length && consentRequest.requested_scope) {
      grantScopes = consentRequest.requested_scope;
    }

    // Prepare the session object
    const session = {
      access_token: {
        // Data included in the access token
        tenant_id: user?.tenantId
      },
      id_token: {
        // Data included in the ID token (OpenID Connect)
        email: user?.email,
        name: user?.profile?.name || user?.username,
        tenant_id: user?.tenantId
      }
    };

    // Accept the consent request
    const rememberConsent = remember === 'on';
    const acceptResponse = await hydraService.acceptConsent(challenge, {
      grant_scope: grantScopes,
      grant_access_token_audience: consentRequest.requested_access_token_audience,
      remember: rememberConsent,
      remember_for: rememberConsent ? 3600 * 24 * 30 : 3600, // 30 days or 1 hour
      session: session
    });
    
    // Redirect to the redirect_to URL from Hydra
    res.redirect(acceptResponse.redirect_to);
  } catch (error) {
    next(error);
  }
});

module.exports = router;