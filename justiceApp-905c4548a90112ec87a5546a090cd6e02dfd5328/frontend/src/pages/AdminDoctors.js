import React, { useState, useEffect, useCallback } from 'react';
import { API } from '../config/api';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/adminDashboard.css';
import '../styles/adminDoctors.css';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API.ADMIN_DOCTORS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setDoctors(data.doctors || []);
      } else {
        setMessage(data.message || 'Error fetching attorneys');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
    setLoading(false);
  }, [token]);

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

        {loading && <div className="loading">Please wait, loading attorneys...</div>}

        <div className="admin-doctors">
          <h2>All Attorneys</h2>
          <div className="doctors-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Specialization</th>
                  <th>Fees</th>
                  <th>Experience</th>
                  <th>Qualification</th>
                </tr>
              </thead>
              <tbody>
                {doctors && doctors.length > 0 ? doctors.map(doctor => (
                  <tr key={doctor.id}>
                    <td>{doctor.name}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.phone}</td>
                    <td>{doctor.specialization}</td>
                    <td>₹{doctor.fees}</td>
                    <td>{doctor.experience} years</td>
                    <td>{doctor.qualification}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7">No attorneys found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDoctors;
