# Client Integration Guide

This guide will help you integrate your application with the SSO service using OAuth 2.0 and OpenID Connect.

## Prerequisites

- A registered client in the SSO Admin Portal
- Client ID and Client Secret
- Configured Redirect URIs

## Integration Steps

### 1. Choose Your OAuth 2.0 Flow

For most web applications, we recommend using the **Authorization Code Flow** with PKCE. For single-page applications (SPAs), mobile apps, or other public clients, use **Authorization Code Flow with PKCE**. For server-to-server API access, consider using **Client Credentials Flow**.

### 2. Implement the Authorization Code Flow

#### Step 1: Redirect the User to the Authorization Endpoint

```javascript
// Example using JavaScript
function redirectToLogin() {
  // Generate and store a state parameter
  const state = generateRandomString();
  localStorage.setItem('auth_state', state);
  
  // For public clients, also generate and store a code verifier and challenge (PKCE)
  const codeVerifier = generateRandomString(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  localStorage.setItem('code_verifier', codeVerifier);
  
  // Construct the authorization URL
  const authUrl = new URL('http://localhost:4444/oauth2/auth');
  authUrl.searchParams.append('client_id', 'YOUR_CLIENT_ID');
  authUrl.searchParams.append('redirect_uri', 'http://localhost:8080/callback');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'openid profile email');
  authUrl.searchParams.append('state', state);
  
  // Add PKCE parameters for public clients
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('code_challenge_method', 'S256');
  
  // Redirect the user
  window.location.href = authUrl.toString();
}
```

#### Step 2: Handle the Callback

```javascript
// Example handling the callback in JavaScript
async function handleCallback() {
  // Get the authorization code and state from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  
  // Verify the state matches what we stored earlier
  const storedState = localStorage.getItem('auth_state');
  if (state !== storedState) {
    throw new Error('Invalid state parameter');
  }
  
  // Exchange the code for tokens
  const tokenResponse = await fetch('http://localhost:4444/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'http://localhost:8080/callback',
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET', // Only for confidential clients
      code_verifier: localStorage.getItem('code_verifier') // Only for PKCE flow
    })
  });
  
  if (!tokenResponse.ok) {
    throw new Error('Error exchanging code for tokens');
  }
  
  const tokens = await tokenResponse.json();
  
  // Store the tokens securely
  storeTokens(tokens);
  
  // Redirect to the application home page
  window.location.href = '/';
}
```

#### Step 3: Use the Tokens

```javascript
// Example using the access token to call an API
async function callApi() {
  const tokens = getTokens();
  
  if (!tokens || !tokens.access_token) {
    // Redirect to login if no tokens
    redirectToLogin();
    return;
  }
  
  const response = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`
    }
  });
  
  if (response.status === 401) {
    // Token might be expired, try to refresh
    await refreshTokens();
    return callApi();
  }
  
  return await response.json();
}

// Example refreshing tokens
async function refreshTokens() {
  const tokens = getTokens();
  
  if (!tokens || !tokens.refresh_token) {
    // Redirect to login if no refresh token
    redirectToLogin();
    return;
  }
  
  const response = await fetch('http://localhost:4444/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET' // Only for confidential clients
    })
  });
  
  if (!response.ok) {
    // If refresh fails, redirect to login
    redirectToLogin();
    return;
  }
  
  const newTokens = await response.json();
  storeTokens(newTokens);
}
```

### 3. Implement Logout

```javascript
// Example implementing logout
function logout() {
  const tokens = getTokens();
  
  // Clear local tokens
  clearTokens();
  
  // Redirect to SSO logout endpoint
  const logoutUrl = new URL('http://localhost:4444/oauth2/sessions/logout');
  
  // Optionally add ID token hint if available
  if (tokens && tokens.id_token) {
    logoutUrl.searchParams.append('id_token_hint', tokens.id_token);
  }
  
  // Specify where to redirect after logout
  logoutUrl.searchParams.append('post_logout_redirect_uri', 'http://localhost:8080/');
  
  window.location.href = logoutUrl.toString();
}
```

## Using Libraries

Instead of implementing the OAuth flows manually, consider using established libraries:

### Node.js with Express

```javascript
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

app.use(auth(config));

app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.listen(3000);
```

### React with `react-oidc-context`

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { AuthProvider, useAuth } from 'react-oidc-context';

const config = {
  authority: 'http://localhost:4444',
  client_id: 'YOUR_CLIENT_ID',
  redirect_uri: 'http://localhost:3000/callback',
  scope: 'openid profile email',
};

function App() {
  const auth = useAuth();

  switch (auth.activeNavigator) {
    case 'signinSilent':
      return <div>Signing you in...</div>;
    case 'signoutRedirect':
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Error: {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        <p>Logged in as: {auth.user?.profile.name}</p>
        <button onClick={() => auth.removeUser()}>Log out</button>
      </div>
    );
  }

  return <button onClick={() => auth.signinRedirect()}>Log in</button>;
}

ReactDOM.render(
  <AuthProvider {...config}>
    <App />
  </AuthProvider>,
  document.getElementById('root')
);
```

## Validating Tokens

For backend services, validate incoming access tokens:

```javascript
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');

const client = jwksClient({
  jwksUri: 'http://localhost:4444/.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Validate token middleware
function validateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  jwt.verify(token, getKey, {
    issuer: 'http://localhost:4444',
    audience: 'YOUR_API_AUDIENCE' // If configured
  }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = decoded;
    next();
  });
}
```

## Security Best Practices

1. **Store tokens securely**:
   - For web apps, use HTTPOnly cookies
   - For SPAs, consider using Web Workers for token storage

2. **Always validate tokens**:
   - Verify signature, issuer, audience, and expiration
   - Check for required scopes before granting access

3. **Implement PKCE**:
   - Always use PKCE for mobile and SPA clients

4. **Use short-lived access tokens**:
   - Implement token refresh when needed

5. **Protect redirect URIs**:
   - Register all valid redirect URIs in the SSO admin portal
   - Validate the state parameter

## Troubleshooting

- **Invalid Client Error**: Verify your client ID and secret
- **Invalid Redirect URI**: Ensure the redirect URI exactly matches one registered
- **Token Validation Fails**: Check that you're using the correct JWKS endpoint
- **Missing Scopes**: Verify that your client has been granted the requested scopes

For more detailed troubleshooting, check the Hydra logs by running:

```bash
docker-compose logs hydra
```