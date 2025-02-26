const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const { Sequelize } = require('sequelize');
const { initDb } = require('./scripts/init-db');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// Helper function for handlebars to compare values
const hbs = require('handlebars');
hbs.registerHelper('eq', function (a, b) {
  return a === b;
});

// Routes
app.use('/api/tenants', require('./routes/api/tenants'));
app.use('/api/clients', require('./routes/api/clients'));
app.use('/api/users', require('./routes/api/users'));
app.use('/auth', require('./routes/auth'));
app.use('/', require('./routes/dashboard'));

// API error handler
app.use('/api', (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Web error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    error: err.message || 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Initialize the database and start the server
async function init() {
  try {
    // Sync database models
    await sequelize.sync();
    console.log('Database synchronized');
    
    // Initialize the database with default data if needed
    await initDb();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Admin Portal listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

init();