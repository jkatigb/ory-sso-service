const express = require('express');
const session = require('express-session');
const { Issuer, Strategy } = require('openid-client');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'this-should-be-a-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Set up view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Create and configure passport with openid-client
let openidClient;

// Discover the OpenID Provider
async function setupAuth() {
  try {
    // Discover the OpenID Provider
    const issuer = await Issuer.discover(process.env.OIDC_ISSUER_URL || 'http://localhost:4444');
    console.log('Discovered issuer %s', issuer.issuer);

    // Create a client
    const client = new issuer.Client({
      client_id: process.env.CLIENT_ID || 'test-client',
      client_secret: process.env.CLIENT_SECRET || 'test-secret',
      redirect_uris: [process.env.REDIRECT_URI || 'http://localhost:8080/callback'],
      response_types: ['code']
    });

    // Store the client for later use
    openidClient = client;
  } catch (error) {
    console.error('Error setting up authentication:', error);
  }
}

// Call the setup function
setupAuth();

// Define routes
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user || null });
});

// Login route - redirects to the identity provider
app.get('/login', (req, res) => {
  if (!openidClient) {
    return res.status(500).send('Authentication not set up properly. Please try again later.');
  }

  // Generate the authorization URL
  const authUrl = openidClient.authorizationUrl({
    scope: 'openid profile email',
    state: Math.random().toString(36).substring(2, 15)
  });

  // Redirect the user to the authorization server
  res.redirect(authUrl);
});

// Callback route - processes the authorization code from the identity provider
app.get('/callback', async (req, res) => {
  if (!openidClient) {
    return res.status(500).send('Authentication not set up properly. Please try again later.');
  }

  try {
    // Exchange the authorization code for tokens
    const params = openidClient.callbackParams(req);
    const tokenSet = await openidClient.callback(
      process.env.REDIRECT_URI || 'http://localhost:8080/callback',
      params
    );

    // Get the user info using the access token
    const userinfo = await openidClient.userinfo(tokenSet.access_token);

    // Store the user info and tokens in the session
    req.session.user = userinfo;
    req.session.tokens = {
      access_token: tokenSet.access_token,
      refresh_token: tokenSet.refresh_token,
      id_token: tokenSet.id_token
    };

    // Redirect to the home page
    res.redirect('/');
  } catch (error) {
    console.error('Error handling callback:', error);
    res.status(500).send(`Error during authentication: ${error.message}`);
  }
});

// Protected route example
app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('profile', { user: req.session.user });
});

// Logout route
app.get('/logout', async (req, res) => {
  if (!openidClient) {
    req.session.destroy();
    return res.redirect('/');
  }

  // If we have an ID token, we can use it to construct the end session URL
  const idToken = req.session.tokens?.id_token;
  
  // Destroy the session
  req.session.destroy();

  // Construct the end session URL
  const logoutUrl = new URL(
    process.env.LOGOUT_URL || 'http://localhost:4444/oauth2/sessions/logout'
  );
  
  if (idToken) {
    logoutUrl.searchParams.append('id_token_hint', idToken);
  }
  
  logoutUrl.searchParams.append(
    'post_logout_redirect_uri',
    process.env.POST_LOGOUT_REDIRECT_URI || 'http://localhost:8080/'
  );

  // Redirect to the end session endpoint
  res.redirect(logoutUrl.toString());
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});