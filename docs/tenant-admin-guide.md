# Tenant Administration Guide

This guide explains how tenant administrators can manage and customize their SSO environment.

## Getting Started

As a tenant administrator, you can access the Admin Portal at http://localhost:3001 with your provided credentials. If you don't have credentials yet, contact your SSO service administrator.

## Dashboard Overview

After logging in, you'll see the main dashboard with:

- Summary of OAuth clients (applications)
- User statistics
- Quick links to management pages

## Managing OAuth Clients

OAuth clients represent applications that can authenticate users through your SSO service.

### Creating a New Client

1. Go to **OAuth2 Clients** in the left navigation
2. Click the **New Client** button
3. Fill in the client details:
   - **Name**: A descriptive name for the application
   - **Redirect URIs**: Where users will be redirected after authentication (comma-separated list)
   - **Post Logout Redirect URIs**: Where users will be redirected after logout (optional)
   - **Token Endpoint Auth Method**: How the client authenticates to the token endpoint
     - `client_secret_basic`: Recommended for most applications
     - `none`: For public clients that can't keep a secret (like SPAs)
   - **Grant Types**: The OAuth 2.0 grant types this client can use
     - `authorization_code`: Recommended for most applications
     - `refresh_token`: Allow the application to refresh expired tokens
   - **Response Types**: The expected response from the authorization endpoint
     - `code`: For the authorization code flow
   - **Scopes**: The permissions this client can request
     - `openid`: Required for OpenID Connect
     - `profile`: Access to user profile information
     - `email`: Access to user email
   - **Audience**: Optional target API audience for the tokens

4. Click **Save**

You'll be shown the client credentials (**Client ID** and **Client Secret**). Make sure to copy and store these securely, as the secret will not be shown again.

### Managing Existing Clients

From the OAuth2 Clients page, you can:

- **View** client details
- **Edit** client configuration
- **Regenerate Secret** if the current one is compromised
- **Delete** clients that are no longer needed

## User Management

### Adding Users

1. Go to **Users** in the left navigation
2. Click **Add User**
3. Fill in the user details:
   - **Username**: Unique username for login
   - **Email**: User's email address
   - **Password**: Initial password
   - **Profile**: Additional information about the user (optional)
4. Click **Create User**

### Managing Users

From the Users page, you can:

- **View** user details
- **Edit** user information
- **Reset Password** for users who need password resets
- **Disable** accounts temporarily
- **Delete** users that no longer need access

## Customizing Branding

One of the key features of this SSO service is the ability to customize the login experience with your organization's branding.

### Branding Settings

1. Go to **Branding** in the left navigation
2. Customize the following elements:
   - **Logo**: Upload your organization's logo (recommended size: 150x60px)
   - **Primary Color**: The main color used for buttons and highlights
   - **Secondary Color**: Used for secondary elements
   - **Background Color**: The page background color
   - **Custom CSS**: Advanced customization for the login page
   - **Custom JavaScript**: Add client-side functionality (use with caution)
3. Click **Save Changes** to apply your customizations

### Preview Your Branding

After saving your branding changes, you can preview how they will appear to users:

1. Click the **Preview** button at the top of the Branding page
2. This will open a new tab showing the login page with your customizations

## Managing Admin Users

As a tenant administrator, you can create additional administrator accounts for your organization.

### Adding Admin Users

1. Go to **Admins** in the left navigation
2. Click **Add Admin**
3. Fill in the admin details:
   - **Name**: The administrator's full name
   - **Email**: Email address (used for login)
   - **Password**: Initial password
   - **Role**: Select from:
     - **Admin**: Full access to manage the tenant
     - **Viewer**: Read-only access to settings and users
4. Click **Create Admin User**

### Managing Admin Access

From the Admins page, you can:

- **Edit** admin user information
- **Change Role** between Admin and Viewer
- **Disable** admin accounts temporarily
- **Delete** admin accounts

## Advanced Settings

### Session Configuration

1. Go to **Settings** in the left navigation
2. Under the **Sessions** tab, you can configure:
   - **Session Lifetime**: How long user sessions remain valid
   - **Remember Me Duration**: How long "Remember Me" sessions last
   - **Single Sign-Out**: Enable/disable single logout across applications

### Security Settings

Under the **Security** tab, you can configure:

- **Password Policy**:
  - Minimum length
  - Character requirements (uppercase, lowercase, numbers, symbols)
  - Password expiration
- **MFA Settings**:
  - Enable/disable multi-factor authentication
  - Required or optional MFA
- **Brute Force Protection**:
  - Failed login attempt limits
  - Account lockout duration

## Monitoring and Logs

### Activity Logs

1. Go to **Logs** in the left navigation
2. View authentication activity including:
   - Login attempts (successful and failed)
   - User management actions
   - Client access and token issuance
   - Admin actions

### Filtering and Exporting Logs

- **Filter** logs by date range, user, action type, or status
- **Export** logs to CSV for compliance or analysis

## Integrating with External Systems

### SMTP Configuration

To enable email notifications (password resets, etc.):

1. Go to **Settings** → **Notifications**
2. Configure the SMTP settings:
   - SMTP Server
   - Port
   - Username/Password
   - From address
   - TLS settings

### Webhook Notifications

Configure webhooks to notify your systems about important events:

1. Go to **Settings** → **Webhooks**
2. Click **Add Webhook**
3. Configure:
   - **Endpoint URL**: Where to send notifications
   - **Events**: Which events trigger notifications (logins, password changes, etc.)
   - **Secret**: For verifying webhook authenticity

## Troubleshooting

### Common Issues

- **Client Authentication Failures**: Check redirect URIs and client secrets
- **User Cannot Log In**: Verify account status and credentials
- **Branding Not Displaying**: Clear browser cache and refresh

### Getting Support

Contact the SSO service administrator if you encounter issues that you cannot resolve through this guide.

## Best Practices

1. **Regularly Review Access**: Audit user accounts and OAuth clients quarterly
2. **Secure Client Secrets**: Store secrets securely and rotate them periodically
3. **Use Descriptive Names**: Give clients and users clear, identifiable names
4. **Test After Changes**: Verify authentication flows after making configuration changes
5. **Backup Configuration**: Export client configurations before making major changes