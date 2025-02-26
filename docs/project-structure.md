# Ory SSO Project Structure

This document provides an overview of the project structure and organization of the Ory SSO platform.

## Directory Structure

```
ory-sso/
├── docker-compose.yml           # Docker Compose configuration
├── README.md                    # Project README
├── docs/                        # Documentation
│   ├── api-docs.md              # API documentation
│   ├── business-customer-onboarding.md  # Onboarding guide
│   ├── integration-guide.md     # Integration guide
│   ├── project-structure.md     # This file
│   └── images/                  # Documentation images
│       └── architecture-diagram.png
├── services/                    # Service components
│   ├── admin-portal/            # Admin Portal service
│   │   ├── Dockerfile           # Docker configuration
│   │   ├── package.json         # Node.js dependencies
│   │   ├── .env                 # Environment variables
│   │   ├── .env.example         # Example environment variables
│   │   ├── src/                 # Source code
│   │   │   ├── index.js         # Entry point
│   │   │   ├── config/          # Configuration
│   │   │   ├── models/          # Database models
│   │   │   │   ├── index.js     # Model exports
│   │   │   │   ├── tenant.js    # Tenant model
│   │   │   │   ├── user.js      # User model
│   │   │   │   └── branding.js  # Branding model
│   │   │   ├── routes/          # API routes
│   │   │   │   ├── auth.js      # Authentication routes
│   │   │   │   ├── dashboard.js # Dashboard routes
│   │   │   │   ├── tenants.js   # Tenant management routes
│   │   │   │   └── users.js     # User management routes
│   │   │   ├── middlewares/     # Express middlewares
│   │   │   │   ├── auth.js      # Authentication middleware
│   │   │   │   └── errorHandler.js # Error handling middleware
│   │   │   ├── services/        # Business logic services
│   │   │   │   ├── auth.js      # Authentication service
│   │   │   │   ├── tenant.js    # Tenant service
│   │   │   │   └── hydra.js     # Hydra integration service
│   │   │   ├── utils/           # Utility functions
│   │   │   └── scripts/         # Utility scripts
│   │   │       ├── create-admin.js    # Create admin user
│   │   │       ├── reset-password.js  # Reset admin password
│   │   │       ├── create-tenant.js   # Create tenant
│   │   │       └── bulk-import-tenants.js # Bulk import tenants
│   │   └── client/              # React frontend
│   │       ├── package.json     # Frontend dependencies
│   │       ├── public/          # Static assets
│   │       └── src/             # Frontend source code
│   │           ├── App.js       # Main application component
│   │           ├── index.js     # Entry point
│   │           ├── components/  # React components
│   │           ├── pages/       # Page components
│   │           ├── services/    # API services
│   │           └── utils/       # Utility functions
│   ├── login-app/               # Login/Consent App service
│   │   ├── Dockerfile           # Docker configuration
│   │   ├── package.json         # Node.js dependencies
│   │   ├── .env                 # Environment variables
│   │   ├── .env.example         # Example environment variables
│   │   ├── src/                 # Source code
│   │   │   ├── index.js         # Entry point
│   │   │   ├── config/          # Configuration
│   │   │   ├── models/          # Database models
│   │   │   ├── routes/          # API routes
│   │   │   │   ├── auth.js      # Authentication routes
│   │   │   │   ├── login.js     # Login routes
│   │   │   │   └── consent.js   # Consent routes
│   │   │   ├── services/        # Business logic services
│   │   │   │   ├── auth.js      # Authentication service
│   │   │   │   ├── hydra.js     # Hydra integration service
│   │   │   │   └── user.js      # User service
│   │   │   └── utils/           # Utility functions
│   │   └── client/              # React frontend
│   │       ├── package.json     # Frontend dependencies
│   │       ├── public/          # Static assets
│   │       └── src/             # Frontend source code
│   │           ├── App.js       # Main application component
│   │           ├── index.js     # Entry point
│   │           ├── components/  # React components
│   │           ├── pages/       # Page components
│   │           │   ├── Login.js # Login page
│   │           │   ├── Consent.js # Consent page
│   │           │   └── Register.js # Registration page
│   │           ├── services/    # API services
│   │           └── utils/       # Utility functions
│   └── hydra/                   # Hydra service configuration
│       └── config/              # Hydra configuration files
└── scripts/                     # Project-level scripts
    ├── setup.sh                 # Setup script
    └── reset-db.sh              # Database reset script
```

## Key Components

### Admin Portal

The Admin Portal consists of a Node.js backend and a React frontend:

- **Backend (services/admin-portal/src)**: Provides APIs for managing tenants, users, and OAuth2 clients
- **Frontend (services/admin-portal/client)**: User interface for administrators to manage the system

### Login/Consent App

The Login/Consent App handles authentication and consent flows:

- **Backend (services/login-app/src)**: Implements login, registration, and consent flows
- **Frontend (services/login-app/client)**: User-facing UI for login, registration, and consent

### Hydra

Ory Hydra is an OAuth2 and OpenID Connect provider:

- **Configuration (services/hydra/config)**: Configuration files for Hydra

## Database Models

### Admin Portal Models

- **Tenant**: Represents a business customer with isolated authentication domain
- **TenantAdmin**: Admin users with permissions to manage a specific tenant
- **Branding**: Tenant-specific branding settings (logo, colors, etc.)
- **OAuth2Client**: OAuth2 client application registration

### Login/Consent App Models

- **User**: End users belonging to a specific tenant
- **Session**: User sessions
- **Consent**: User consent records

## Development Workflow

1. Clone the repository
2. Set up environment variables (copy `.env.example` to `.env` in each service)
3. Start the services with Docker Compose
4. Access the Admin Portal at http://localhost:3011
5. Access the Login App at http://localhost:3010

## API Structure

### Admin Portal API

- `/api/auth/*`: Admin authentication routes
- `/api/tenants/*`: Tenant management routes
- `/api/tenants/:tenantId/users/*`: User management routes
- `/api/tenants/:tenantId/oauth2/clients/*`: OAuth2 client management routes

### Login/Consent API

- `/api/auth/*`: End-user authentication routes
- `/api/login/*`: Login flow routes
- `/api/consent/*`: Consent flow routes

## Environment Variables

Key environment variables used throughout the project:

- **Database Configuration**
  - `DATABASE_URL`: PostgreSQL connection string
  - `POSTGRES_USER`: Database username
  - `POSTGRES_PASSWORD`: Database password
  - `POSTGRES_DB`: Database name

- **Admin Portal Configuration**
  - `ADMIN_PORT`: Backend port (default: 3001)
  - `ADMIN_FRONTEND_PORT`: Frontend port (default: 3011)
  - `JWT_SECRET`: Secret for JWT tokens
  - `DEFAULT_ADMIN_EMAIL`: Default superadmin email
  - `DEFAULT_ADMIN_PASSWORD`: Default superadmin password

- **Login App Configuration**
  - `LOGIN_APP_PORT`: Backend port (default: 3000)
  - `LOGIN_APP_FRONTEND_PORT`: Frontend port (default: 3010)
  - `HYDRA_ADMIN_URL`: URL for Hydra admin API

- **Hydra Configuration**
  - `HYDRA_PUBLIC_PORT`: Public port (default: 4444)
  - `HYDRA_ADMIN_PORT`: Admin port (default: 4445)
  - `URLS_SELF_ISSUER`: Issuer URL
  - `URLS_LOGIN`: Login endpoint
  - `URLS_CONSENT`: Consent endpoint 