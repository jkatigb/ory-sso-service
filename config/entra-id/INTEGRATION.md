/*
File: INTEGRATION.md
Path: config/entra-id/INTEGRATION.md
Purpose: Instructions for integrating Microsoft Entra ID with the login-consent-app
Last change: Initial creation of integration instructions
*/

# Microsoft Entra ID (Azure AD) Integration for SSO Service

This document explains how to integrate Microsoft Entra ID (Azure AD) with your SSO service.

## Prerequisites

1. Microsoft Azure Account with Entra ID
2. Node.js backend for login-consent-app
3. Running Ory Hydra instance

## Step 1: Register an Application in Azure Portal

1. Sign in to the [Azure Portal](https://portal.azure.com/)
2. Navigate to "Microsoft Entra ID" (formerly Azure Active Directory)
3. Select "App registrations" and click "New registration"
4. Enter the following details:
   - Name: `Your SSO Service`
   - Supported account types: Choose appropriate option (e.g., "Accounts in this organizational directory only")
   - Redirect URI: `http://localhost:3000/auth/azure/callback`
5. Click "Register"
6. Note down the following values:
   - Application (client) ID
   - Directory (tenant) ID
7. Create a client secret:
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Add a description and choose an expiration period
   - Click "Add"
   - **Important**: Copy the client secret value (you won't be able to see it again)

## Step 2: Update Configuration Files

1. Update the `config.js` file with your Azure credentials:
   ```javascript
   module.exports = {
     clientID: "YOUR_CLIENT_ID",
     clientSecret: "YOUR_CLIENT_SECRET",
     tenantID: "YOUR_TENANT_ID",
     redirectUri: "http://localhost:3000/auth/azure/callback",
     // Other configurations...
   };
   ```

2. Update your Docker Compose file with the environment variables:
   ```yaml
   environment:
     - AZURE_CLIENT_ID=YOUR_CLIENT_ID
     - AZURE_CLIENT_SECRET=YOUR_CLIENT_SECRET
     - AZURE_TENANT_ID=YOUR_TENANT_ID
     - AZURE_REDIRECT_URI=http://localhost:3000/auth/azure/callback
     - SESSION_SECRET=your-session-secret
   ```

## Step 3: Modify Your Login-Consent Backend App

Add the following dependencies to your `package.json`:

```json
{
  "dependencies": {
    "express-session": "^1.17.3",
    "passport": "^0.6.0",
    "passport-azure-ad": "^4.3.5"
  }
}
```

Update your main Express app file to include the Azure authentication:

```javascript
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const app = express();

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Import Azure routes
require('./config/entra-id/azure-routes')(app);

// Your existing routes...

app.listen(process.env.PORT || 3000);
```

## Step 4: Test the Integration

1. Update all configuration values with your actual Azure credentials
2. Restart your SSO service: `docker-compose up -d`
3. Navigate to the login page: `http://localhost:3010/login`
4. Click on the "Microsoft Account" button
5. You should be redirected to the Microsoft login page
6. After successful authentication, you should be redirected back to your application

## Troubleshooting

- Check the logs for any errors: `docker-compose logs login-consent-app`
- Ensure your redirect URI matches exactly what's registered in Azure
- Verify that the client ID, client secret, and tenant ID are correct
- Ensure the user has the necessary permissions in Azure AD 