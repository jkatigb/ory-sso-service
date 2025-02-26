# Node.js SSO Test Client

This is a simple Node.js application that demonstrates how to integrate with our SSO service using OpenID Connect.

## Features

- Authentication using Authorization Code Flow
- User profile display
- Session management
- Logout functionality

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- A registered OAuth2 client in the SSO Admin Portal

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file from the example:
   ```
   cp .env.example .env
   ```

3. Edit the `.env` file and add your client credentials:
   ```
   CLIENT_ID=your-client-id-here
   CLIENT_SECRET=your-client-secret-here
   ```

## Registering a Client

Before running this application, you need to register it as a client in the SSO Admin Portal:

1. Log in to the Admin Portal at http://localhost:3001
2. Go to "OAuth2 Clients" and click "New Client"
3. Fill in the details:
   - **Name**: Node.js Test Client
   - **Redirect URIs**: http://localhost:8080/callback
   - **Grant Types**: authorization_code, refresh_token
   - **Response Types**: code
   - **Token Endpoint Auth Method**: client_secret_basic
   - **Scopes**: openid profile email
   - **Post Logout Redirect URIs**: http://localhost:8080
4. Save the client and note the client ID and secret for your `.env` file

## Running the Application

Start the application:

```
npm start
```

The application will be available at http://localhost:8080.

## How It Works

This application uses [openid-client](https://github.com/panva/node-openid-client) to implement the OpenID Connect flow:

1. When a user clicks "Login", they are redirected to the SSO service's authorization endpoint.
2. After successful authentication, the user is redirected back to the application with an authorization code.
3. The application exchanges this code for tokens (access token, ID token, and refresh token).
4. The application uses the access token to fetch user information from the UserInfo endpoint.
5. User information is displayed on the profile page.
6. Upon logout, the user's session is cleared both locally and at the SSO service.

## Key Files

- `app.js` - Main application file with OpenID Connect configuration
- `views/index.ejs` - Home page template
- `views/profile.ejs` - User profile page template

## Customization

You can customize this application by:

- Adding additional scopes to request more user information
- Implementing token refresh logic
- Adding additional protected routes
- Enhancing the UI

## Troubleshooting

Common issues:

- **Invalid Redirect URI**: Ensure the redirect URI in your application exactly matches what's registered in the SSO Admin Portal
- **Invalid Client**: Double-check your client ID and secret
- **Scope Not Granted**: Make sure the requested scopes are enabled for your client
- **CORS Issues**: Check CORS settings in the SSO configuration