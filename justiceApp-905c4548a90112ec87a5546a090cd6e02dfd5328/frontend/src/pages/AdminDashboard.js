import React, { useState, useEffect, useCallback } from 'react';
import { API } from '../config/api';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/adminDashboard.css';

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [adminInfo, setAdminInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API.ADMIN_DASHBOARD, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        // console.log('Dashboard data received:', data); // Debug log
        setStats(data.stats);
        setAdminInfo(data.admin || {});
        setAppointments(data.recentAppointments || []);
      } else {
        setMessage(data.message || 'Error fetching dashboard data');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    // Check if user is authenticated and is admin
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      setMessage('Please login to access admin dashboard');
      setLoading(false);
      return;
    }

    if (role !== 'Admin') {
      setMessage('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffc107';
      case 'Confirmed': return '#28a745';
      case 'Completed': return '#007bff';
      case 'Cancelled': return '#dc3545';
      case 'Rejected': return '#6c757d';
      case 'Expired': return '#6c757d';
      default: return '#6c757d';
    }
  };

  return (
    <div className="dashboard-page">
      <AdminSidebar />
      <div className="dashboard-content">
        {message && (
          <div className="message">
            {message}
            <button onClick={() => setMessage('')}>×</button>
          </div>
        )}

        {loading && <div className="loading">Please wait, loading dashboard...</div>}

        <div className="admin-dashboard">
          <div className="dashboard-header">
            <h2>Admin Dashboard</h2>
            {adminInfo?.name && (
              <div className="admin-info">
                <p>Welcome, <strong>{adminInfo.name}</strong></p>
                {Array.isArray(adminInfo.permissions) && adminInfo.permissions.length > 0 && (
                  <p className="permissions">Permissions: {adminInfo.permissions.join(', ')}</p>
                )}
              </div>
            )}
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Clients</h3>
              <p className="stat-number">{stats.totalUsers || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Attorneys</h3>
              <p className="stat-number">{stats.totalDoctors || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Appointments</h3>
              <p className="stat-number">{stats.totalAppointments || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Appointments</h3>
              <p className="stat-number">{stats.pendingAppointments || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Confirmed Appointments</h3>
              <p className="stat-number">{stats.confirmedAppointments || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Completed Appointments</h3>
              <p className="stat-number">{stats.completedAppointments || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Expired Appointments</h3>
              <p className="stat-number">{stats.expiredAppointments || 0}</p>
            </div>
          </div>

          <div className="recent-appointments">
            <h3>Recent Appointments</h3>
            <div className="appointments-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Client</th>
                    <th>Attorney</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length > 0 ? appointments.map(appointment => (
                    <tr key={appointment.id}>
                      <td>{appointment.date || "N/A"}</td>
                      <td>{appointment.time || "N/A"}</td>
                      <td>{appointment.patient || "Unknown"}</td>
                      <td>{appointment.doctor || "Unknown"}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(appointment.status) }}
                        >
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }}>No appointments found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
