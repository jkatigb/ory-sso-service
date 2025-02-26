# SSO-as-a-Service using Ory Hydra

This repository contains a multi-tenant SSO (Single Sign-On) service implementation using Ory Hydra, an OAuth 2.0 and OpenID Connect provider. The architecture allows you to offer SSO capabilities to multiple organizations (tenants) while maintaining isolation between them.

## Architecture

The system consists of these main components:

1. **Ory Hydra**: Core OAuth2/OIDC server that issues tokens
2. **Login & Consent App**: Handles user authentication and obtains consent
3. **Admin Portal**: Multi-tenant dashboard for managing clients, users, and tenant settings
4. **PostgreSQL Database**: Stores configuration, users, and OAuth2 clients

## Features

- **Multi-tenancy**: Support for multiple organizations with isolated user directories
- **White-labeled login**: Customizable branding for each tenant
- **Self-service management**: Tenant admins can manage their own applications
- **Standards-based**: Built on OAuth2 and OpenID Connect protocols
- **Scalable**: Designed to handle multiple tenants and applications

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

### Running the Service

```bash
# Clone the repository
git clone https://github.com/jkatigb/ory-sso-service.git
cd ory-sso-service

# Start the services
docker-compose up

# To run in background
docker-compose up -d
```

### Initial Credentials

The system is initialized with default accounts for testing:

1. **Super Admin**:
   - Email: admin@example.com
   - Password: changeme123
   - Access: Full system access

2. **Tenant Admin** (for the default tenant):
   - Email: tenant-admin@example.com
   - Password: tenant123
   - Access: Management of the default tenant only

**⚠️ Important**: Change these passwords immediately after your first login!

## Service URLs

- **Hydra Public API**: http://localhost:4444
- **Hydra Admin API**: http://localhost:4445
- **Login & Consent App**: http://localhost:3000
- **Admin Portal**: http://localhost:3001

## Using the SSO Service

### Admin Portal

1. **Login** to the Admin Portal at http://localhost:3001
2. **Create or Manage Tenants** (Super Admin only)
3. **Register OAuth2 Clients** for your applications
4. **Configure Branding** for the login experience

### Registering an Application

1. In the Admin Portal, go to "OAuth2 Clients"
2. Click "New Client"
3. Fill in the details:
   - Name: Application name
   - Redirect URIs: Where to send users after login
   - Grant Types: Authorization code flow recommended
   - Scopes: Required scopes (e.g., openid, profile, email)
4. Save the client ID and secret securely

### Integrating with Your Application

Here's a basic example of how to integrate with the SSO service using the authorization code flow:

```javascript
// Example using Node.js and Express
const express = require('express');
const { auth } = require('express-openid-connect');

const app = express();

const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: 'http://localhost:3000',
  clientID: 'YOUR_CLIENT_ID',
  issuerBaseURL: 'http://localhost:4444',
  secret: 'YOUR_RANDOM_SECRET'
};

// Auth router setup with express-openid-connect
app.use(auth(config));

// Define a route that requires authentication
app.get('/profile', (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.listen(3000, () => {
  console.log('App is listening on port 3000');
});
```

## Development

Each component is contained in the `services` directory:

- `services/login-consent-app`: The Login & Consent application
- `services/admin-portal`: The Admin Portal for managing tenants

### Local Development

```bash
# For Login & Consent App
cd services/login-consent-app
npm install
npm run dev

# For Admin Portal
cd services/admin-portal
npm install
npm run dev
```

## Customization and Extension

### Adding Custom Identity Providers

You can extend the Login & Consent App to support additional identity providers:

1. Add the authentication strategy to the Login & Consent App
2. Implement the login flow for the new provider
3. Update the tenant configuration to support the new provider

### Custom Claims and Scopes

To add custom claims to the tokens:

1. Modify the Login & Consent App routes to include additional claims
2. Update the token issuance in the consent handler

## Security Considerations

For production use:

1. **Change all secrets** in config files
2. **Use proper TLS certificates**
3. **Configure proper domain names** instead of localhost
4. **Follow OAuth2 security best practices**:
   - Keep client secrets secure
   - Use PKCE for public clients
   - Set proper token lifetimes

## License

MIT