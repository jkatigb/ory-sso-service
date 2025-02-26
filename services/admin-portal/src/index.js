const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const sequelize = require('./config/database');

// Import init-db if it exists, or create a placeholder
let initDb;
try {
  initDb = require('./scripts/init-db').initDb;
} catch (error) {
  console.warn('init-db script not found, skipping database initialization');
  initDb = async () => {
    console.log('Database initialization skipped.');
  };
}

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : 'http://localhost:3011',
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

// View engine setup if express-handlebars is available
try {
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
} catch (error) {
  console.warn('View engine setup failed, HTML rendering will not be available', error.message);
}

// Routes - wrapped in try/catch to handle missing routes
try {
  if (require.resolve('./routes/api/tenants')) {
    app.use('/api/tenants', require('./routes/api/tenants'));
  }
} catch (error) {
  console.warn('Tenants routes not found, /api/tenants endpoints will not be available');
}

try {
  if (require.resolve('./routes/api/clients')) {
    app.use('/api/clients', require('./routes/api/clients'));
  }
} catch (error) {
  console.warn('Clients routes not found, /api/clients endpoints will not be available');
}

try {
  if (require.resolve('./routes/api/users')) {
    app.use('/api/users', require('./routes/api/users'));
  }
} catch (error) {
  console.warn('Users routes not found, /api/users endpoints will not be available');
}

try {
  if (require.resolve('./routes/auth')) {
    app.use('/auth', require('./routes/auth'));
  }
} catch (error) {
  console.warn('Auth routes not found, /auth endpoints will not be available');
}

try {
  if (require.resolve('./routes/dashboard')) {
    app.use('/', require('./routes/dashboard'));
  }
} catch (error) {
  console.warn('Dashboard routes not found, / endpoints will not be available');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Admin Portal API is running',
    env: {
      hydraAdmin: process.env.HYDRA_ADMIN_URL || 'not set'
    }
  });
});

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
  try {
    res.status(err.status || 500).render('error', {
      error: err.message || 'Something went wrong!',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } catch (error) {
    res.status(err.status || 500).json({
      error: err.message || 'Something went wrong!',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Initialize the database and start the server
async function init() {
  try {
    // Test database connection
    try {
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      
      // Sync database models
      await sequelize.sync();
      console.log('Database synchronized');
      
      // Initialize the database with default data if needed
      await initDb();
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      console.log('Starting server without database connection...');
    }

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