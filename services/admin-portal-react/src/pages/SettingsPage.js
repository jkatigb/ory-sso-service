/*
File: SettingsPage.js
Path: services/admin-portal-react/src/pages/SettingsPage.js
Purpose: Settings page component for configuring system settings
Last change: Initial creation of the Settings page component
*/

import React, { useState, useEffect } from 'react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'SSO-as-a-Service',
      supportEmail: 'support@example.com',
      sessionTimeout: 30
    },
    security: {
      mfaEnabled: true,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      loginAttempts: 5
    },
    appearance: {
      theme: 'light',
      logoUrl: '',
      primaryColor: '#4285f4'
    }
  });
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // For this example, we'll use mock data
    const fetchSettings = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };

    fetchSettings();
  }, []);

  const handleInputChange = (category, field, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [field]: value
      }
    });
  };

  const handleNestedInputChange = (category, nestedCategory, field, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [nestedCategory]: {
          ...settings[category][nestedCategory],
          [field]: value
        }
      }
    });
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    
    // In a real application, you would send this data to your API
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">Settings</h1>
      
      {saveSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          Settings saved successfully!
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSaveSuccess(false)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <div className="row">
        <div className="col-md-3">
          <div className="list-group mb-4">
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              Appearance
            </button>
          </div>
        </div>
        
        <div className="col-md-9">
          <div className="form-container">
            <form onSubmit={handleSaveSettings}>
              {/* General Settings */}
              {activeTab === 'general' && (
                <div>
                  <h3 className="mb-4">General Settings</h3>
                  
                  <div className="mb-3">
                    <label htmlFor="siteName" className="form-label">Site Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="siteName"
                      value={settings.general.siteName}
                      onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="supportEmail" className="form-label">Support Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="supportEmail"
                      value={settings.general.supportEmail}
                      onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="sessionTimeout" className="form-label">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="sessionTimeout"
                      value={settings.general.sessionTimeout}
                      onChange={(e) => handleInputChange('general', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}
              
              {/* Security Settings */}
              {activeTab === 'security' && (
                <div>
                  <h3 className="mb-4">Security Settings</h3>
                  
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="mfaEnabled"
                      checked={settings.security.mfaEnabled}
                      onChange={(e) => handleInputChange('security', 'mfaEnabled', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="mfaEnabled">
                      Enable Multi-Factor Authentication
                    </label>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="loginAttempts" className="form-label">Max Login Attempts</label>
                    <input
                      type="number"
                      className="form-control"
                      id="loginAttempts"
                      value={settings.security.loginAttempts}
                      onChange={(e) => handleInputChange('security', 'loginAttempts', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <h5 className="mt-4 mb-3">Password Policy</h5>
                  
                  <div className="mb-3">
                    <label htmlFor="minLength" className="form-label">Minimum Length</label>
                    <input
                      type="number"
                      className="form-control"
                      id="minLength"
                      value={settings.security.passwordPolicy.minLength}
                      onChange={(e) => handleNestedInputChange('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="requireUppercase"
                      checked={settings.security.passwordPolicy.requireUppercase}
                      onChange={(e) => handleNestedInputChange('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="requireUppercase">
                      Require Uppercase Letters
                    </label>
                  </div>
                  
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="requireLowercase"
                      checked={settings.security.passwordPolicy.requireLowercase}
                      onChange={(e) => handleNestedInputChange('security', 'passwordPolicy', 'requireLowercase', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="requireLowercase">
                      Require Lowercase Letters
                    </label>
                  </div>
                  
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="requireNumbers"
                      checked={settings.security.passwordPolicy.requireNumbers}
                      onChange={(e) => handleNestedInputChange('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="requireNumbers">
                      Require Numbers
                    </label>
                  </div>
                  
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="requireSpecialChars"
                      checked={settings.security.passwordPolicy.requireSpecialChars}
                      onChange={(e) => handleNestedInputChange('security', 'passwordPolicy', 'requireSpecialChars', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="requireSpecialChars">
                      Require Special Characters
                    </label>
                  </div>
                </div>
              )}
              
              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div>
                  <h3 className="mb-4">Appearance Settings</h3>
                  
                  <div className="mb-3">
                    <label htmlFor="theme" className="form-label">Theme</label>
                    <select
                      className="form-select"
                      id="theme"
                      value={settings.appearance.theme}
                      onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System Preference)</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="logoUrl" className="form-label">Logo URL</label>
                    <input
                      type="text"
                      className="form-control"
                      id="logoUrl"
                      value={settings.appearance.logoUrl}
                      onChange={(e) => handleInputChange('appearance', 'logoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                    <div className="form-text">Leave empty to use default logo</div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="primaryColor" className="form-label">Primary Color</label>
                    <div className="input-group">
                      <input
                        type="color"
                        className="form-control form-control-color"
                        id="primaryColor"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)}
                        title="Choose primary color"
                      />
                      <input
                        type="text"
                        className="form-control"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="d-flex justify-content-end mt-4">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 