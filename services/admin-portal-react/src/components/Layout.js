/*
File: Layout.js
Path: services/admin-portal-react/src/components/Layout.js
Purpose: Layout component with sidebar and main content area for the Admin Portal
Last change: Initial creation of the Layout component
*/

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

const Layout = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className={`col-md-${isSidebarCollapsed ? '1' : '3'} col-lg-${isSidebarCollapsed ? '1' : '2'} sidebar p-0`}>
          <div className="d-flex justify-content-between align-items-center p-3">
            {!isSidebarCollapsed && <h4 className="mb-0">Admin Portal</h4>}
            <button 
              className="btn btn-sm btn-outline-light" 
              onClick={toggleSidebar}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <i className={`fas fa-${isSidebarCollapsed ? 'chevron-right' : 'chevron-left'}`}></i>
            </button>
          </div>
          
          <div className="nav flex-column">
            <NavLink to="/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="fas fa-tachometer-alt"></i>
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </NavLink>
            <NavLink to="/clients" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="fas fa-users"></i>
              {!isSidebarCollapsed && <span>Clients</span>}
            </NavLink>
            <NavLink to="/users" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="fas fa-user"></i>
              {!isSidebarCollapsed && <span>Users</span>}
            </NavLink>
            <NavLink to="/settings" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="fas fa-cog"></i>
              {!isSidebarCollapsed && <span>Settings</span>}
            </NavLink>
            <button onClick={handleLogout} className="nav-link border-0 bg-transparent text-start">
              <i className="fas fa-sign-out-alt"></i>
              {!isSidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className={`col-md-${isSidebarCollapsed ? '11' : '9'} col-lg-${isSidebarCollapsed ? '11' : '10'} main-content`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout; 