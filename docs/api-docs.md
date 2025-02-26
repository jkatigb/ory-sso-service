# Ory SSO API Documentation

This document provides detailed information about the API endpoints available in the Ory SSO platform.

## Table of Contents

1. [Authentication](#authentication)
2. [Admin Portal API](#admin-portal-api)
   - [Tenants](#tenants)
   - [Users](#users)
   - [Authentication](#admin-authentication)
   - [OAuth2 Clients](#oauth2-clients)
   - [Branding](#branding)
3. [Login/Consent API](#loginconsent-api)
   - [Authentication](#user-authentication)
   - [User Management](#user-management)
   - [Consent](#consent)
4. [Hydra OAuth2 API](#hydra-oauth2-api)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

## Authentication

The Admin Portal API uses JWT tokens for authentication. To obtain a token, you must authenticate with the `/api/auth/login` endpoint.

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Password123!"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "ba35baf0-a1ec-45ea-9edd-041e1d4ad47d",
    "email": "admin@example.com",
    "name": "Super Admin",
    "role": "super_admin"
  }
}
```

Use the token in subsequent requests by including it in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Admin Portal API

The Admin Portal API is accessible at `http://localhost:3001`.

### Tenants

#### List Tenants

```
GET /api/tenants
Authorization: Bearer {token}
```

Response:

```json
{
  "tenants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Inc.",
      "displayName": "Acme",
      "domain": "acme.com",
      "status": "active",
      "createdAt": "2023-07-14T12:00:00Z",
      "updatedAt": "2023-07-14T12:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10
}
```

#### Get Tenant

```
GET /api/tenants/{tenantId}
Authorization: Bearer {token}
```

Response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Acme Inc.",
  "displayName": "Acme",
  "domain": "acme.com",
  "subdomain": "sso.acme.com",
  "status": "active",
  "createdAt": "2023-07-14T12:00:00Z",
  "updatedAt": "2023-07-14T12:00:00Z",
  "branding": {
    "primaryColor": "#1A73E8",
    "secondaryColor": "#34A853",
    "logoUrl": "https://acme.com/logo.png"
  }
}
```

#### Create Tenant

```
POST /api/tenants
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Acme Inc.",
  "displayName": "Acme",
  "domain": "acme.com",
  "subdomain": "sso.acme.com",
  "status": "active"
}
```

Response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Acme Inc.",
  "displayName": "Acme",
  "domain": "acme.com",
  "subdomain": "sso.acme.com",
  "status": "active",
  "createdAt": "2023-07-14T12:00:00Z",
  "updatedAt": "2023-07-14T12:00:00Z"
}
```

#### Update Tenant

```
PUT /api/tenants/{tenantId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Acme Corporation",
  "displayName": "Acme",
  "status": "active"
}
```

Response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Acme Corporation",
  "displayName": "Acme",
  "domain": "acme.com",
  "subdomain": "sso.acme.com",
  "status": "active",
  "createdAt": "2023-07-14T12:00:00Z",
  "updatedAt": "2023-07-15T10:30:00Z"
}
```

#### Delete Tenant

```
DELETE /api/tenants/{tenantId}
Authorization: Bearer {token}
```

Response:

```json
{
  "message": "Tenant deleted successfully"
}
```

### Users

#### List Tenant Users

```
GET /api/tenants/{tenantId}/users
Authorization: Bearer {token}
```

Response:

```json
{
  "users": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "email": "john.doe@acme.com",
      "name": "John Doe",
      "status": "active",
      "createdAt": "2023-07-14T12:00:00Z",
      "updatedAt": "2023-07-14T12:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10
}
```

#### Get User

```
GET /api/tenants/{tenantId}/users/{userId}
Authorization: Bearer {token}
```

Response:

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "john.doe@acme.com",
  "name": "John Doe",
  "status": "active",
  "createdAt": "2023-07-14T12:00:00Z",
  "updatedAt": "2023-07-14T12:00:00Z",
  "roles": ["user", "admin"],
  "metadata": {
    "department": "Engineering",
    "title": "Software Engineer"
  }
}
```

#### Create User

```
POST /api/tenants/{tenantId}/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "jane.doe@acme.com",
  "name": "Jane Doe",
  "password": "SecurePassword123!",
  "roles": ["user"],
  "metadata": {
    "department": "Marketing",
    "title": "Marketing Manager"
  }
}
```

Response:

```json
{
  "id": "c2be53c5-5f8d-4037-8759-e9aaa79f7c07",
  "email": "jane.doe@acme.com",
  "name": "Jane Doe",
  "status": "active",
  "createdAt": "2023-07-15T14:30:00Z",
  "updatedAt": "2023-07-15T14:30:00Z",
  "roles": ["user"],
  "metadata": {
    "department": "Marketing",
    "title": "Marketing Manager"
  }
}
```

#### Update User

```
PUT /api/tenants/{tenantId}/users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Smith",
  "status": "active",
  "roles": ["user", "admin"],
  "metadata": {
    "department": "Marketing",
    "title": "Marketing Director"
  }
}
```

Response:

```json
{
  "id": "c2be53c5-5f8d-4037-8759-e9aaa79f7c07",
  "email": "jane.doe@acme.com",
  "name": "Jane Smith",
  "status": "active",
  "createdAt": "2023-07-15T14:30:00Z",
  "updatedAt": "2023-07-16T09:15:00Z",
  "roles": ["user", "admin"],
  "metadata": {
    "department": "Marketing",
    "title": "Marketing Director"
  }
}
```

#### Delete User

```
DELETE /api/tenants/{tenantId}/users/{userId}
Authorization: Bearer {token}
```

Response:

```json
{
  "message": "User deleted successfully"
}
```

### Admin Authentication

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Password123!"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "ba35baf0-a1ec-45ea-9edd-041e1d4ad47d",
    "email": "admin@example.com",
    "name": "Super Admin",
    "role": "super_admin"
  }
}
```

#### Get Current Admin

```
GET /api/auth/me
Authorization: Bearer {token}
```

Response:

```json
{
  "id": "ba35baf0-a1ec-45ea-9edd-041e1d4ad47d",
  "email": "admin@example.com",
  "name": "Super Admin",
  "role": "super_admin",
  "createdAt": "2023-07-01T00:00:00Z",
  "updatedAt": "2023-07-14T12:00:00Z",
  "lastLogin": "2023-07-14T12:00:00Z"
}
```

#### Logout

```
POST /api/auth/logout
Authorization: Bearer {token}
```

Response:

```json
{
  "message": "Logged out successfully"
}
```

### OAuth2 Clients

#### List OAuth2 Clients

```
GET /api/tenants/{tenantId}/oauth2/clients
Authorization: Bearer {token}
```

Response:

```json
{
  "clients": [
    {
      "id": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
      "name": "Acme Portal",
      "client_id": "acme-portal",
      "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
      "redirect_uris": ["https://app.acme.com/callback"],
      "grant_types": ["authorization_code", "refresh_token"],
      "response_types": ["code"],
      "token_endpoint_auth_method": "client_secret_post",
      "created_at": "2023-07-14T12:00:00Z",
      "updated_at": "2023-07-14T12:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10
}
```

#### Get OAuth2 Client

```
GET /api/tenants/{tenantId}/oauth2/clients/{clientId}
Authorization: Bearer {token}
```

Response:

```json
{
  "id": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
  "name": "Acme Portal",
  "client_id": "acme-portal",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
  "redirect_uris": ["https://app.acme.com/callback"],
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "client_secret_post",
  "scope": "openid profile email",
  "audience": [],
  "created_at": "2023-07-14T12:00:00Z",
  "updated_at": "2023-07-14T12:00:00Z"
}
```

#### Create OAuth2 Client

```
POST /api/tenants/{tenantId}/oauth2/clients
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Acme Mobile App",
  "redirect_uris": ["com.acme.app://callback"],
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "client_secret_post",
  "scope": "openid profile email"
}
```

Response:

```json
{
  "id": "b2c3d4e5-f6a7-8901-b2c3-d4e5f6a78901",
  "name": "Acme Mobile App",
  "client_id": "acme-mobile",
  "client_secret": "73cr37-cl13n7-53cr37",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
  "redirect_uris": ["com.acme.app://callback"],
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "client_secret_post",
  "scope": "openid profile email",
  "audience": [],
  "created_at": "2023-07-15T14:30:00Z",
  "updated_at": "2023-07-15T14:30:00Z"
}
```

#### Update OAuth2 Client

```
PUT /api/tenants/{tenantId}/oauth2/clients/{clientId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Acme Mobile App v2",
  "redirect_uris": ["com.acme.app://callback", "com.acme.app://login-callback"],
  "scope": "openid profile email offline_access"
}
```

Response:

```json
{
  "id": "b2c3d4e5-f6a7-8901-b2c3-d4e5f6a78901",
  "name": "Acme Mobile App v2",
  "client_id": "acme-mobile",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
  "redirect_uris": ["com.acme.app://callback", "com.acme.app://login-callback"],
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "client_secret_post",
  "scope": "openid profile email offline_access",
  "audience": [],
  "created_at": "2023-07-15T14:30:00Z",
  "updated_at": "2023-07-16T09:15:00Z"
}
```

#### Delete OAuth2 Client

```
DELETE /api/tenants/{tenantId}/oauth2/clients/{clientId}
Authorization: Bearer {token}
```

Response:

```json
{
  "message": "OAuth2 client deleted successfully"
}
```

### Branding

#### Get Tenant Branding

```
GET /api/tenants/{tenantId}/branding
Authorization: Bearer {token}
```

Response:

```json
{
  "id": "d4e5f6a7-8901-b2c3-d4e5-f6a7890123ab",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
  "logo_url": "https://acme.com/logo.png",
  "favicon_url": "https://acme.com/favicon.ico",
  "primary_color": "#1A73E8",
  "secondary_color": "#34A853",
  "background_color": "#FFFFFF",
  "text_color": "#202124",
  "created_at": "2023-07-14T12:00:00Z",
  "updated_at": "2023-07-14T12:00:00Z"
}
```

#### Update Tenant Branding

```
PUT /api/tenants/{tenantId}/branding
Authorization: Bearer {token}
Content-Type: application/json

{
  "logo_url": "https://acme.com/new-logo.png",
  "primary_color": "#4285F4",
  "secondary_color": "#34A853"
}
```

Response:

```json
{
  "id": "d4e5f6a7-8901-b2c3-d4e5-f6a7890123ab",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
  "logo_url": "https://acme.com/new-logo.png",
  "favicon_url": "https://acme.com/favicon.ico",
  "primary_color": "#4285F4",
  "secondary_color": "#34A853",
  "background_color": "#FFFFFF",
  "text_color": "#202124",
  "created_at": "2023-07-14T12:00:00Z",
  "updated_at": "2023-07-16T09:15:00Z"
}
```

## Login/Consent API

The Login/Consent API is accessible at `http://localhost:3000`.

### User Authentication

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@acme.com",
  "password": "SecurePassword123!",
  "tenant": "acme.com"
}
```

Response:

```json
{
  "success": true,
  "redirect_to": "http://localhost:4444/oauth2/auth?client_id=acme-portal&response_type=code&state=xyz&consent=true"
}
```

#### Register

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "new.user@acme.com",
  "password": "SecurePassword123!",
  "name": "New User",
  "tenant": "acme.com"
}
```

Response:

```json
{
  "success": true,
  "user": {
    "id": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
    "email": "new.user@acme.com",
    "name": "New User",
    "tenant": "acme.com",
    "created_at": "2023-07-15T14:30:00Z"
  }
}
```

#### Reset Password Request

```
POST /api/auth/reset-password-request
Content-Type: application/json

{
  "email": "user@acme.com",
  "tenant": "acme.com"
}
```

Response:

```json
{
  "success": true,
  "message": "Password reset email sent if the account exists"
}
```

#### Reset Password

```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NewSecurePassword123!"
}
```

Response:

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### User Management

#### Get Current User

```
GET /api/users/me
Authorization: Bearer {token}
```

Response:

```json
{
  "id": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
  "email": "user@acme.com",
  "name": "User Name",
  "tenant": "acme.com",
  "created_at": "2023-07-14T12:00:00Z",
  "updated_at": "2023-07-14T12:00:00Z",
  "metadata": {
    "department": "Engineering",
    "title": "Software Engineer"
  }
}
```

#### Update Current User

```
PUT /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "metadata": {
    "department": "Engineering",
    "title": "Senior Software Engineer"
  }
}
```

Response:

```json
{
  "id": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
  "email": "user@acme.com",
  "name": "Updated Name",
  "tenant": "acme.com",
  "created_at": "2023-07-14T12:00:00Z",
  "updated_at": "2023-07-16T09:15:00Z",
  "metadata": {
    "department": "Engineering",
    "title": "Senior Software Engineer"
  }
}
```

#### Change Password

```
PUT /api/users/me/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "current_password": "CurrentPassword123!",
  "new_password": "NewPassword123!"
}
```

Response:

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Consent

#### Get Consent Request

```
GET /api/consent?consent_challenge={challenge}
```

Response:

```json
{
  "challenge": "a1b2c3d4e5f6",
  "client": {
    "client_id": "acme-portal",
    "client_name": "Acme Portal"
  },
  "requested_scope": ["openid", "profile", "email"],
  "requested_audience": [],
  "subject": "user-id",
  "tenant": "acme.com"
}
```

#### Accept Consent

```
PUT /api/consent/{challenge}/accept
Content-Type: application/json

{
  "grant_scope": ["openid", "profile", "email"],
  "grant_audience": [],
  "remember": true,
  "remember_for": 3600
}
```

Response:

```json
{
  "redirect_to": "http://localhost:4444/oauth2/auth?client_id=acme-portal&response_type=code&state=xyz&code=a1b2c3d4e5"
}
```

#### Reject Consent

```
PUT /api/consent/{challenge}/reject
Content-Type: application/json

{
  "error": "access_denied",
  "error_description": "User denied access"
}
```

Response:

```json
{
  "redirect_to": "https://app.acme.com/callback?error=access_denied&error_description=User+denied+access"
}
```

## Hydra OAuth2 API

For detailed documentation of the Hydra OAuth2 API, please refer to the [official Ory Hydra documentation](https://www.ory.sh/docs/hydra/reference/api).

The Hydra OAuth2 server exposes two main sets of endpoints:

- Public endpoints (port 4444): Used by clients for OAuth2/OIDC flows
- Admin endpoints (port 4445): Used by the login/consent app to accept/reject login and consent requests

Common public endpoints include:

- `/oauth2/auth`: Authorization endpoint
- `/oauth2/token`: Token endpoint
- `/oauth2/userinfo`: UserInfo endpoint
- `/oauth2/revoke`: Token revocation endpoint
- `/.well-known/openid-configuration`: OpenID Connect discovery document

## Error Handling

All API endpoints return standard HTTP status codes:

- 200 OK: Request succeeded
- 201 Created: Resource created successfully
- 400 Bad Request: Invalid request parameters
- 401 Unauthorized: Missing or invalid authentication
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 409 Conflict: Resource conflict (e.g., duplicate email)
- 422 Unprocessable Entity: Validation error
- 500 Internal Server Error: Server error

Error responses follow this format:

```json
{
  "error": "error_code",
  "error_description": "Human-readable error description",
  "details": {
    "field": "Additional error details"
  }
}
```

## Rate Limiting

API endpoints are rate-limited to protect against abuse. The rate limits are:

- Admin Portal API: 100 requests per minute per IP
- Login/Consent API: 20 requests per minute per IP for login/register, 60 for other endpoints

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 60
```

When rate limits are exceeded, a 429 Too Many Requests response is returned:

```json
{
  "error": "rate_limit_exceeded",
  "error_description": "Rate limit exceeded, please try again in 30 seconds",
  "retry_after": 30
} 