/*
File: test-auth.js
Path: services/admin-portal/src/scripts/test-auth.js
Purpose: Script to test admin authentication directly
Last change: Created script to verify authentication works
*/

const { authenticateAdmin } = require('../models/tenant');
require('dotenv').config();

async function testAuth() {
  try {
    console.log('Testing authentication for admin@example.com');
    
    const result = await authenticateAdmin('admin@example.com', 'Password123!');
    
    if (result) {
      console.log('Authentication successful!');
      console.log('Admin details:', JSON.stringify(result.admin, null, 2));
      console.log('Token:', result.token);
      return true;
    } else {
      console.log('Authentication failed - invalid credentials');
      
      // Let's try debugging the password verification
      const { TenantAdmin } = require('../models/tenant');
      const admin = await TenantAdmin.findOne({
        where: {
          email: 'admin@example.com',
          active: true
        }
      });
      
      if (!admin) {
        console.log('Admin user not found in database');
      } else {
        console.log('Admin found in database. ID:', admin.id);
        console.log('Trying password verification directly...');
        const isValid = admin.validatePassword('Password123!');
        console.log('Password validation result:', isValid);
        console.log('Hash in DB:', admin.hash.substring(0, 20) + '...');
        console.log('Salt in DB:', admin.salt);
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error during authentication test:', error);
    return false;
  }
}

// Execute if this script is run directly
if (require.main === module) {
  testAuth()
    .then(success => {
      console.log('Auth test complete, success:', success);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Auth test failed with error:', error);
      process.exit(1);
    });
}

module.exports = { testAuth }; 