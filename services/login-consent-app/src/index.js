const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');

// Remove Sequelize and service imports temporarily
// const { Sequelize } = require('sequelize');
// const hydraClient = require('./services/hydra');
// const tenantService = require('./services/tenant');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup - comment out for now until Sequelize is configured
/*
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: false
});
*/

// Middleware
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : 'http://localhost:3010',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// View engine setup - comment out handlebars for now
/*
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('express-handlebars').engine({
  extname: '.html'
}));

// Helper function for handlebars to compare values
const hbs = require('handlebars');
hbs.registerHelper('eq', function (a, b) {
  return a === b;
});
*/

// Routes - comment out for now as these routes don't exist yet
/*
app.use('/login', require('./routes/login'));
app.use('/consent', require('./routes/consent'));
app.use('/logout', require('./routes/logout'));
*/

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Login Consent API is running',
    env: {
      hydraAdmin: process.env.HYDRA_ADMIN_URL || 'not set'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize the server
// Simplified to just start the server for now
app.listen(PORT, () => {
  console.log(`Login Consent API listening on port ${PORT}`);
});