/*
File: ErrorPage.js
Path: services/login-consent-app-react/src/pages/ErrorPage.js
Purpose: Error page component for displaying error messages
Last change: Initial creation of the Error page component
*/

import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const ErrorPage = () => {
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get('error') || 'An unknown error occurred';
  const errorDescription = searchParams.get('error_description') || 'Please try again or contact support if the problem persists.';

  return (
    <div className="container">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Error</h2>
        </div>

        <div className="error-container">
          <h4>{errorMessage}</h4>
          <p>{errorDescription}</p>
        </div>

        <div className="d-grid gap-2 mt-4">
          <Link to="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>

        <div className="auth-footer mt-4">
          <p>If you continue to experience issues, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 