/*
File: LogoutPage.js
Path: services/login-consent-app-react/src/pages/LogoutPage.js
Purpose: Logout page component for user sign-out
Last change: Initial creation of the Logout page component
*/

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getLogoutRequest, acceptLogout, rejectLogout } from '../services/hydraService';

const LogoutPage = () => {
  const [searchParams] = useSearchParams();
  const [logoutChallenge, setLogoutChallenge] = useState('');
  const [logoutRequest, setLogoutRequest] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const challenge = searchParams.get('logout_challenge');
    if (!challenge) {
      setError('Logout challenge is missing');
      setIsLoading(false);
      return;
    }

    setLogoutChallenge(challenge);
    fetchLogoutRequest(challenge);
  }, [searchParams]);

  const fetchLogoutRequest = async (challenge) => {
    try {
      setIsLoading(true);
      const data = await getLogoutRequest(challenge);
      setLogoutRequest(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching logout request:', error);
      setError('Failed to fetch logout request');
      setIsLoading(false);
    }
  };

  const handleAcceptLogout = async () => {
    try {
      setIsLoading(true);
      const response = await acceptLogout(logoutChallenge);
      // Redirect to the redirect_to URL from the response
      window.location.href = response.redirect_to;
    } catch (error) {
      console.error('Error accepting logout:', error);
      setError('Failed to complete logout');
      setIsLoading(false);
    }
  };

  const handleRejectLogout = async () => {
    try {
      setIsLoading(true);
      const response = await rejectLogout(logoutChallenge, 'User rejected logout');
      // Redirect to the redirect_to URL from the response
      window.location.href = response.redirect_to;
    } catch (error) {
      console.error('Error rejecting logout:', error);
      setError('Failed to reject logout');
      setIsLoading(false);
    }
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
          <h2>Sign Out</h2>
          <p>Are you sure you want to sign out?</p>
        </div>

        {error && (
          <div className="error-container">
            {error}
          </div>
        )}

        <div className="d-grid gap-2">
          <button 
            className="btn btn-primary" 
            onClick={handleAcceptLogout}
          >
            Yes, Sign Out
          </button>
          <button 
            className="btn btn-outline-secondary" 
            onClick={handleRejectLogout}
          >
            No, Stay Signed In
          </button>
        </div>

        <div className="auth-footer mt-4">
          <p>You will be signed out from all applications</p>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage; 