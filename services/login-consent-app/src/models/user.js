const { Sequelize, DataTypes, Model } = require('sequelize');
const crypto = require('crypto');

// Get the Sequelize instance from the main app
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: false
});

/**
 * User model - represents a user in a tenant
 */
class User extends Model {
  /**
   * Check if a password is valid for this user
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
   * Set the password for this user
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
   * Generate a JWT token for this user
   * @returns {string} JWT token
   */
  generateToken() {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60); // Token expires in 60 days

    return jwt.sign({
      id: this.id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000)
    }, process.env.JWT_SECRET || 'secret');
  }

  /**
   * Return public user data (sanitized for response)
   * @returns {Object} Public user data
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      tenantId: this.tenantId,
      profile: this.profile,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  hash: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  salt: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profile: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'inactive', 'suspended']]
    }
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['username', 'tenantId']
    },
    {
      unique: true,
      fields: ['email', 'tenantId']
    }
  ]
});

/**
 * Find a user by username within a tenant
 * @param {string} username The username to look for
 * @param {string} tenantId The tenant UUID
 * @returns {Promise<User>} The user if found
 */
async function findByUsername(username, tenantId) {
  return await User.findOne({
    where: {
      username,
      tenantId,
      status: 'active'
    }
  });
}

/**
 * Find a user by email within a tenant
 * @param {string} email The email to look for
 * @param {string} tenantId The tenant UUID
 * @returns {Promise<User>} The user if found
 */
async function findByEmail(email, tenantId) {
  return await User.findOne({
    where: {
      email,
      tenantId,
      status: 'active'
    }
  });
}

/**
 * Create a new user
 * @param {Object} userData User data including plain text password
 * @returns {Promise<User>} The created user
 */
async function createUser(userData) {
  const user = new User({
    tenantId: userData.tenantId,
    username: userData.username,
    email: userData.email,
    profile: userData.profile || {}
  });

  user.setPassword(userData.password);
  await user.save();
  return user;
}

/**
 * Authenticate a user with username and password
 * @param {string} username The username
 * @param {string} password The password
 * @param {string} tenantId The tenant UUID
 * @returns {Promise<User>} The authenticated user or null
 */
async function authenticate(username, password, tenantId) {
  const user = await findByUsername(username, tenantId);
  if (!user) {
    return null;
  }

  const isValid = user.validatePassword(password);
  if (!isValid) {
    return null;
  }

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save();

  return user;
}

module.exports = {
  User,
  findByUsername,
  findByEmail,
  createUser,
  authenticate
};