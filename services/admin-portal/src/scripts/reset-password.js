/*
File: reset-password.js
Path: services/admin-portal/src/scripts/reset-password.js
Purpose: Script to reset an admin's password in the database
Last change: Created script to fix password authentication issues
*/

const { TenantAdmin } = require('../models/tenant');
require('dotenv').config();

const EMAIL = 'admin@example.com';
const NEW_PASSWORD = 'Password123!';

async function resetPassword() {
  try {
    console.log(`Resetting password for ${EMAIL}`);
    
    // Find the admin
    const admin = await TenantAdmin.findOne({
      where: {
        email: EMAIL
      }
    });
    
    if (!admin) {
      console.error(`Admin with email ${EMAIL} not found`);
      return false;
    }
    
    console.log('Admin found. ID:', admin.id);
    
    // Reset password
    admin.setPassword(NEW_PASSWORD);
    await admin.save();
    
    console.log('Password reset successful!');
    console.log('New hash:', admin.hash.substring(0, 20) + '...');
    console.log('Salt:', admin.salt);
    
    // Verify the new password works
    const isValid = admin.validatePassword(NEW_PASSWORD);
    console.log('Password validation test:', isValid ? 'PASSED' : 'FAILED');
    
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
}

// Also try resetting tenant-admin password
async function resetTenantAdminPassword() {
  try {
    const email = 'tenant-admin@example.com';
    console.log(`Resetting password for ${email}`);
    
    // Find the admin
    const admin = await TenantAdmin.findOne({
      where: {
        email
      }
    });
    
    if (!admin) {
      console.error(`Admin with email ${email} not found`);
      return false;
    }
    
    console.log('Tenant Admin found. ID:', admin.id);
    
    // Reset password
    admin.setPassword(NEW_PASSWORD);
    await admin.save();
    
    console.log('Tenant Admin password reset successful!');
    
    return true;
  } catch (error) {
    console.error('Error resetting tenant admin password:', error);
    return false;
  }
}

// Execute if this script is run directly
if (require.main === module) {
  Promise.all([resetPassword(), resetTenantAdminPassword()])
    .then(([superAdminSuccess, tenantAdminSuccess]) => {
      console.log('Password reset summary:');
      console.log('- Super Admin:', superAdminSuccess ? 'SUCCESS' : 'FAILED');
      console.log('- Tenant Admin:', tenantAdminSuccess ? 'SUCCESS' : 'FAILED');
      
      if (superAdminSuccess || tenantAdminSuccess) {
        console.log('\nYou can now log in with:');
        console.log(`Email: ${superAdminSuccess ? 'admin@example.com' : 'tenant-admin@example.com'}`);
        console.log(`Password: ${NEW_PASSWORD}`);
      }
      
      process.exit(superAdminSuccess || tenantAdminSuccess ? 0 : 1);
    })
    .catch(error => {
      console.error('Password reset failed with error:', error);
      process.exit(1);
    });
}

module.exports = { resetPassword, resetTenantAdminPassword }; 