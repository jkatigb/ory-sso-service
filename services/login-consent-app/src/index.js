const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const { Sequelize } = require('sequelize');
const hydraClient = require('./services/hydra');
const tenantService = require('./services/tenant');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: false
});

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('handlebars').__express);

// Routes
app.use('/login', require('./routes/login'));
app.use('/consent', require('./routes/consent'));
app.use('/logout', require('./routes/logout'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize the database and start the server
async function init() {
  try {
    // Sync database models
    await sequelize.sync();
    console.log('Database synchronized');

    // Start the server
    app.listen(PORT, () => {
      console.log(`Login & Consent App listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

init();