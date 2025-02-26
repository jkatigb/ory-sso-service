/*
File: EnterpriseLogin.js
Path: services/login-consent-app-react/src/components/EnterpriseLogin.js
Purpose: Component for enterprise SSO login with tenant selection
Last change: Initial creation of the EnterpriseLogin component
Dependencies: react, axios
*/

import React, { useState } from 'react';

const EnterpriseLogin = ({ loginChallenge }) => {
  const [email, setEmail] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  
  // Handle the "Continue" button click
  const handleContinue = (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Extract the domain from the email
    const domain = email.split('@')[1];
    
    // Redirect to Azure AD with domain_hint
    window.location.href = `/api/auth/azure?login_challenge=${loginChallenge}&domain_hint=${domain}`;
  };
  
  return (
    <div className="enterprise-login mt-4">
      <h5 className="text-center mb-3">Enterprise Sign In</h5>
      
      {!showOptions ? (
        <button 
          type="button"
          className="btn btn-outline-secondary w-100"
          onClick={() => setShowOptions(true)}
        >
          Sign in with your organization
        </button>
      ) : (
        <form onSubmit={handleContinue}>
          <div className="mb-3">
            <label htmlFor="enterpriseEmail" className="form-label">Work Email</label>
            <input
              type="email"
              className="form-control"
              id="enterpriseEmail"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <small className="form-text text-muted">
              We'll use your email domain to find your organization's sign-in page.
            </small>
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-outline-primary">
              Continue
            </button>
          </div>
          <div className="text-center mt-2">
            <button 
              type="button" 
              className="btn btn-link btn-sm text-muted"
              onClick={() => setShowOptions(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EnterpriseLogin; 