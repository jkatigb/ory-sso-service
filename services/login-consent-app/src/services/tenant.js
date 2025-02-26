const { Sequelize, DataTypes, Model } = require('sequelize');

// Get the Sequelize instance from the main app
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: false
});

/**
 * Tenant model - represents an organization in our multi-tenant SSO service
 */
class Tenant extends Model {}

Tenant.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  config: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  sequelize,
  modelName: 'Tenant',
  tableName: 'tenants',
  timestamps: true
});

/**
 * TenantBranding model - contains UI customization for each tenant
 */
class TenantBranding extends Model {}

TenantBranding.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Tenant,
      key: 'id'
    }
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  primaryColor: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '#007bff'
  },
  secondaryColor: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '#6c757d'
  },
  backgroundColor: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '#f8f9fa'
  },
  customCss: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  customJs: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'TenantBranding',
  tableName: 'tenant_brandings',
  timestamps: true
});

// Set up associations
Tenant.hasOne(TenantBranding, { foreignKey: 'tenantId', as: 'branding' });
TenantBranding.belongsTo(Tenant, { foreignKey: 'tenantId' });

/**
 * Get tenant by ID
 * @param {string} id Tenant UUID
 * @returns {Promise<Tenant>} The tenant object with branding
 */
async function getTenantById(id) {
  return await Tenant.findByPk(id, {
    include: [{ model: TenantBranding, as: 'branding' }]
  });
}

/**
 * Get tenant by domain
 * @param {string} domain Domain name
 * @returns {Promise<Tenant>} The tenant object with branding
 */
async function getTenantByDomain(domain) {
  return await Tenant.findOne({
    where: { domain },
    include: [{ model: TenantBranding, as: 'branding' }]
  });
}

/**
 * Get tenant from client metadata in Hydra
 * @param {Object} clientMetadata Metadata from Hydra OAuth2 client
 * @returns {Promise<Tenant>} The tenant object with branding
 */
async function getTenantFromClientMetadata(clientMetadata) {
  if (!clientMetadata || !clientMetadata.tenant_id) {
    throw new Error('No tenant ID found in client metadata');
  }
  
  return await getTenantById(clientMetadata.tenant_id);
}

/**
 * Create a new tenant
 * @param {Object} tenantData Basic tenant data
 * @param {Object} brandingData Optional branding information
 * @returns {Promise<Tenant>} The created tenant
 */
async function createTenant(tenantData, brandingData = {}) {
  const transaction = await sequelize.transaction();
  
  try {
    // Create the tenant
    const tenant = await Tenant.create(tenantData, { transaction });
    
    // Create branding if provided
    if (Object.keys(brandingData).length > 0) {
      await TenantBranding.create({
        tenantId: tenant.id,
        ...brandingData
      }, { transaction });
    } else {
      // Create default branding
      await TenantBranding.create({
        tenantId: tenant.id
      }, { transaction });
    }
    
    await transaction.commit();
    
    return await getTenantById(tenant.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Update a tenant
 * @param {string} id Tenant UUID
 * @param {Object} tenantData Updated tenant data
 * @param {Object} brandingData Optional updated branding
 * @returns {Promise<Tenant>} The updated tenant
 */
async function updateTenant(id, tenantData, brandingData = null) {
  const transaction = await sequelize.transaction();
  
  try {
    // Update tenant
    await Tenant.update(tenantData, {
      where: { id },
      transaction
    });
    
    // Update branding if provided
    if (brandingData) {
      await TenantBranding.update(brandingData, {
        where: { tenantId: id },
        transaction
      });
    }
    
    await transaction.commit();
    
    return await getTenantById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * List all tenants
 * @param {Object} options Query options (limit, offset, etc.)
 * @returns {Promise<Array<Tenant>>} List of tenants
 */
async function listTenants(options = {}) {
  return await Tenant.findAll({
    include: [{ model: TenantBranding, as: 'branding' }],
    ...options
  });
}

module.exports = {
  Tenant,
  TenantBranding,
  getTenantById,
  getTenantByDomain,
  getTenantFromClientMetadata,
  createTenant,
  updateTenant,
  listTenants
};