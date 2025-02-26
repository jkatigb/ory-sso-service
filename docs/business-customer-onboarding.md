# Business Customer Onboarding Guide

This guide provides step-by-step instructions for onboarding business customers to our multi-tenant SSO platform.

## Table of Contents

1. [Overview](#overview)
2. [Information Required from Customers](#information-required-from-customers)
3. [Onboarding Process](#onboarding-process)
4. [Manual Onboarding Steps](#manual-onboarding-steps)
5. [Automated Onboarding](#automated-onboarding)
6. [Post-Onboarding Tasks](#post-onboarding-tasks)
7. [Customer Integration Assistance](#customer-integration-assistance)

## Overview

Our SSO platform allows you to manage authentication for multiple business customers (tenants) with customized branding and configurations. Each tenant has isolated user management while sharing the same underlying infrastructure.

## Information Required from Customers

Before onboarding a business customer, collect the following information:

| Information | Description | Example |
|-------------|-------------|---------|
| Organization Name | Legal name of the organization | Acme Inc. |
| Display Name | Name to display in the UI | Acme |
| Primary Domain | Main domain for the organization | acme.com |
| Subdomain (optional) | Subdomain for SSO portal | sso.acme.com |
| Admin Contact | Primary contact for SSO administration | admin@acme.com |
| Admin Name | Name of the primary admin | John Doe |
| Admin Initial Password | Temporary password for admin | (Secure generated password) |
| Logo URL | URL to the organization's logo | https://acme.com/logo.png |
| Brand Colors | Primary and secondary colors | #1A73E8, #34A853 |
| Redirect URIs | Authorized redirect URIs | https://app.acme.com/callback |
| Logout URLs | Post-logout redirect URLs | https://app.acme.com/logout |
| Custom Requirements | Any special requirements | Custom fields, MFA policies |

Create a template form that can be sent to customers to fill out these details.

## Onboarding Process

The onboarding process involves several steps:

1. Collect required information from the customer
2. Create tenant record in the database
3. Configure branding for the tenant
4. Create tenant admin account
5. Configure OAuth2 settings
6. Test the configuration
7. Provide credentials to the customer

## Manual Onboarding Steps

### Step 1: Create Tenant Record

Access the Admin Portal at http://localhost:3011 and log in with superadmin credentials:
- Email: admin@example.com
- Password: Password123!

Navigate to "Tenants" and click "Add New Tenant".

Fill in the following details:
- Name: [Organization Name]
- Display Name: [Display Name]
- Domain: [Primary Domain]
- Status: Active

### Step 2: Configure Branding

Navigate to the tenant's detail page and click "Configure Branding".

Upload the customer's logo and set the primary and secondary colors.

### Step 3: Create Tenant Admin

Navigate to the tenant's detail page and click "Manage Admins".

Click "Add Admin" and fill in the following details:
- Email: [Admin Contact]
- Name: [Admin Name]
- Password: [Admin Initial Password]
- Role: Tenant Admin

### Step 4: Configure OAuth2 Settings

Navigate to the tenant's detail page and click "OAuth2 Configuration".

Click "Add Client" and fill in the following details:
- Client Name: [Application Name]
- Redirect URIs: [Redirect URIs]
- Logout URLs: [Logout URLs]
- Grant Types: Authorization Code, Refresh Token
- Token Endpoint Auth Method: Client Secret Post

Note the generated client ID and client secret, which will be shared with the customer.

### Step 5: Activate Tenant

Ensure the tenant's status is set to "Active" in the tenant details page.

## Automated Onboarding

For bulk onboarding or automation, use our onboarding script:

```bash
docker-compose exec admin-portal node src/scripts/create-tenant.js \
  --name "Acme Inc." \
  --domain "acme.com" \
  --adminEmail "admin@acme.com" \
  --adminName "John Doe" \
  --adminPassword "SecurePassword123!" \
  --primaryColor "#1A73E8" \
  --logoUrl "https://acme.com/logo.png"
```

For bulk import from a JSON file:

```bash
docker-compose exec admin-portal node src/scripts/bulk-import-tenants.js --file /path/to/tenants.json
```

Example JSON format:

```json
{
  "tenants": [
    {
      "name": "Acme Inc.",
      "displayName": "Acme",
      "domain": "acme.com",
      "subdomain": "sso.acme.com",
      "status": "active",
      "branding": {
        "primaryColor": "#1A73E8",
        "secondaryColor": "#34A853",
        "logoUrl": "https://acme.com/logo.png"
      },
      "admin": {
        "email": "admin@acme.com",
        "name": "John Doe",
        "password": "SecurePassword123!"
      },
      "oauth2": {
        "clients": [
          {
            "name": "Acme Portal",
            "redirectUris": ["https://app.acme.com/callback"],
            "logoutUrls": ["https://app.acme.com/logout"],
            "grantTypes": ["authorization_code", "refresh_token"]
          }
        ]
      }
    }
    // More tenants...
  ]
}
```

## Post-Onboarding Tasks

After onboarding a tenant, complete the following tasks:

### Step 1: Test Login Flow

1. Navigate to the tenant's login page (typically at http://localhost:3010?tenant=[domain])
2. Attempt to log in with the tenant admin credentials
3. Verify that branding elements are displayed correctly
4. Verify that you can successfully authenticate

### Step 2: Test OAuth2 Flow

1. Set up a test client application using the OAuth2 client credentials
2. Initiate an authorization code flow
3. Verify that the login screen shows the tenant's branding
4. Complete the login process and verify that tokens are issued correctly
5. Test token refresh functionality

### Step 3: Provide Documentation to Customer

Provide the following information to the customer:

1. Admin portal URL and credentials
2. OAuth2 client ID and secret
3. Authorization and token endpoint URLs
4. Integration guide (see [Integration Guide](./integration-guide.md))
5. User management documentation

## Customer Integration Assistance

Offer the following assistance to help customers integrate with our SSO platform:

1. **Technical Consultation**: Schedule a call to discuss implementation details
2. **Sample Applications**: Provide sample code for common frameworks
3. **Integration Testing**: Assist with testing the authentication flow
4. **User Migration**: Help with migrating existing users

## Component Reference Table

| Component | Port | Purpose | URL |
|-----------|------|---------|-----|
| Admin Portal Backend | 3001 | Administrative API for managing tenants and users | http://localhost:3001 |
| Admin Portal Frontend | 3011 | UI for administrative functions | http://localhost:3011 |
| Login/Consent App Backend | 3000 | Handles login, consent, and user management | http://localhost:3000 |
| Login/Consent App Frontend | 3010 | UI for login, registration, and user profile | http://localhost:3010 |
| Hydra OAuth2 Server (Public) | 4444 | OAuth2/OIDC public endpoints | http://localhost:4444 |
| Hydra OAuth2 Server (Admin) | 4445 | OAuth2/OIDC administrative endpoints | http://localhost:4445 |
| PostgreSQL Database | 5433 | Storage for user, tenant, and OAuth2 data | - |

## Integration with Existing Applications

For detailed guidance on integrating with existing applications, including Kubernetes deployments, see our [Integration Guide](./integration-guide.md).

## Kubernetes Deployment

For information on deploying our SSO solution in a Kubernetes environment, see the Kubernetes Deployment section in our [Integration Guide](./integration-guide.md#kubernetes-deployment).

## Troubleshooting

### Common Onboarding Issues

#### Tenant Creation Fails
- Check for duplicate domain names
- Ensure all required fields are provided
- Verify database connectivity

#### Admin Creation Fails
- Check for duplicate email addresses
- Ensure password meets complexity requirements

#### OAuth2 Client Registration Fails
- Verify redirect URIs are valid URLs
- Ensure tenant ID exists
- Check for duplicate client names

### Support Contacts

For assistance with onboarding:
- Email: support@ory-sso.example.com
- Internal Wiki: [Customer Onboarding Process](https://wiki.example.com/ory-sso/onboarding) 