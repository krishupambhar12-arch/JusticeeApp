// src/pages/AttorneyProfile.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/AttorneySidebar";
import "../styles/doctorProfile.css";
import { API } from "../config/api";
const BACKEND_URL = "http://localhost:5000";

const AttorneyProfile = () => {
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [doctor, setDoctor] = useState({
    name: "",
    specialization: "",
    qualification: "",
    experience: "",
    fees: "",
    email: "",
    phone: "",
    address: "",
    profilePic: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetch(API.ATTORNEY_DASHBOARD, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load profile");

        setDoctor((prev) => ({
          ...prev,
          name: data?.doctor?.name || "",
          specialization: data?.doctor?.specialization || "",
          qualification: data?.doctor?.qualification || "",
          experience: String(data?.doctor?.experience ?? ""),
          fees: String(data?.doctor?.fees ?? ""),
          email: data?.doctor?.email || "",
          phone: data?.doctor?.phone || "",
          address: data?.doctor?.address || "",
          profilePic: data?.doctor?.profile_pic
            ? `${BACKEND_URL}${data.doctor.profile_pic}`
            : "",
        }));
      } catch (e) {
        // show minimal error, keep defaults
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (f) {
      const url = URL.createObjectURL(f);
      setDoctor((d) => ({ ...d, profilePic: url }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();
      if (doctor.name) form.append("name", doctor.name);
      if (doctor.email) form.append("email", doctor.email);
      if (doctor.phone) form.append("phone", doctor.phone);
      if (doctor.address) form.append("address", doctor.address);
      if (doctor.specialization) form.append("specialization", doctor.specialization);
      if (doctor.qualification) form.append("qualification", doctor.qualification);
      if (doctor.experience !== "") form.append("experience", String(parseInt(doctor.experience || 0, 10)));
      if (doctor.fees !== "") form.append("fees", String(parseInt(doctor.fees || 0, 10)));
      if (file) form.append("profile_pic", file);

      const res = await fetch(API.ATTORNEY_PROFILE_UPDATE, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      setMessage("Profile updated successfully");
      setEdit(false);
      // Reload profile data after successful update
      if (data.doctor?.profile_pic) {
        setDoctor(prev => ({
          ...prev,
          profilePic: `${BACKEND_URL}${data.doctor.profile_pic}`
        }));
      }
    } catch (e) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <Sidebar />
      <div className="profile-container">
        {/* Left profile card */}
        <div className="profile-card">
          {doctor.profilePic ? (
            <img src={doctor.profilePic} alt="Attorney" className="profile-pic" />
          ) : (
            <div className="profile-pic-placeholder">
              <span>No Photo</span>
            </div>
          )}
          {edit ? (
            <>
              <input
                type="text"
                name="name"
                value={doctor.name}
                onChange={handleChange}
                className="edit-input"
              />
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </>
          ) : (
            <h2>{doctor.name || "Attorney"}</h2>
          )}
          <p>{doctor.specialization}</p>
          {edit ? (
            <button className="edit-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          ) : (
            <button className="edit-btn" onClick={() => setEdit(true)}>Edit Profile</button>
          )}
          <button
            className="forgot-password-btn"
            onClick={() => navigate("/forgot-password")}
            style={{ marginTop: "10px" }}
          >
            Change / Forgot Password
          </button>
          {message && <p style={{ marginTop: 8 }}>{message}</p>}
        </div>

        {/* Right details section */}
        <div className="details-card">
          <h3>Profile Details</h3>
          <div className="detail-row">
            <span>Specialization:</span>
            {edit ? (
              <input
                type="text"
                name="specialization"
                value={doctor.specialization}
                onChange={handleChange}
              />
            ) : (
              <p>{doctor.specialization}</p>
            )}
          </div>
          <div className="detail-row">
            <span>Qualification:</span>
            {edit ? (
              <input
                type="text"
                name="qualification"
                value={doctor.qualification}
                onChange={handleChange}
              />
            ) : (
              <p>{doctor.qualification}</p>
            )}
          </div>
          <div className="detail-row">
            <span>Email:</span>
            {edit ? (
              <input
                type="email"
                name="email"
                value={doctor.email}
                onChange={handleChange}
              />
            ) : (
              <p>{doctor.email}</p>
            )}
          </div>
          <div className="detail-row">
            <span>Phone:</span>
            {edit ? (
              <input
                type="text"
                name="phone"
                value={doctor.phone}
                onChange={handleChange}
              />
            ) : (
              <p>{doctor.phone}</p>
            )}
          </div>
          <div className="detail-row">
            <span>Address:</span>
            {edit ? (
              <textarea
                name="address"
                value={doctor.address}
                onChange={handleChange}
                rows="3"
              />
            ) : (
              <p>{doctor.address}</p>
            )}
          </div>
          <div className="detail-row">
            <span>Experience (years):</span>
            {edit ? (
              <input
                type="number"
                name="experience"
                value={doctor.experience}
                onChange={handleChange}
              />
            ) : (
              <p>{doctor.experience}</p>
            )}
          </div>
          <div className="detail-row">
            <span>Fees:</span>
            {edit ? (
              <input
                type="number"
                name="fees"
                value={doctor.fees}
                onChange={handleChange}
              />
            ) : (
              <p>{doctor.fees}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttorneyProfile;
