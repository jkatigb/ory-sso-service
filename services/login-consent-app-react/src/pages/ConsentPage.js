/*
File: ConsentPage.js
Path: services/login-consent-app-react/src/pages/ConsentPage.js
Purpose: Consent page component for OAuth2 authorization
Last change: Initial creation of the Consent page component
*/

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getConsentRequest, acceptConsent, rejectConsent } from '../services/hydraService';

const ConsentPage = () => {
  const [searchParams] = useSearchParams();
  const [consentChallenge, setConsentChallenge] = useState('');
  const [consentRequest, setConsentRequest] = useState(null);
  const [selectedScopes, setSelectedScopes] = useState([]);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const challenge = searchParams.get('consent_challenge');
    if (!challenge) {
      setError('Consent challenge is missing');
      setIsLoading(false);
      return;
    }

    setConsentChallenge(challenge);
    fetchConsentRequest(challenge);
  }, [searchParams]);

  const fetchConsentRequest = async (challenge) => {
    try {
      setIsLoading(true);
      const data = await getConsentRequest(challenge);
      setConsentRequest(data);
      
      // If skip is true, accept the consent request
      if (data.skip) {
        handleAcceptConsent({
          grant_scope: data.requested_scope,
          remember: true,
          remember_for: 3600 // 1 hour
        });
        return;
      }
      
      // Initialize selected scopes with all requested scopes
      setSelectedScopes(data.requested_scope || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching consent request:', error);
      setError('Failed to fetch consent request');
      setIsLoading(false);
    }
  };

  const handleScopeChange = (scope) => {
    setSelectedScopes(prev => {
      if (prev.includes(scope)) {
        return prev.filter(s => s !== scope);
      } else {
        return [...prev, scope];
      }
    });
  };

  const handleAcceptConsent = async (data) => {
    try {
      setIsLoading(true);
      const response = await acceptConsent(consentChallenge, data);
      // Redirect to the redirect_to URL from the response
      window.location.href = response.redirect_to;
    } catch (error) {
      console.error('Error accepting consent:', error);
      setError('Failed to complete consent');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedScopes.length === 0) {
      setError('You must select at least one permission');
      return;
    }

    await handleAcceptConsent({
      grant_scope: selectedScopes,
      remember: remember,
      remember_for: 3600 // 1 hour
    });
  };

  const handleRejectConsent = async () => {
    try {
      setIsLoading(true);
      const response = await rejectConsent(consentChallenge, 'User rejected consent');
      // Redirect to the redirect_to URL from the response
      window.location.href = response.redirect_to;
    } catch (error) {
      console.error('Error rejecting consent:', error);
      setError('Failed to reject consent');
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
          <h2>Authorize Application</h2>
          {consentRequest && consentRequest.client && (
            <p>
              <strong>{consentRequest.client.client_name || 'An application'}</strong> wants to access your account
            </p>
          )}
        </div>

        {error && (
          <div className="error-container">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="consent-scopes">
            <p>This application would like permission to:</p>
            
            {consentRequest && consentRequest.requested_scope && consentRequest.requested_scope.map(scope => (
              <div className="form-check consent-scope-item" key={scope}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`scope-${scope}`}
                  checked={selectedScopes.includes(scope)}
                  onChange={() => handleScopeChange(scope)}
                />
                <label className="form-check-label" htmlFor={`scope-${scope}`}>
                  {getScopeDescription(scope)}
                </label>
              </div>
            ))}
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="remember">
              Remember this decision
            </label>
          </div>

          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary">Allow Access</button>
            <button type="button" className="btn btn-outline-secondary" onClick={handleRejectConsent}>
              Cancel
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>You will be redirected to the application after authorization</p>
        </div>
      </div>
    </div>
  );
};

// Helper function to get human-readable descriptions for OAuth scopes
const getScopeDescription = (scope) => {
  const scopeDescriptions = {
    'openid': 'Verify your identity',
    'offline': 'Access your data when you are not logged in',
    'profile': 'Access your profile information',
    'email': 'Access your email address',
    'address': 'Access your address information',
    'phone': 'Access your phone number',
    // Add more scope descriptions as needed
  };

  return scopeDescriptions[scope] || `Access to ${scope}`;
};

export default ConsentPage; 