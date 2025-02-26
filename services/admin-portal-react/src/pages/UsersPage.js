/*
File: UsersPage.js
Path: services/admin-portal-react/src/pages/UsersPage.js
Purpose: Users page component for managing users in the system
Last change: Initial creation of the Users page component
*/

import React, { useState, useEffect } from 'react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user'
  });

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // For this example, we'll use mock data
    const fetchUsers = () => {
      setTimeout(() => {
        setUsers([
          {
            id: '1',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'admin',
            lastLogin: '2023-06-15 14:30:22',
            status: 'active'
          },
          {
            id: '2',
            email: 'jane.smith@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            role: 'user',
            lastLogin: '2023-06-14 09:15:45',
            status: 'active'
          },
          {
            id: '3',
            email: 'bob.johnson@example.com',
            firstName: 'Bob',
            lastName: 'Johnson',
            role: 'user',
            lastLogin: '2023-06-10 11:22:33',
            status: 'inactive'
          }
        ]);
        setIsLoading(false);
      }, 1000);
    };

    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value
    });
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    
    // In a real application, you would send this data to your API
    // For this example, we'll just update the local state
    const newUserObj = {
      id: String(users.length + 1),
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      lastLogin: 'Never',
      status: 'active'
    };
    
    setUsers([...users, newUserObj]);
    setShowAddModal(false);
    setNewUser({
      email: '',
      firstName: '',
      lastName: '',
      role: 'user'
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="badge bg-success">Active</span>;
    } else if (status === 'inactive') {
      return <span className="badge bg-secondary">Inactive</span>;
    } else if (status === 'suspended') {
      return <span className="badge bg-warning text-dark">Suspended</span>;
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
        <h1>Users</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus me-2"></i>Add User
        </button>
      </div>
      
      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.lastLogin}</td>
                  <td>{getStatusBadge(user.status)}</td>
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
      
      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New User</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddUser}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      name="firstName"
                      value={newUser.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      name="lastName"
                      value={newUser.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">Role</label>
                    <select
                      className="form-select"
                      id="role"
                      name="role"
                      value={newUser.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
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
                      Create User
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

export default UsersPage; 