# Login & Consent App (React Version)

This is a React-based implementation of the Login and Consent App for SSO-as-a-Service. It provides the user interface for authentication and authorization flows in the OAuth2/OpenID Connect system powered by Ory Hydra.

## Features

- Login page for user authentication
- Consent page for OAuth2 authorization
- Logout page for user sign-out
- Error handling and display

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Backend API server running (original login-consent-app)

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```
   cd services/login-consent-app-react
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Development

To start the development server:

```
npm start
```

or

```
yarn start
```

The app will be available at [http://localhost:3001](http://localhost:3001) and will proxy API requests to the backend server running on port 3000.

### Building for Production

To build the app for production:

```
npm run build
```

or

```
yarn build
```

The build artifacts will be stored in the `build/` directory.

## Architecture

- **React**: Frontend library for building user interfaces
- **React Router**: For handling navigation between pages
- **Axios**: For making HTTP requests to the backend API

## API Integration

The app communicates with the backend API to:

1. Fetch login, consent, and logout requests from Ory Hydra
2. Accept or reject these requests
3. Handle redirects to the appropriate URLs

## Deployment

This React app can be deployed alongside the original Express backend, which will serve the API endpoints. The React app should be built and the resulting static files served by a web server.

## License

This project is licensed under the MIT License. 