// File: database.js
// Path: services/admin-portal/src/config/database.js
// Purpose: Database connection configuration
// Last change: Initial creation

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Get database URL from environment or use default
const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@postgres:5432/sso_service';

// Create Sequelize instance
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test connection function
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

module.exports = sequelize;
module.exports.testConnection = testConnection; 