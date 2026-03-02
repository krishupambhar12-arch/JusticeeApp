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
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [viewingDoctor, setViewingDoctor] = useState(null);

  const generateAttorneyCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };
  const [actionLoading, setActionLoading] = useState({
    creating: false,
    updating: false,
    deleting: null
  });
  const [formData, setFormData] = useState({
    name: '',
    qualification: '',
    gender: 'Male',
    joiningDate: '',
    attorneyCode: ''
  });
  const [formErrors, setFormErrors] = useState({});

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
    
    if (!formData.qualification.trim()) {
      errors.qualification = 'Qualification is required';
    }
    
    if (!formData.gender) {
      errors.gender = 'Gender is required';
    }
    
    if (!formData.joiningDate) {
      errors.joiningDate = 'Joining date is required';
    }
    
    if (!formData.attorneyCode.trim()) {
      errors.attorneyCode = 'Attorney code is required';
    } else if (!/^[a-zA-Z0-9]{4,6}$/.test(formData.attorneyCode)) {
      errors.attorneyCode = 'Attorney code must be 4-6 alphanumeric characters';
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
      const response = await fetch(API.ADMIN_DOCTORS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          qualification: formData.qualification,
          gender: formData.gender,
          joiningDate: formData.joiningDate,
          attorneyCode: formData.attorneyCode
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Attorney created successfully');
        setShowAddModal(false);
        resetForm();
        fetchDoctors();
      } else {
        setMessage(data.message || 'Error creating attorney');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    } finally {
      setActionLoading(prev => ({ ...prev, creating: false }));
    }
  };

  const handleViewDoctor = (doctor) => {
    setViewingDoctor(doctor);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingDoctor(null);
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || '',
      qualification: doctor.qualification || '',
      gender: doctor.gender || 'Male',
      joiningDate: doctor.joiningDate ? new Date(doctor.joiningDate).toISOString().split('T')[0] : '',
      attorneyCode: doctor.attorneyCode || ''
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
      const response = await fetch(`${API.ADMIN_DOCTORS}/${editingDoctor.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          qualification: formData.qualification,
          gender: formData.gender,
          joiningDate: formData.joiningDate,
          attorneyCode: formData.attorneyCode
        })
      });

      if (response.ok) {
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
      qualification: '',
      gender: 'Male',
      joiningDate: '',
      attorneyCode: ''
    });
    setFormErrors({});
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingDoctor(null);
    resetForm();
  };

  const handleOpenAddModal = () => {
    setEditingDoctor(null);
    resetForm();
    // Auto-generate attorney code for new entries
    setFormData(prev => ({
      ...prev,
      attorneyCode: generateAttorneyCode()
    }));
    setShowAddModal(true);
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
              onClick={handleOpenAddModal}
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
                    <th>Qualification</th>
                    <th>Gender</th>
                    <th>Joining Date</th>
                    <th>Attorney Code</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(doctor => (
                    <tr key={doctor.id}>
                      <td>{doctor.name}</td>
                      <td>{doctor.qualification}</td>
                      <td>{doctor.gender}</td>
                      <td>{doctor.joiningDate ? new Date(doctor.joiningDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{doctor.attorneyCode}</td>
                      <td>
                        <button
                          onClick={() => handleEditDoctor(doctor)}
                          className="btn btn-edit"
                          disabled={actionLoading.deleting === doctor.id}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewDoctor(doctor)}
                          className="btn btn-view"
                          disabled={actionLoading.deleting === doctor.id}
                        >
                          View
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

                <div className="form-group">
                  <label>Gender *</label>
                  <div className="gender-options" style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={formData.gender === "Male"}
                        onChange={handleInputChange}
                        required
                      /> Male
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={formData.gender === "Female"}
                        onChange={handleInputChange}
                        required
                      /> Female
                    </label>
                  </div>
                  {formErrors.gender && (
                    <span className="error-message">{formErrors.gender}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="joiningDate">Joining Date *</label>
                  <input
                    type="date"
                    id="joiningDate"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className={formErrors.joiningDate ? 'error' : ''}
                  />
                  {formErrors.joiningDate && (
                    <span className="error-message">{formErrors.joiningDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="attorneyCode">Attorney Code *</label>
                  <input
                    type="text"
                    id="attorneyCode"
                    name="attorneyCode"
                    value={formData.attorneyCode}
                    onChange={handleInputChange}
                    placeholder="e.g., 5Ca2B"
                    className={formErrors.attorneyCode ? 'error' : ''}
                    readOnly={!editingDoctor}
                    style={{ backgroundColor: !editingDoctor ? '#f8f9fa' : 'white' }}
                  />
                  {!editingDoctor && (
                    <small style={{ color: '#6c757d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      Attorney code is auto-generated
                    </small>
                  )}
                  {formErrors.attorneyCode && (
                    <span className="error-message">{formErrors.attorneyCode}</span>
                  )}
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

        {/* View Modal */}
        {showViewModal && viewingDoctor && (
          <div className="modal-overlay" onClick={handleCloseViewModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Attorney Details</h3>
                <button className="modal-close" onClick={handleCloseViewModal}>×</button>
              </div>
              <div className="view-details">
                <div className="detail-row">
                  <label>Name:</label>
                  <span>{viewingDoctor.name}</span>
                </div>
                <div className="detail-row">
                  <label>Qualification:</label>
                  <span>{viewingDoctor.qualification}</span>
                </div>
                <div className="detail-row">
                  <label>Gender:</label>
                  <span>{viewingDoctor.gender}</span>
                </div>
                <div className="detail-row">
                  <label>Joining Date:</label>
                  <span>{viewingDoctor.joiningDate ? new Date(viewingDoctor.joiningDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>Attorney Code:</label>
                  <span>{viewingDoctor.attorneyCode}</span>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseViewModal}
                  className="btn btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDoctors;
