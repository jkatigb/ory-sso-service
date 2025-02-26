# Ory SSO Integration Guide

This guide provides instructions for integrating our Multi-Tenant SSO service with existing applications.

## Table of Contents

1. [Overview](#overview)
2. [Integration Approaches](#integration-approaches)
3. [OAuth2/OIDC Integration](#oauth2oidc-integration)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Integration Examples](#integration-examples)
6. [Troubleshooting](#troubleshooting)

## Overview

Our SSO service provides the following capabilities:
- OAuth 2.0 and OpenID Connect (OIDC) compliant authentication
- Multi-tenant functionality with tenant isolation
- Customizable branding and UI per tenant
- Role-based access control
- User management

## Integration Approaches

There are several ways to integrate with the SSO service:

### 1. OAuth2/OIDC Client

The most common approach is to use the OAuth2/OIDC protocols. Your application acts as a client that redirects users to the SSO service for authentication, then handles the callback with tokens.

### 2. API Integration

You can also integrate with the service APIs to programmatically manage users, roles, permissions, and other resources.

### 3. Single Sign-On for Existing Identity Providers

If you already have an identity provider, you can configure our SSO service to act as a gateway that forwards authentication to your existing provider while adding multi-tenancy capabilities.

## OAuth2/OIDC Integration

### Step 1: Register your application as an OAuth2 client

```bash
# Example using the admin-portal API
curl -X POST http://localhost:3001/api/oauth2/clients \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "My Application",
    "redirect_uris": ["https://myapp.example.com/callback"],
    "grant_types": ["authorization_code", "refresh_token"],
    "response_types": ["code"],
    "token_endpoint_auth_method": "client_secret_post",
    "tenant_id": "YOUR_TENANT_ID"
  }'
```

### Step 2: Implement OAuth2 flow in your application

For a Node.js application using Passport.js:

```javascript
const passport = require('passport');
const { Strategy } = require('passport-oauth2');

passport.use(new Strategy({
    authorizationURL: 'http://your-sso-domain.com/oauth2/auth',
    tokenURL: 'http://your-sso-domain.com/oauth2/token',
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    callbackURL: 'https://your-app.com/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
    // Verify user and handle login
    return cb(null, profile);
  }
));

// Authentication routes
app.get('/login', passport.authenticate('oauth2'));

app.get('/callback', 
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication
    res.redirect('/dashboard');
  }
);
```

For other languages and frameworks, similar OAuth2 libraries exist.

### Step 3: Handle User Info and Token Validation

After receiving an access token, you should validate it and fetch user information:

```javascript
const axios = require('axios');

async function getUserInfo(accessToken) {
  try {
    const response = await axios.get('http://your-sso-domain.com/oauth2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
}
```

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster 
- kubectl configured to access your cluster
- Helm (optional, but recommended)

### Step 1: Create a Kubernetes deployment configuration

Create a file named `ory-sso-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ory-sso-admin-portal
  labels:
    app: ory-sso
    component: admin-portal
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ory-sso
      component: admin-portal
  template:
    metadata:
      labels:
        app: ory-sso
        component: admin-portal
    spec:
      containers:
      - name: admin-portal
        image: your-registry/ory-sso-admin-portal:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ory-sso-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: ory-sso-secrets
              key: jwt-secret
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ory-sso-login-consent
  labels:
    app: ory-sso
    component: login-consent
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ory-sso
      component: login-consent
  template:
    metadata:
      labels:
        app: ory-sso
        component: login-consent
    spec:
      containers:
      - name: login-consent
        image: your-registry/ory-sso-login-consent:latest
        ports:
        - containerPort: 3000
        env:
        - name: HYDRA_ADMIN_URL
          value: "http://ory-sso-hydra:4445"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ory-sso-secrets
              key: database-url
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ory-sso-hydra
  labels:
    app: ory-sso
    component: hydra
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ory-sso
      component: hydra
  template:
    metadata:
      labels:
        app: ory-sso
        component: hydra
    spec:
      containers:
      - name: hydra
        image: oryd/hydra:v2.1.1
        ports:
        - containerPort: 4444
        - containerPort: 4445
        env:
        - name: DSN
          valueFrom:
            secretKeyRef:
              name: ory-sso-secrets
              key: hydra-dsn
        - name: URLS_SELF_ISSUER
          value: "https://sso.example.com/"
        - name: URLS_CONSENT
          value: "https://sso.example.com/consent"
        - name: URLS_LOGIN
          value: "https://sso.example.com/login"
---
apiVersion: v1
kind: Service
metadata:
  name: ory-sso-admin-portal
spec:
  selector:
    app: ory-sso
    component: admin-portal
  ports:
  - port: 3001
    targetPort: 3001
---
apiVersion: v1
kind: Service
metadata:
  name: ory-sso-login-consent
spec:
  selector:
    app: ory-sso
    component: login-consent
  ports:
  - port: 3000
    targetPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: ory-sso-hydra
spec:
  selector:
    app: ory-sso
    component: hydra
  ports:
  - name: public
    port: 4444
    targetPort: 4444
  - name: admin
    port: 4445
    targetPort: 4445
```

### Step 2: Create secrets for sensitive information

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ory-sso-secrets
type: Opaque
stringData:
  database-url: "postgres://postgres:password@postgres:5432/sso_service"
  jwt-secret: "your-jwt-secret-key"
  hydra-dsn: "postgres://postgres:password@postgres:5432/hydra"
```

### Step 3: Deploy to Kubernetes

```bash
# Apply the secrets first
kubectl apply -f ory-sso-secrets.yaml

# Deploy the SSO services
kubectl apply -f ory-sso-deployment.yaml
```

### Step 4: Expose services with Ingress

Create a file named `ory-sso-ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ory-sso-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - sso.example.com
    secretName: ory-sso-tls
  rules:
  - host: sso.example.com
    http:
      paths:
      - path: /oauth2
        pathType: Prefix
        backend:
          service:
            name: ory-sso-hydra
            port:
              number: 4444
      - path: /admin
        pathType: Prefix
        backend:
          service:
            name: ory-sso-admin-portal
            port:
              number: 3001
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ory-sso-login-consent
            port:
              number: 3000
```

Apply the ingress:

```bash
kubectl apply -f ory-sso-ingress.yaml
```

## Integration Examples

### React Application Example

```jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      // Validate the token and get user info
      fetchUserInfo(token)
        .then(userInfo => {
          setUser(userInfo);
          setLoading(false);
        })
        .catch(() => {
          // Token might be invalid, redirect to login
          localStorage.removeItem('accessToken');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Handle OAuth callback
  const handleCallback = (props) => {
    const code = new URLSearchParams(props.location.search).get('code');
    
    if (code) {
      // Exchange code for tokens
      fetch('http://your-backend-api.com/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      .then(res => res.json())
      .then(data => {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Get user info
        return fetchUserInfo(data.accessToken);
      })
      .then(userInfo => {
        setUser(userInfo);
        props.history.push('/dashboard');
      });
    }
    
    return <div>Processing login...</div>;
  };

  // Protected route component
  const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={props =>
        user ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );

  // Login page that redirects to SSO
  const Login = () => {
    useEffect(() => {
      window.location.href = 'http://your-sso-domain.com/oauth2/auth?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://your-app.com/callback&scope=openid profile email';
    }, []);
    
    return <div>Redirecting to login...</div>;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/callback" render={handleCallback} />
        <PrivateRoute path="/dashboard" component={Dashboard} />
        <Redirect from="/" to="/dashboard" />
      </Switch>
    </BrowserRouter>
  );
}

function Dashboard() {
  return <div>Protected Dashboard</div>;
}

// Helper function to fetch user info
function fetchUserInfo(token) {
  return fetch('http://your-sso-domain.com/oauth2/userinfo', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    if (!res.ok) throw new Error('Failed to get user info');
    return res.json();
  });
}

export default App;
```

### Backend API Authentication Example (Node.js)

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();

// Middleware to verify access tokens
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  // Validate token with introspection endpoint
  axios.post('http://your-sso-domain.com/oauth2/introspect', 
    { token },
    { 
      auth: {
        username: 'YOUR_CLIENT_ID',
        password: 'YOUR_CLIENT_SECRET'
      }
    }
  )
  .then(response => {
    if (response.data.active) {
      req.user = response.data;
      next();
    } else {
      res.sendStatus(403); // Token is not active
    }
  })
  .catch(error => {
    console.error('Token validation error:', error);
    res.sendStatus(500);
  });
}

// Protected API route
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    id: req.user.sub,
    email: req.user.email,
    name: req.user.name
  });
});

app.listen(3000, () => {
  console.log('API server listening on port 3000');
});
```

## Troubleshooting

### Common Issues

#### Token validation failures
- Ensure the correct client ID and secret are being used
- Check that token introspection URLs are correct
- Verify that the client is allowed to use the granted scopes

#### Redirect URI mismatches
- The redirect URI used in the authorization request must exactly match one of the registered redirect URIs
- Check for trailing slashes or http vs https mismatches

#### CORS issues
- Ensure that your SSO service has CORS properly configured for your application domains
- Add your application's domain to the allowed origins list

### Debugging Tools

- Use the browser's developer tools to inspect requests and responses
- Check network tabs for error responses from the OAuth server
- Use JWT debugging tools to inspect token contents

### Common Errors and Solutions

| Error | Possible Cause | Solution |
|-------|---------------|----------|
| `invalid_grant` | Authorization code expired or already used | Generate a new authorization code |
| `invalid_client` | Client authentication failed | Check client ID and client secret |
| `invalid_request` | Missing required parameter | Check that all required parameters are included |
| `unauthorized_client` | Client not authorized for this grant type | Configure the client for the desired grant type |
| `access_denied` | User denied the authorization request | Improve user experience to explain the authorization | 