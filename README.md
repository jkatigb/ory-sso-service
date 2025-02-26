/*
File: README.md
Path: README.md
Purpose: Documentation for the SSO service project
Last change: Initial creation of project documentation
*/

# Ory SSO: Multi-Tenant Single Sign-On Platform

A flexible, scalable Single Sign-On (SSO) solution built on [Ory Hydra](https://github.com/ory/hydra) with multi-tenancy support for enterprise customer management.

## Overview

This project provides a complete identity management solution for businesses that need to support multiple customers (tenants) with isolated authentication while maintaining centralized control.

### Key Features

- **Multi-Tenant Architecture**: Isolated authentication domains for each customer
- **Customized Branding**: Tenant-specific logos, colors, and UI elements
- **OAuth2/OIDC Compliance**: Industry-standard authentication protocols
- **Administrative Portal**: Centralized management of tenants, users, and configurations
- **Tenant Admin Access**: Delegated administration for tenant-specific user management
- **Containerized Deployment**: Docker-based setup for easy deployment and scaling
- **Kubernetes Support**: Ready for enterprise deployment on Kubernetes

## Components

| Component | Port | Purpose | URL |
|-----------|------|---------|-----|
| Admin Portal Backend | 3001 | Administrative API for managing tenants and users | http://localhost:3001 |
| Admin Portal Frontend | 3011 | UI for administrative functions | http://localhost:3011 |
| Login/Consent App Backend | 3000 | Handles login, consent, and user management | http://localhost:3000 |
| Login/Consent App Frontend | 3010 | UI for login, registration, and user profile | http://localhost:3010 |
| Hydra OAuth2 Server (Public) | 4444 | OAuth2/OIDC public endpoints | http://localhost:4444 |
| Hydra OAuth2 Server (Admin) | 4445 | OAuth2/OIDC administrative endpoints | http://localhost:4445 |
| PostgreSQL Database | 5433 | Storage for user, tenant, and OAuth2 data | - |

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- Git

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/ory-sso.git
   cd ory-sso
   ```

2. Start the services:
   ```bash
   docker-compose up -d
   ```

3. Initialize the database and create default admin user:
   ```bash
   docker-compose exec admin-portal node src/scripts/reset-password.js
   ```

4. Access the Admin Portal at [http://localhost:3011](http://localhost:3011)
   - Email: `admin@example.com`
   - Password: `Password123!`

### Onboarding a Tenant

To onboard a new business customer, use the provided script:

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

For bulk onboarding, use:

```bash
docker-compose exec admin-portal node src/scripts/bulk-import-tenants.js --file /path/to/tenants.json
```

## Documentation

Comprehensive documentation is available in the docs directory:

- [Business Customer Onboarding Guide](docs/business-customer-onboarding.md)
- [Integration Guide](docs/integration-guide.md)
- [API Documentation](docs/api-docs.md)
- [Kubernetes Deployment](docs/integration-guide.md#kubernetes-deployment)

## Architecture

The system consists of the following key components:

1. **Admin Portal**: React-based web application for managing tenants, users, and settings
2. **Login/Consent App**: Customizable authentication UI with tenant-specific branding
3. **Ory Hydra**: OAuth2 and OIDC compliant identity provider
4. **PostgreSQL Database**: Persistent storage for all components

![Architecture Diagram](docs/images/architecture-diagram.png)

## Configuration

### Environment Variables

The system can be configured using environment variables. Create a `.env` file in the project root:

```
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sso_service
DATABASE_URL=postgres://postgres:postgres@postgres:5432/sso_service

# Admin Portal
ADMIN_PORT=3001
ADMIN_FRONTEND_PORT=3011
JWT_SECRET=your-secret-key
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=Password123!

# Login App
LOGIN_APP_PORT=3000
LOGIN_APP_FRONTEND_PORT=3010
HYDRA_ADMIN_URL=http://hydra:4445

# Hydra
HYDRA_PUBLIC_PORT=4444
HYDRA_ADMIN_PORT=4445
URLS_SELF_ISSUER=http://localhost:4444
URLS_LOGIN=http://localhost:3010/login
URLS_CONSENT=http://localhost:3010/consent
URLS_LOGOUT=http://localhost:3010/logout
```

## Development

### Project Structure

```
ory-sso/
├── docker-compose.yml         # Docker setup
├── services/                  # Service components
│   ├── admin-portal/          # Admin portal backend and frontend
│   ├── login-app/             # Login/consent app backend and frontend
│   └── hydra/                 # Ory Hydra configuration
├── docs/                      # Documentation
└── scripts/                   # Utility scripts
```

### Local Development

For local development, you can run individual services:

```bash
# Admin Portal Backend
cd services/admin-portal
npm install
npm run dev

# Admin Portal Frontend
cd services/admin-portal/client
npm install
npm start
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions or issues, please open a GitHub issue or contact support@example.com.