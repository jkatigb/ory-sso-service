# SSO-as-a-Service using Ory Hydra

This repository contains an implementation of a multi-tenant Single Sign-On (SSO) service built with Ory Hydra, an OAuth 2.0 and OpenID Connect provider. The architecture allows organizations (tenants) to offer SSO capabilities to their applications while maintaining isolation between tenants.

## Architecture

The system consists of the following components:

1. **Ory Hydra**: Core OAuth2/OIDC server that issues tokens
2. **Login & Consent App**: Handles user authentication and obtaining consent
3. **Admin Portal**: Multi-tenant dashboard for managing clients, users, and tenant settings
4. **PostgreSQL Database**: Stores configuration, users, and OAuth2 clients

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

### Running the Service

```bash
# Clone the repository
git clone https://github.com/yourusername/ory-sso-service.git
cd ory-sso-service

# Start the services
docker-compose up
```

The following services will be available:

- Hydra Public API: http://localhost:4444
- Hydra Admin API: http://localhost:4445
- Login & Consent App: http://localhost:3000
- Admin Portal: http://localhost:3001

## Configuration

Configuration files are stored in the `config` directory. Modify these files to suit your deployment requirements.

## Development

Each component is contained in the `services` directory:

- `services/login-consent-app`: The Login & Consent application
- `services/admin-portal`: The Admin Portal for managing tenants

## Security Considerations

For production use:

1. Change all secrets in config files
2. Use proper TLS certificates
3. Configure proper domain names instead of localhost
4. Implement proper user management

## License

MIT
