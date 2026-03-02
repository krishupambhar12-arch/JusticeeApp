import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/adminLogin.css"; // Use same styling as admin login
import { API } from "../config/api";

const AttorneyLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(API.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          role: "Attorney" // Specify this is attorney login
        })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "Attorney");
        
        setMessage("✅ Login successful! Redirecting...");
        setTimeout(() => {
          navigate("/attorney/dashboard");
        }, 1500);
      } else {
        setMessage(data.message || "❌ Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h2>Attorney Login</h2>
          <p>Justice Point - Attorney Portal</p>
        </div>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-links">
            <a href="/attorney-forgot-password" className="forgot-password-link">
              Forgot Password?
            </a>
          </div>

          <button 
            type="submit" 
            className="admin-login-btn" 
            disabled={loading}
          >
            {loading ? 'Please wait...' : 'Login'}
          </button>
        </form>

        <div className="register-link">
          Don't have an account? <Link to="/attorney-signup">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default AttorneyLogin;
