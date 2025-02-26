/*
File: azure-routes.js
Path: config/entra-id/azure-routes.js
Purpose: Express routes for Microsoft Entra ID (Azure AD) authentication
Last change: Added multi-tenant support for enterprise customers
Dependencies: Express.js, passport.js, passport-azure-ad
Usage: Include this file in your Express app using require('./config/entra-id/azure-routes')(app, passport)
*/

const passport = require('passport');
const { OIDCStrategy } = require('passport-azure-ad');
const axios = require('axios');
const config = require('./config');

module.exports = function(app) {
  // Configure passport to use Azure AD strategy
  passport.use(new OIDCStrategy({
    identityMetadata: `${config.authority}${config.tenantID}/v2.0/.well-known/openid-configuration`,
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    responseType: 'code id_token',
    responseMode: 'form_post',
    redirectUrl: config.redirectUri,
    allowHttpForRedirectUrl: true, // Set to false in production
    scope: config.scope.split(' '),
    passReqToCallback: true, // Set to true to receive the request in the callback
    validateIssuer: config.isMultiTenant ? false : true, // Set to false for multi-tenant, true for single tenant
    issuer: config.isMultiTenant ? null : `${config.authority}${config.tenantID}/v2.0`, // Only used in single-tenant mode
    loggingLevel: 'info',
    loggingNoPII: false, // Set to true in production
  }, (req, profile, done) => {
    // This function is called after successful authentication
    
    // For multi-tenant scenarios, verify if the tenant is allowed
    if (config.isMultiTenant && profile.tid) {
      // If allowedTenants array is not empty, check if tenant is in the list
      if (config.allowedTenants.length > 0 && !config.allowedTenants.includes(profile.tid)) {
        return done(new Error('Tenant not authorized to access this application'));
      }
      
      // Store tenant ID in the profile
      profile.tenant = profile.tid;
    }
    
    // Store the login challenge from the session
    if (req.session && req.session.login_challenge) {
      profile.login_challenge = req.session.login_challenge;
    }
    
    return done(null, profile);
  }));

  // Used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Used to deserialize the user from the session
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  // Initiate Azure AD authentication
  app.get('/auth/azure', (req, res, next) => {
    // Store the Hydra login challenge in the session
    if (req.query.login_challenge) {
      req.session.login_challenge = req.query.login_challenge;
    }
    
    // For enterprise SSO, we might have a tenant hint
    const tenant = req.query.tenant || config.tenantID;
    
    // Set custom parameters including prompt and domain_hint if available
    const authParams = {
      prompt: 'login',
      failureRedirect: '/login',
    };
    
    // If domain_hint is provided, pass it to Azure AD
    if (req.query.domain_hint) {
      authParams.domain_hint = req.query.domain_hint;
    }
    
    passport.authenticate('azuread-openidconnect', authParams)(req, res, next);
  });

  // Azure AD callback endpoint
  app.post('/auth/azure/callback',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/login' }),
    async (req, res) => {
      try {
        // Get the login challenge from the user profile or session
        const loginChallenge = req.user.login_challenge || req.session.login_challenge;
        
        if (!loginChallenge) {
          return res.redirect('/login?error=missing_challenge');
        }
        
        // Accept the login request with Hydra using the user's profile
        const response = await axios.put(`${config.hydraAdminUrl}/oauth2/auth/requests/login/accept`, {
          subject: req.user.oid, // Microsoft object ID as the subject
          remember: true,
          remember_for: 3600, // 1 hour
          acr: "",
          context: {
            // Additional user data to pass along
            name: req.user.name,
            email: req.user.preferred_username,
            provider: 'azure',
            tenant: req.user.tenant || req.user.tid,
            // Include organization details if available
            organization: req.user._json && req.user._json.tenant_country_name ? {
              name: req.user._json.tenant_country_name,
              id: req.user.tid
            } : null
          }
        }, {
          params: {
            login_challenge: loginChallenge
          }
        });
        
        // Redirect to the redirect_to URL from Hydra's response
        res.redirect(response.data.redirect_to);
      } catch (error) {
        console.error('Error accepting login with Hydra:', error);
        res.redirect('/login?error=hydra_error');
      }
    }
  );

  // Logout from Azure AD
  app.get('/auth/azure/logout', (req, res) => {
    const tenant = req.user && req.user.tenant ? req.user.tenant : config.tenantID;
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      // Redirect to Azure AD logout endpoint
      res.redirect(`${config.authority}${tenant}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(`http://localhost:3010`)}`);
    });
  });
  
  // API endpoint to get a list of registered enterprise tenants
  app.get('/api/tenants', (req, res) => {
    // In a real implementation, you would fetch this from a database
    res.json({
      tenants: config.allowedTenants.map(tenantId => ({
        id: tenantId,
        name: `Organization using ${tenantId}` // In a real app, store and return the actual org name
      }))
    });
  });
}; 