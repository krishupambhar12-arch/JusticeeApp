import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./patientSidebar.css";

const ClientSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  return (
    <div className="patient-sidebar">
      <div className="sidebar-menu">
        <h2>Client Panel</h2>
        <ul>
          <li>
            <NavLink to="/" activeClassName="active">
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/client/dashboard" activeClassName="active">
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/client/profile" activeClassName="active">
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/client/appointments" activeClassName="active">
              Appointments
            </NavLink>
          </li>
          <li>
            <NavLink to="/client/lab-tests" activeClassName="active">
              Lab Tests
            </NavLink>
          </li>
          <li>
            <NavLink to="/client/consultation" activeClassName="active">
              Online Consultation
            </NavLink>
          </li>
          <li>
            <NavLink to="/client/feedback" activeClassName="active">
              Feedback
            </NavLink>
          </li>
        </ul>

        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default ClientSidebar;

