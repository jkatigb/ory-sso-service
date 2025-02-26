/*
File: DashboardPage.js
Path: services/admin-portal-react/src/pages/DashboardPage.js
Purpose: Dashboard page component displaying system overview and metrics
Last change: Initial creation of the Dashboard page component
*/

import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalLogins: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // For this example, we'll use mock data
    const fetchDashboardData = () => {
      setTimeout(() => {
        setStats({
          totalClients: 12,
          totalUsers: 256,
          activeUsers: 128,
          totalLogins: 1024
        });
        setIsLoading(false);
      }, 1000);
    };

    fetchDashboardData();
  }, []);

  // Mock data for charts
  const userTypeData = {
    labels: ['Active Users', 'Inactive Users'],
    datasets: [
      {
        data: [stats.activeUsers, stats.totalUsers - stats.activeUsers],
        backgroundColor: ['#4285f4', '#e0e0e0'],
        borderWidth: 0,
      },
    ],
  };

  const loginActivityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Login Activity',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: '#4285f4',
        backgroundColor: 'rgba(66, 133, 244, 0.1)',
        tension: 0.4,
      },
    ],
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
      <h1 className="mb-4">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Total Clients</h5>
              <p className="card-text display-6">{stats.totalClients}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Total Users</h5>
              <p className="card-text display-6">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Active Users</h5>
              <p className="card-text display-6">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Total Logins</h5>
              <p className="card-text display-6">{stats.totalLogins}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="row">
        <div className="col-md-6">
          <div className="card dashboard-card">
            <div className="card-body">
              <h5 className="card-title">User Types</h5>
              <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                <Doughnut 
                  data={userTypeData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Login Activity</h5>
              <div style={{ height: '250px' }}>
                <Line 
                  data={loginActivityData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Recent Activity</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>User</th>
                      <th>Client</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Login</td>
                      <td>user@example.com</td>
                      <td>Example Client</td>
                      <td>5 minutes ago</td>
                    </tr>
                    <tr>
                      <td>Consent</td>
                      <td>another@example.com</td>
                      <td>Test Application</td>
                      <td>15 minutes ago</td>
                    </tr>
                    <tr>
                      <td>Logout</td>
                      <td>third@example.com</td>
                      <td>Demo App</td>
                      <td>1 hour ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 