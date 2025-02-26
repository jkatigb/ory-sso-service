/*
File: ClientsPage.js
Path: services/admin-portal-react/src/pages/ClientsPage.js
Purpose: Client management page for creating and managing OAuth clients
Last change: Initial creation of the Clients page component
*/

import React, { useState, useEffect } from 'react';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    redirectUris: '',
    grantTypes: {
      authorization_code: true,
      client_credentials: false,
      implicit: false,
      refresh_token: true
    },
    scopes: {
      openid: true,
      offline: true,
      profile: true,
      email: false,
      address: false,
      phone: false
    },
    description: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = () => {
    // In a real application, you would fetch this data from your API
    // For this example, we'll use mock data
    setTimeout(() => {
      setClients([
        {
          id: 'client-1',
          name: 'Example Web App',
          clientId: 'ab123cdef456ghij',
          clientSecret: '********',
          redirectUris: ['https://example.com/callback'],
          grantTypes: ['authorization_code', 'refresh_token'],
          scopes: ['openid', 'offline', 'profile'],
          createdAt: '2023-06-01',
          status: 'active'
        },
        {
          id: 'client-2',
          name: 'Mobile Application',
          clientId: 'kl789mnop012qrst',
          clientSecret: '********',
          redirectUris: ['com.example.app://callback'],
          grantTypes: ['authorization_code', 'refresh_token'],
          scopes: ['openid', 'offline', 'profile', 'email'],
          createdAt: '2023-06-10',
          status: 'active'
        },
        {
          id: 'client-3',
          name: 'Backend Service',
          clientId: 'uv345wxyz678abcd',
          clientSecret: '********',
          redirectUris: [],
          grantTypes: ['client_credentials'],
          scopes: ['api:read', 'api:write'],
          createdAt: '2023-06-15',
          status: 'inactive'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({
      ...newClient,
      [name]: value
    });
  };

  const handleCheckboxChange = (e, category) => {
    const { name, checked } = e.target;
    
    setNewClient({
      ...newClient,
      [category]: {
        ...newClient[category],
        [name]: checked
      }
    });
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    
    // Convert checked grant types and scopes to arrays
    const grantTypes = Object.entries(newClient.grantTypes)
      .filter(([_, checked]) => checked)
      .map(([type]) => type);
      
    const scopes = Object.entries(newClient.scopes)
      .filter(([_, checked]) => checked)
      .map(([scope]) => scope);
    
    // In a real application, you would send this data to your API
    // For this example, we'll just update the local state
    const newClientObj = {
      id: `client-${clients.length + 1}`,
      name: newClient.name,
      clientId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      clientSecret: '********',
      redirectUris: newClient.redirectUris.split(',').map(uri => uri.trim()).filter(Boolean),
      grantTypes,
      scopes,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    
    setClients([...clients, newClientObj]);
    setShowAddModal(false);
    setNewClient({
      name: '',
      redirectUris: '',
      grantTypes: {
        authorization_code: true,
        client_credentials: false,
        implicit: false,
        refresh_token: true
      },
      scopes: {
        openid: true,
        offline: true,
        profile: true,
        email: false,
        address: false,
        phone: false
      },
      description: ''
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="badge bg-success">Active</span>;
    } else if (status === 'inactive') {
      return <span className="badge bg-secondary">Inactive</span>;
    } else {
      return <span className="badge bg-secondary">{status}</span>;
    }
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>OAuth Clients</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus me-2"></i>Add Client
        </button>
      </div>
      
      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Client ID</th>
                <th>Redirect URIs</th>
                <th>Grant Types</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>
                    <small>{client.clientId}</small>
                  </td>
                  <td>
                    {client.redirectUris.length > 0 ? (
                      <ul className="list-unstyled mb-0">
                        {client.redirectUris.map((uri, index) => (
                          <li key={index}><small>{uri}</small></li>
                        ))}
                      </ul>
                    ) : (
                      <small className="text-muted">None</small>
                    )}
                  </td>
                  <td>
                    {client.grantTypes.map((type, index) => (
                      <span key={index} className="badge bg-info me-1 mb-1">{type}</span>
                    ))}
                  </td>
                  <td>{client.createdAt}</td>
                  <td>{getStatusBadge(client.status)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add Client Modal */}
      {showAddModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New OAuth Client</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddClient}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Client Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={newClient.name}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="form-text">A human-readable name for your application</div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="redirectUris" className="form-label">Redirect URIs</label>
                    <textarea
                      className="form-control"
                      id="redirectUris"
                      name="redirectUris"
                      value={newClient.redirectUris}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="https://example.com/callback, https://app.example.com/callback"
                    ></textarea>
                    <div className="form-text">Comma-separated list of allowed redirect URIs</div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Grant Types</label>
                    <div className="row">
                      {Object.entries(newClient.grantTypes).map(([type, checked]) => (
                        <div className="col-md-6" key={type}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`grant-${type}`}
                              name={type}
                              checked={checked}
                              onChange={(e) => handleCheckboxChange(e, 'grantTypes')}
                            />
                            <label className="form-check-label" htmlFor={`grant-${type}`}>
                              {type.replace('_', ' ')}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Scopes</label>
                    <div className="row">
                      {Object.entries(newClient.scopes).map(([scope, checked]) => (
                        <div className="col-md-4" key={scope}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`scope-${scope}`}
                              name={scope}
                              checked={checked}
                              onChange={(e) => handleCheckboxChange(e, 'scopes')}
                            />
                            <label className="form-check-label" htmlFor={`scope-${scope}`}>
                              {scope}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={newClient.description}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Create Client
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage; 