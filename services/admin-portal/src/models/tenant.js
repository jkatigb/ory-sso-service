const { Sequelize, DataTypes, Model } = require('sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

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

/**
 * TenantAdmin model - represents admin users for each tenant
 */
class TenantAdmin extends Model {
  /**
   * Check if a password is valid for this admin
   * @param {string} password The plain text password to verify
   * @returns {boolean} True if password matches
   */
  validatePassword(password) {
    const hash = crypto.pbkdf2Sync(
      password, 
      this.salt, 
      10000, 
      512, 
      'sha512'
    ).toString('hex');
    return this.hash === hash;
  }

  /**
   * Set the password for this admin
   * @param {string} password The plain text password to set
   */
  setPassword(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(
      password,
      this.salt,
      10000,
      512,
      'sha512'
    ).toString('hex');
  }

  /**
   * Generate a JWT token for this admin
   * @returns {string} JWT token
   */
  generateToken() {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 7); // Token expires in 7 days

    return jwt.sign({
      id: this.id,
      email: this.email,
      tenantId: this.tenantId,
      role: this.role,
      exp: parseInt(exp.getTime() / 1000)
    }, process.env.JWT_SECRET || 'secret');
  }

  /**
   * Return public admin data (sanitized for response)
   * @returns {Object} Public admin data
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      tenantId: this.tenantId,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

TenantAdmin.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true, // Null for super-admins (system-wide admins)
    references: {
      model: Tenant,
      key: 'id'
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hash: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  salt: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'admin',
    validate: {
      isIn: [['super-admin', 'admin', 'viewer']]
    }
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'TenantAdmin',
  tableName: 'tenant_admins',
  timestamps: true
});

// Set up associations
Tenant.hasOne(TenantBranding, { foreignKey: 'tenantId', as: 'branding' });
TenantBranding.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(TenantAdmin, { foreignKey: 'tenantId', as: 'admins' });
TenantAdmin.belongsTo(Tenant, { foreignKey: 'tenantId' });

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
    await TenantBranding.create({
      tenantId: tenant.id,
      ...brandingData
    }, { transaction });
    
    await transaction.commit();
    
    return await getTenantById(tenant.id);
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

/**
 * Authenticate a tenant admin
 * @param {string} email Admin email
 * @param {string} password Admin password
 * @returns {Promise<Object>} Authenticated admin with token
 */
async function authenticateAdmin(email, password) {
  const admin = await TenantAdmin.findOne({ 
    where: { 
      email, 
      active: true 
    } 
  });
  
  if (!admin || !admin.validatePassword(password)) {
    return null;
  }
  
  // Update last login
  admin.lastLogin = new Date();
  await admin.save();
  
  // Generate token
  const token = admin.generateToken();
  
  return {
    admin: admin.toJSON(),
    token
  };
}

/**
 * Create a new tenant admin
 * @param {Object} adminData Admin data
 * @returns {Promise<TenantAdmin>} Created admin
 */
async function createTenantAdmin(adminData) {
  const admin = new TenantAdmin({
    tenantId: adminData.tenantId,
    email: adminData.email,
    name: adminData.name,
    role: adminData.role || 'admin'
  });
  
  admin.setPassword(adminData.password);
  await admin.save();
  
  return admin;
}

module.exports = {
  Tenant,
  TenantBranding,
  TenantAdmin,
  getTenantById,
  createTenant,
  listTenants,
  authenticateAdmin,
  createTenantAdmin
};