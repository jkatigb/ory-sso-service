/*
File: create-admin.js
Path: services/admin-portal/src/scripts/create-admin.js
Purpose: Script to create a tenant admin directly
Last change: Created script to create admin user
*/

const { createTenantAdmin } = require('../models/tenant');
require('dotenv').config();

const EMAIL = 'admin@example.com';
const PASSWORD = 'Password123!';
const NAME = 'System Administrator';

async function createAdmin() {
  try {
    console.log(`Creating admin user with email: ${EMAIL}`);
    
    const admin = await createTenantAdmin({
      email: EMAIL,
      name: NAME,
      password: PASSWORD,
      role: 'super-admin'
    });
    
    console.log('Admin created successfully!');
    console.log(`Admin ID: ${admin.id}`);
    console.log(`Admin email: ${admin.email}`);
    console.log(`Admin role: ${admin.role}`);
    
    console.log('\nLogin credentials:');
    console.log(`Email: ${EMAIL}`);
    console.log(`Password: ${PASSWORD}`);
    
    return admin;
  } catch (error) {
    console.error('Failed to create admin:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('An admin with this email already exists.');
    }
    throw error;
  }
}

// Execute if this script is run directly
if (require.main === module) {
  createAdmin()
    .then(() => {
      console.log('Admin creation completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Admin creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createAdmin }; 