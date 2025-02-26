/*
File: LoginPage.js
Path: services/login-consent-app-react/src/pages/LoginPage.js
Purpose: Login page component for user authentication
Last change: Added EnterpriseLogin component for business SSO
*/

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getLoginRequest, acceptLogin, rejectLogin } from '../services/hydraService';
import EnterpriseLogin from '../components/EnterpriseLogin';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loginChallenge, setLoginChallenge] = useState('');
  const [loginRequest, setLoginRequest] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const challenge = searchParams.get('login_challenge');
    if (!challenge) {
      setError('Login challenge is missing');
      setIsLoading(false);
      return;
    }

    setLoginChallenge(challenge);
    fetchLoginRequest(challenge);
  }, [searchParams]);

  const fetchLoginRequest = async (challenge) => {
    try {
      setIsLoading(true);
      const data = await getLoginRequest(challenge);
      setLoginRequest(data);
      
      // If skip is true, accept the login request
      if (data.skip) {
        handleAcceptLogin({ skip: true });
        return;
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching login request:', error);
      setError('Failed to fetch login request');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    try {
      setIsLoading(true);
      
      // In a real application, you would validate credentials against your user database
      // For this example, we'll accept any non-empty username/password
      if (username && password) {
        await handleAcceptLogin({
          subject: username,
          remember: true,
          remember_for: 3600 // 1 hour
        });
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Authentication failed');
      setIsLoading(false);
    }
  };

  const handleAcceptLogin = async (data) => {
    try {
      const response = await acceptLogin(loginChallenge, data);
      // Redirect to the redirect_to URL from the response
      window.location.href = response.redirect_to;
    } catch (error) {
      console.error('Error accepting login:', error);
      setError('Failed to complete login');
      setIsLoading(false);
    }
  };

  const handleRejectLogin = async () => {
    try {
      setIsLoading(true);
      const response = await rejectLogin(loginChallenge, 'User rejected login');
      // Redirect to the redirect_to URL from the response
      window.location.href = response.redirect_to;
    } catch (error) {
      console.error('Error rejecting login:', error);
      setError('Failed to reject login');
      setIsLoading(false);
    }
  };

  // Handle Azure AD login
  const handleAzureLogin = () => {
    // Redirect to the Azure AD login endpoint with the login_challenge
    window.location.href = `/api/auth/azure?login_challenge=${loginChallenge}`;
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="auth-container">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Sign In</h2>
          {loginRequest && loginRequest.client && (
            <p>Sign in to continue to {loginRequest.client.client_name || 'the application'}</p>
          )}
        </div>

        {error && (
          <div className="error-container">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary">Sign In</button>
            <button type="button" className="btn btn-outline-secondary" onClick={handleRejectLogin}>
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="mb-2">Or sign in with:</p>
          <button 
            type="button" 
            className="btn btn-outline-primary mb-2" 
            onClick={handleAzureLogin}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-microsoft me-2" viewBox="0 0 16 16">
              <path d="M7.462 0H0v7.19h7.462V0zM16 0H8.538v7.19H16V0zM7.462 8.211H0V16h7.462V8.211zm8.538 0H8.538V16H16V8.211z"/>
            </svg>
            Microsoft Account
          </button>
          
          {/* Enterprise Login Component */}
          <EnterpriseLogin loginChallenge={loginChallenge} />
        </div>

        <div className="auth-footer">
          <p>This login is secured by Ory Hydra OAuth2 Server</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 