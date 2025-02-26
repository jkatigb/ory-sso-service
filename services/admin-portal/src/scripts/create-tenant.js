/*
File: create-tenant.js
Path: services/admin-portal/src/scripts/create-tenant.js
Purpose: Script to automate tenant creation and onboarding
Last change: Created script for tenant onboarding automation
*/

const { createTenant, createTenantAdmin, Tenant } = require('../models/tenant');
require('dotenv').config();

/**
 * Create a new tenant with branding and admin user
 * @param {Object} tenantData Tenant basic information
 * @param {Object} brandingData Tenant branding information
 * @param {Object} adminData Tenant admin user information
 * @returns {Promise<Object>} Created tenant with admin details
 */
async function onboardTenant(tenantData, brandingData, adminData) {
  console.log(`Starting onboarding process for tenant: ${tenantData.name}`);
  
  try {
    // Check if tenant with this slug already exists
    const existingTenant = await Tenant.findOne({ where: { slug: tenantData.slug } });
    if (existingTenant) {
      throw new Error(`Tenant with slug "${tenantData.slug}" already exists`);
    }
    
    // Create the tenant with branding
    console.log('Creating tenant record...');
    const tenant = await createTenant(tenantData, brandingData);
    console.log(`Tenant created with ID: ${tenant.id}`);
    
    // Create admin for the tenant
    console.log(`Creating admin user: ${adminData.email}`);
    const admin = await createTenantAdmin({
      ...adminData,
      tenantId: tenant.id,
      role: 'admin' // Tenant-level admin
    });
    console.log(`Admin created with ID: ${admin.id}`);
    
    // Format response
    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        status: tenant.status,
        createdAt: tenant.createdAt
      },
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      loginCredentials: {
        email: admin.email,
        password: adminData.password // This is the initially set password
      }
    };
  } catch (error) {
    console.error('Tenant onboarding failed:', error.message);
    throw error;
  }
}

// Example usage if run directly
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Tenant Onboarding Script
========================

Usage:
  node create-tenant.js [options]

Options:
  --name        Tenant name (required)
  --slug        Tenant slug/subdomain (required)
  --domain      Primary domain (optional)
  --adminName   Admin user name (required)
  --adminEmail  Admin user email (required)
  --adminPass   Admin user password (required)
  --logoUrl     URL to logo image (optional)
  --primaryColor Brand primary color (optional, default: #3498db)
  --accentColor  Brand accent color (optional, default: #2ecc71)
  --help        Show this help message

Example:
  node create-tenant.js --name "Acme Corp" --slug "acme" --domain "acme.com" \\
    --adminName "John Admin" --adminEmail "admin@acme.com" --adminPass "SecurePass123!" \\
    --logoUrl "https://acme.com/logo.png" --primaryColor "#ff5500"
`);
    process.exit(0);
  }
  
  // Parse arguments into an object
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    options[key] = value;
  }
  
  // Validate required fields
  const requiredFields = ['name', 'slug', 'adminName', 'adminEmail', 'adminPass'];
  const missingFields = requiredFields.filter(field => !options[field]);
  
  if (missingFields.length > 0) {
    console.error(`Error: Missing required fields: ${missingFields.join(', ')}`);
    console.log('Use --help for usage information');
    process.exit(1);
  }
  
  // Prepare data objects
  const tenantData = {
    name: options.name,
    slug: options.slug,
    domain: options.domain || null,
    status: 'active'
  };
  
  const brandingData = {
    logoUrl: options.logoUrl || null,
    primaryColor: options.primaryColor || '#3498db',
    secondaryColor: options.accentColor || '#2ecc71'
  };
  
  const adminData = {
    name: options.adminName,
    email: options.adminEmail,
    password: options.adminPass
  };
  
  // Run onboarding process
  onboardTenant(tenantData, brandingData, adminData)
    .then(result => {
      console.log('\nTenant Onboarding Completed Successfully');
      console.log('======================================');
      console.log('Tenant ID:', result.tenant.id);
      console.log('Tenant Name:', result.tenant.name);
      console.log('Tenant Slug:', result.tenant.slug);
      console.log('\nAdmin Name:', result.admin.name);
      console.log('Admin Email:', result.admin.email);
      console.log('\nLogin Credentials:');
      console.log('Email:', result.loginCredentials.email);
      console.log('Password:', result.loginCredentials.password);
      console.log('\nLogin URL: http://localhost:3011');
      process.exit(0);
    })
    .catch(error => {
      console.error('Onboarding failed:', error.message);
      process.exit(1);
    });
}

module.exports = { onboardTenant }; 