/**
 * Script to initialize the database with a default super-admin user
 */

const sequelize = require('../config/database');
const { User, createUser } = require('../models/user');
const { createTenantAdmin } = require('../models/tenant');

require('dotenv').config();

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'changeme123';
const DEFAULT_ADMIN_NAME = 'System Administrator';

/**
 * Initialize the database with required default data
 */
async function initDb() {
  try {
    console.log('Initializing database...');
    
    // Check if super admin exists
    const superAdminExists = await User.findOne({
      where: { role: 'super-admin' }
    });
    
    if (!superAdminExists) {
      console.log('Creating default super admin user...');
      
      await createUser({
        username: 'admin',
        email: DEFAULT_ADMIN_EMAIL,
        password: 'Password123!',
        role: 'super-admin',
        profile: {
          firstName: 'System',
          lastName: 'Administrator'
        }
      });
      
      console.log('Default super admin created!');
    } else {
      console.log('Super admin already exists, skipping creation.');
    }
    
    console.log('Attempting to create tenant admin...');
    // Create tenant admin for the login system
    try {
      console.log('Creating default tenant admin...');
      const admin = await createTenantAdmin({
        email: DEFAULT_ADMIN_EMAIL,
        name: DEFAULT_ADMIN_NAME,
        password: 'Password123!',
        role: 'super-admin'
      });
      console.log('Default tenant admin created!', admin ? admin.id : 'No ID returned');
    } catch (error) {
      // If the admin already exists or there's another error, log it but continue
      console.log('Error creating tenant admin. Full error:', error);
      console.log('Error message:', error.message);
      if (error.name) console.log('Error name:', error.name);
      if (error.stack) console.log('Error stack:', error.stack);
    }
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  initDb()
    .then(() => {
      console.log('Initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Initialization script failed:', error);
      process.exit(1);
    });
}

module.exports = { initDb };