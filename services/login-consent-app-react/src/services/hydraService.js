/*
File: hydraService.js
Path: services/login-consent-app-react/src/services/hydraService.js
Purpose: Service for interacting with Ory Hydra OAuth2 server
Last change: Initial creation of the Hydra service
*/

import axios from 'axios';

// Base API URL - this will be proxied to the backend server
const API_URL = '/api';

// Login flow
export const getLoginRequest = async (loginChallenge) => {
  try {
    const response = await axios.get(`${API_URL}/login`, {
      params: { login_challenge: loginChallenge }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching login request:', error);
    throw error;
  }
};

export const acceptLogin = async (loginChallenge, data) => {
  try {
    const response = await axios.post(`${API_URL}/login/accept`, {
      login_challenge: loginChallenge,
      ...data
    });
    return response.data;
  } catch (error) {
    console.error('Error accepting login:', error);
    throw error;
  }
};

export const rejectLogin = async (loginChallenge, error) => {
  try {
    const response = await axios.post(`${API_URL}/login/reject`, {
      login_challenge: loginChallenge,
      error
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting login:', error);
    throw error;
  }
};

// Consent flow
export const getConsentRequest = async (consentChallenge) => {
  try {
    const response = await axios.get(`${API_URL}/consent`, {
      params: { consent_challenge: consentChallenge }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching consent request:', error);
    throw error;
  }
};

export const acceptConsent = async (consentChallenge, data) => {
  try {
    const response = await axios.post(`${API_URL}/consent/accept`, {
      consent_challenge: consentChallenge,
      ...data
    });
    return response.data;
  } catch (error) {
    console.error('Error accepting consent:', error);
    throw error;
  }
};

export const rejectConsent = async (consentChallenge, error) => {
  try {
    const response = await axios.post(`${API_URL}/consent/reject`, {
      consent_challenge: consentChallenge,
      error
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting consent:', error);
    throw error;
  }
};

// Logout flow
export const getLogoutRequest = async (logoutChallenge) => {
  try {
    const response = await axios.get(`${API_URL}/logout`, {
      params: { logout_challenge: logoutChallenge }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching logout request:', error);
    throw error;
  }
};

export const acceptLogout = async (logoutChallenge) => {
  try {
    const response = await axios.post(`${API_URL}/logout/accept`, {
      logout_challenge: logoutChallenge
    });
    return response.data;
  } catch (error) {
    console.error('Error accepting logout:', error);
    throw error;
  }
};

export const rejectLogout = async (logoutChallenge, error) => {
  try {
    const response = await axios.post(`${API_URL}/logout/reject`, {
      logout_challenge: logoutChallenge,
      error
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting logout:', error);
    throw error;
  }
}; 