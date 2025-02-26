const jwt = require('jsonwebtoken');
const { TenantAdmin } = require('../models/tenant');

/**
 * Extract and verify the JWT token from request headers
 * @param {Object} req Express request object
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function getTokenFromRequest(req) {
  // Get the authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  // Extract the token
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return null;
  }
  
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
}

/**
 * Authenticate middleware - verifies JWT and loads user
 * @param {Array<string>} allowedRoles Roles that can access the route
 * @returns {Function} Express middleware
 */
function authenticate(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      // Get token payload
      const payload = getTokenFromRequest(req);
      
      if (!payload) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Fetch the admin from the database to ensure they still exist and are active
      const admin = await TenantAdmin.findOne({
        where: {
          id: payload.id,
          active: true
        }
      });
      
      if (!admin) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Check if the role is allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(admin.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Attach the admin to the request
      req.user = admin.toJSON();
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Optional authentication middleware - tries to authenticate but doesn't fail if no token
 * @returns {Function} Express middleware
 */
function optionalAuth() {
  return async (req, res, next) => {
    try {
      // Get token payload
      const payload = getTokenFromRequest(req);
      
      if (!payload) {
        // No token, continue without setting req.user
        return next();
      }
      
      // Fetch the admin from the database
      const admin = await TenantAdmin.findOne({
        where: {
          id: payload.id,
          active: true
        }
      });
      
      if (admin) {
        // Attach the admin to the request
        req.user = admin.toJSON();
      }
      
      next();
    } catch (error) {
      // Don't fail on auth errors, just continue without authentication
      next();
    }
  };
}

module.exports = {
  authenticate,
  optionalAuth
};