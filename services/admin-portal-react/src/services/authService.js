/*
File: authService.js
Path: services/admin-portal-react/src/services/authService.js
Purpose: Service for handling authentication-related functionality
Last change: Initial creation of the authentication service
*/

import axios from 'axios';

// Base API URL - this will be proxied to the backend server
const API_URL = '/api';

// Mock token storage - in a real app, you would use secure storage methods
const TOKEN_KEY = 'admin_auth_token';

/**
 * Attempts to log in a user with the provided credentials
 * @param {string} username - The user's username
 * @param {string} password - The user's password
 * @returns {Promise<{success: boolean, token?: string, message?: string}>}
 */
export const login = async (username, password) => {
  // In a real application, this would be an API call to your authentication endpoint
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock authentication logic
      if (username === 'admin' && password === 'password') {
        const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
        localStorage.setItem(TOKEN_KEY, token);
        resolve({ success: true, token });
      } else {
        resolve({ success: false, message: 'Invalid username or password' });
      }
    }, 1000); // Simulate network delay
  });
};

/**
 * Logs out the current user by removing their authentication token
 * @returns {Promise<{success: boolean}>}
 */
export const logout = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem(TOKEN_KEY);
      resolve({ success: true });
    }, 500);
  });
};

/**
 * Checks if the user is currently authenticated
 * @returns {Promise<boolean>}
 */
export const isAuthenticated = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const token = localStorage.getItem(TOKEN_KEY);
      resolve(!!token);
    }, 500);
  });
};

/**
 * Gets the current authentication token
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Refreshes the current authentication token
 * @returns {Promise<{success: boolean, token?: string, message?: string}>}
 */
export const refreshToken = async () => {
  // In a real application, this would call your token refresh endpoint
  return new Promise((resolve) => {
    setTimeout(() => {
      const currentToken = localStorage.getItem(TOKEN_KEY);
      
      if (currentToken) {
        const newToken = 'refreshed-jwt-token-' + Math.random().toString(36).substring(2);
        localStorage.setItem(TOKEN_KEY, newToken);
        resolve({ success: true, token: newToken });
      } else {
        resolve({ success: false, message: 'No token to refresh' });
      }
    }, 1000);
  });
};

/**
 * Gets the current user's information
 * @returns {Promise<{id: string, username: string, role: string, name: string}|null>}
 */
export const getCurrentUser = async () => {
  // In a real application, this would decode the JWT or call an endpoint
  return new Promise((resolve) => {
    setTimeout(() => {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (token) {
        resolve({
          id: '1',
          username: 'admin',
          role: 'administrator',
          name: 'Admin User'
        });
      } else {
        resolve(null);
      }
    }, 500);
  });
};

// Check if user is authenticated
export const getAuthStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/status`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { isAuthenticated: false };
  }
}; 