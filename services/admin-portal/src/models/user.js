// File: user.js
// Path: services/admin-portal/src/models/user.js
// Purpose: User model definition
// Last change: Created a placeholder User model

const { DataTypes, Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

class User extends Model {
  setPassword(password) {
    this.passwordHash = bcrypt.hashSync(password, 10);
  }
  
  verifyPassword(password) {
    return bcrypt.compareSync(password, this.passwordHash);
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
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
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('super-admin', 'admin', 'viewer', 'user'),
    defaultValue: 'user'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending'),
    defaultValue: 'active'
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  profile: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true
});

const createUser = async ({ username, email, password, tenantId, role = 'user', profile = {} }) => {
  const user = User.build({
    username,
    email,
    tenantId,
    role,
    profile,
    status: 'active'
  });
  
  user.setPassword(password);
  await user.save();
  
  return user;
};

const findByUsername = async (username, tenantId = null) => {
  const where = { username };
  if (tenantId) where.tenantId = tenantId;
  
  return await User.findOne({ where });
};

const findByEmail = async (email, tenantId = null) => {
  const where = { email };
  if (tenantId) where.tenantId = tenantId;
  
  return await User.findOne({ where });
};

module.exports = {
  User,
  createUser,
  findByUsername,
  findByEmail
}; 