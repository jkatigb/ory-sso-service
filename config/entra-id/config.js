/*
File: config.js
Path: config/entra-id/config.js
Purpose: Configuration for Microsoft Entra ID (Azure AD) authentication
Last change: Updated for multi-tenant enterprise SSO support
*/

// Replace these values with the actual values from your Azure Portal
module.exports = {
  // Azure AD / Entra ID Configuration
  clientID: "YOUR_CLIENT_ID", // Application (client) ID from Azure portal
  clientSecret: "YOUR_CLIENT_SECRET", // Client Secret from Azure portal
  tenantID: "common", // Use "common" for multi-tenant or specific tenant ID for single tenant
  redirectUri: "http://localhost:3000/auth/azure/callback", // Must match the redirect URI registered in Azure portal
  
  // Ory Hydra Configuration
  hydraAdminUrl: "http://hydra:4445",
  
  // Scope requested from Microsoft Entra ID
  scope: "openid profile email",
  
  // Azure AD Endpoints
  authority: "https://login.microsoftonline.com/",
  authorizeEndpoint: "/oauth2/v2.0/authorize",
  tokenEndpoint: "/oauth2/v2.0/token",
  
  // Session configuration
  sessionSecret: "your-session-secret",
  
  // Enterprise SSO settings
  isMultiTenant: true,
  allowedTenants: [], // Empty array means all tenants are allowed, otherwise list specific tenant IDs
}; 