/*
File: bulk-import-tenants.js
Path: services/admin-portal/src/scripts/bulk-import-tenants.js
Purpose: Script to import multiple tenants from a JSON configuration file
Last change: Created script for bulk tenant imports
*/

const fs = require('fs');
const path = require('path');
const { onboardTenant } = require('./create-tenant');
require('dotenv').config();

/**
 * Import tenants from JSON configuration file
 * @param {string} filePath Path to JSON configuration file
 * @returns {Promise<Array>} Results of tenant imports
 */
async function importTenantsFromFile(filePath) {
  try {
    // Read and parse JSON file
    const fullPath = path.resolve(process.cwd(), filePath);
    console.log(`Reading tenant configuration from: ${fullPath}`);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }
    
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const tenantsConfig = JSON.parse(fileContent);
    
    if (!Array.isArray(tenantsConfig)) {
      throw new Error('Invalid format: Root element must be an array of tenant configurations');
    }
    
    console.log(`Found ${tenantsConfig.length} tenant configurations to import`);
    
    // Process each tenant
    const results = [];
    for (const [index, config] of tenantsConfig.entries()) {
      console.log(`\nProcessing tenant ${index + 1}/${tenantsConfig.length}: ${config.tenant?.name || 'Unnamed'}`);
      
      // Validate configuration
      if (!config.tenant || !config.branding || !config.admin) {
        console.error('Invalid tenant configuration. Missing tenant, branding, or admin section');
        results.push({
          success: false,
          error: 'Invalid configuration format',
          config
        });
        continue;
      }
      
      // Required fields
      const requiredTenantFields = ['name', 'slug'];
      const requiredAdminFields = ['name', 'email', 'password'];
      
      const missingTenantFields = requiredTenantFields.filter(field => !config.tenant[field]);
      const missingAdminFields = requiredAdminFields.filter(field => !config.admin[field]);
      
      if (missingTenantFields.length > 0 || missingAdminFields.length > 0) {
        const error = [
          ...missingTenantFields.map(f => `tenant.${f}`),
          ...missingAdminFields.map(f => `admin.${f}`)
        ].join(', ');
        
        console.error(`Missing required fields: ${error}`);
        results.push({
          success: false,
          error: `Missing required fields: ${error}`,
          config
        });
        continue;
      }
      
      try {
        // Attempt to onboard the tenant
        const result = await onboardTenant(config.tenant, config.branding, config.admin);
        results.push({
          success: true,
          result
        });
      } catch (error) {
        console.error(`Failed to onboard tenant: ${error.message}`);
        results.push({
          success: false,
          error: error.message,
          config
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Import failed:', error.message);
    throw error;
  }
}

// Example JSON file structure
const exampleConfig = [
  {
    "tenant": {
      "name": "Acme Corporation",
      "slug": "acme",
      "domain": "acme.com",
      "status": "active"
    },
    "branding": {
      "logoUrl": "https://acme.com/logo.png",
      "primaryColor": "#ff5500",
      "secondaryColor": "#0055ff"
    },
    "admin": {
      "name": "Acme Admin",
      "email": "admin@acme.com",
      "password": "SecurePassword123!"
    }
  },
  {
    "tenant": {
      "name": "Beta Industries",
      "slug": "beta",
      "domain": "betaindustries.com",
      "status": "pending"
    },
    "branding": {
      "logoUrl": "https://beta.com/logo.png",
      "primaryColor": "#00aa55",
      "secondaryColor": "#550099"
    },
    "admin": {
      "name": "Beta Admin",
      "email": "admin@betaindustries.com",
      "password": "StrongPassword456!"
    }
  }
];

// Execute if this script is run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Bulk Tenant Import Script
=========================

Usage:
  node bulk-import-tenants.js <config-file.json>

Options:
  --example    Output an example configuration file
  --help       Show this help message

Example:
  node bulk-import-tenants.js tenants-config.json
`);

    if (args[0] === '--example') {
      const exampleFile = 'example-tenants-config.json';
      fs.writeFileSync(exampleFile, JSON.stringify(exampleConfig, null, 2));
      console.log(`\nExample configuration written to: ${exampleFile}`);
    }
    
    process.exit(0);
  }
  
  const configFile = args[0];
  
  importTenantsFromFile(configFile)
    .then(results => {
      console.log('\nImport Results Summary');
      console.log('=====================');
      console.log(`Total Processed: ${results.length}`);
      console.log(`Successful: ${results.filter(r => r.success).length}`);
      console.log(`Failed: ${results.filter(r => !r.success).length}`);
      
      // Details of successful imports
      console.log('\nSuccessfully Imported Tenants:');
      results.filter(r => r.success).forEach((r, i) => {
        console.log(`${i + 1}. ${r.result.tenant.name} (${r.result.tenant.slug})`);
        console.log(`   Admin: ${r.result.admin.email}`);
      });
      
      // Details of failures
      if (results.some(r => !r.success)) {
        console.log('\nFailed Imports:');
        results.filter(r => !r.success).forEach((r, i) => {
          console.log(`${i + 1}. ${r.config.tenant?.name || 'Unnamed'}`);
          console.log(`   Error: ${r.error}`);
        });
      }
      
      process.exit(0);
    })
    .catch(error => {
      console.error('Import process failed:', error.message);
      process.exit(1);
    });
}

module.exports = { importTenantsFromFile }; 