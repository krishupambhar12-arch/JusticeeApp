import React, { useState, useEffect, useCallback } from 'react';
import { API } from '../config/api';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/adminDashboard.css';
import '../styles/adminDoctors.css';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    creating: false,
    updating: false,
    deleting: null
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Male',
    address: '',
    specialization: '',
    qualification: '',
    experience: '',
    fees: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const specializations = [
    'Civil Law',
    'Corporate Law', 
    'Family Law',
    'Criminal Law',
    'Real Estate Law',
    'Tax Law',
    'Immigration Law',
    'Intellectual Property Law',
    'Labor Law',
    'Environmental Law'
  ];

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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!editingDoctor && !formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required';
    }
    
    if (!formData.specialization.trim()) {
      errors.specialization = 'Specialization is required';
    }
    
    if (!formData.qualification.trim()) {
      errors.qualification = 'Qualification is required';
    }
    
    if (!formData.experience || formData.experience <= 0) {
      errors.experience = 'Experience is required and must be greater than 0';
    }
    
    if (!formData.fees || formData.fees <= 0) {
      errors.fees = 'Fees is required and must be greater than 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Please fix the errors in the form');
      return;
    }

    setActionLoading(prev => ({ ...prev, creating: true }));
    try {
      // First create user account
      const userResponse = await fetch(API.ADMIN_CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          gender: formData.gender,
          role: 'Attorney'
        })
      });

      const userData = await userResponse.json();
      
      if (userResponse.ok) {
        // Then create attorney profile
        const attorneyResponse = await fetch(API.ADMIN_DOCTORS, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userData.user._id,
            specialization: formData.specialization,
            qualification: formData.qualification,
            experience: parseInt(formData.experience),
            fees: parseFloat(formData.fees)
          })
        });

        const attorneyData = await attorneyResponse.json();
        
        if (attorneyResponse.ok) {
          setMessage('Attorney created successfully');
          setShowAddModal(false);
          resetForm();
          fetchDoctors();
        } else {
          setMessage(attorneyData.message || 'Error creating attorney profile');
        }
      } else {
        setMessage(userData.message || 'Error creating user account');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    } finally {
      setActionLoading(prev => ({ ...prev, creating: false }));
    }
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || '',
      email: doctor.email || '',
      password: '',
      phone: doctor.phone || '',
      gender: doctor.gender || 'Male',
      address: doctor.address || '',
      specialization: doctor.specialization || '',
      qualification: doctor.qualification || '',
      experience: doctor.experience?.toString() || '',
      fees: doctor.fees?.toString() || ''
    });
    setShowAddModal(true);
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Please fix the errors in the form');
      return;
    }

    setActionLoading(prev => ({ ...prev, updating: true }));
    try {
      // Update user information
      const userResponse = await fetch(`${API.ADMIN_UPDATE}/${editingDoctor.userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          gender: formData.gender
        })
      });

      // Update attorney information
      const attorneyResponse = await fetch(`${API.ADMIN_DOCTORS}/${editingDoctor.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience: parseInt(formData.experience),
          fees: parseFloat(formData.fees)
        })
      });

      if (userResponse.ok && attorneyResponse.ok) {
        setMessage('Attorney updated successfully');
        setShowAddModal(false);
        setEditingDoctor(null);
        resetForm();
        fetchDoctors();
      } else {
        setMessage('Error updating attorney');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    } finally {
      setActionLoading(prev => ({ ...prev, updating: false }));
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this attorney? This action cannot be undone.')) {
      setActionLoading(prev => ({ ...prev, deleting: doctorId }));
      try {
        // Delete attorney record first
        const attorneyResponse = await fetch(`${API.ADMIN_DOCTORS}/${doctorId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (attorneyResponse.ok) {
          setMessage('Attorney deleted successfully');
          fetchDoctors();
        } else {
          setMessage('Error deleting attorney');
        }
      } catch (error) {
        setMessage('Error connecting to server');
      } finally {
        setActionLoading(prev => ({ ...prev, deleting: null }));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      gender: 'Male',
      address: '',
      specialization: '',
      qualification: '',
      experience: '',
      fees: ''
    });
    setFormErrors({});
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingDoctor(null);
    resetForm();
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

        {loading && <div className="loading">Please wait, loading attorneys...</div>}

        <div className="admin-doctors">
          <div className="doctors-header">
            <h2>All Attorneys</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              + Add Attorney
            </button>
          </div>

          {doctors && doctors.length > 0 ? (
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(doctor => (
                    <tr key={doctor.id}>
                      <td>{doctor.name}</td>
                      <td>{doctor.email}</td>
                      <td>{doctor.phone}</td>
                      <td>{doctor.specialization}</td>
                      <td>₹{doctor.fees}</td>
                      <td>{doctor.experience} years</td>
                      <td>{doctor.qualification}</td>
                      <td>
                        <button
                          onClick={() => handleEditDoctor(doctor)}
                          className="btn btn-edit"
                          disabled={actionLoading.deleting === doctor.id}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doctor.id)}
                          className="btn btn-delete"
                          disabled={actionLoading.deleting === doctor.id}
                        >
                          {actionLoading.deleting === doctor.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading && (
              <div className="no-data">
                <p>No attorneys found. Click "Add Attorney" to create one.</p>
              </div>
            )
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingDoctor ? 'Edit Attorney' : 'Add New Attorney'}</h3>
                <button className="modal-close" onClick={handleCloseModal}>×</button>
              </div>
              <form onSubmit={editingDoctor ? handleUpdateDoctor : handleAddDoctor}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={formErrors.name ? 'error' : ''}
                    />
                    {formErrors.name && (
                      <span className="error-message">{formErrors.name}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? 'error' : ''}
                    />
                    {formErrors.email && (
                      <span className="error-message">{formErrors.email}</span>
                    )}
                  </div>
                </div>

                {!editingDoctor && (
                  <div className="form-group">
                    <label htmlFor="password">Password *</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={formErrors.password ? 'error' : ''}
                    />
                    {formErrors.password && (
                      <span className="error-message">{formErrors.password}</span>
                    )}
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={formErrors.phone ? 'error' : ''}
                    />
                    {formErrors.phone && (
                      <span className="error-message">{formErrors.phone}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="specialization">Specialization *</label>
                    <select
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className={formErrors.specialization ? 'error' : ''}
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    {formErrors.specialization && (
                      <span className="error-message">{formErrors.specialization}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="qualification">Qualification *</label>
                    <input
                      type="text"
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      className={formErrors.qualification ? 'error' : ''}
                    />
                    {formErrors.qualification && (
                      <span className="error-message">{formErrors.qualification}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="experience">Experience (years) *</label>
                    <input
                      type="number"
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      min="0"
                      className={formErrors.experience ? 'error' : ''}
                    />
                    {formErrors.experience && (
                      <span className="error-message">{formErrors.experience}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="fees">Fees (₹) *</label>
                    <input
                      type="number"
                      id="fees"
                      name="fees"
                      value={formData.fees}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={formErrors.fees ? 'error' : ''}
                    />
                    {formErrors.fees && (
                      <span className="error-message">{formErrors.fees}</span>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading.creating || actionLoading.updating}
                  >
                    {actionLoading.creating || actionLoading.updating
                      ? 'Saving...'
                      : editingDoctor
                      ? 'Update'
                      : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDoctors;
