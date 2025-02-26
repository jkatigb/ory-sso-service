/*
File: App.js
Path: services/login-consent-app-react/src/App.js
Purpose: Main application component with routing setup
Last change: Initial creation of the App component with React Router
*/

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ConsentPage from './pages/ConsentPage';
import LogoutPage from './pages/LogoutPage';
import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/consent" element={<ConsentPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </Router>
  );
}

export default App; 