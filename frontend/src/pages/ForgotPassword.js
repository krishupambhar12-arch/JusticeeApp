import React, { useState } from "react";
import "../styles/login.css";
import { API } from "../config/api";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [form, setForm] = useState({ email: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.email || !form.newPassword || !form.confirmPassword) {
      setMessage("Please fill all fields");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API.FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, newPassword: form.newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Failed to update password");
        setLoading(false);
        return;
      }

      setMessage(data.message || "Password updated successfully");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Forgot password error:", error);
      setMessage("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>

        {message && (
          <div
            style={{
              marginBottom: "16px",
              fontSize: "14px",
              color: message.toLowerCase().includes("success")
                ? "green"
                : "#dc3545",
            }}
          >
            {message}
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Please wait..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;

