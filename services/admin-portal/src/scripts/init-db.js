/**
 * Script to initialize the database with a default super-admin user
 */

const { Sequelize } = require('sequelize');
const { TenantAdmin, Tenant, createTenant, createTenantAdmin } = require('../models/tenant');

require('dotenv').config();

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'changeme123';
const DEFAULT_ADMIN_NAME = 'System Administrator';

/**
 * Initialize the database
 */
async function initDb() {
  console.log('Starting database initialization...');

  try {
    // Create database connection
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
      logging: false
    });

    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established');

    // Sync database models
    await sequelize.sync();
    console.log('Database models synchronized');

    // Check if a super admin already exists
    const existingAdmin = await TenantAdmin.findOne({
      where: {
        role: 'super-admin'
      }
    });

    if (existingAdmin) {
      console.log('A super-admin already exists in the database. Skipping initialization.');
      return;
    }

    console.log('Creating default super-admin account...');

    // Create a super admin user (not associated with any tenant)
    const superAdmin = await createTenantAdmin({
      email: DEFAULT_ADMIN_EMAIL,
      name: DEFAULT_ADMIN_NAME,
      password: DEFAULT_ADMIN_PASSWORD,
      tenantId: null, // No tenant for super-admin
      role: 'super-admin'
    });

    console.log(`Super-admin created with email: ${DEFAULT_ADMIN_EMAIL}`);
    console.log('IMPORTANT: Change the default password immediately after first login!');

    // Create a default tenant for demo purposes
    const defaultTenant = await createTenant({
      name: 'Default Organization',
      domain: 'default.example.com',
      active: true,
      config: {}
    });

    console.log(`Default tenant created: ${defaultTenant.name}`);

    // Create a tenant admin for the default tenant
    const tenantAdmin = await createTenantAdmin({
      email: 'tenant-admin@example.com',
      name: 'Tenant Administrator',
      password: 'tenant123',
      tenantId: defaultTenant.id,
      role: 'admin'
    });

    console.log('Default tenant admin created with email: tenant-admin@example.com');
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
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