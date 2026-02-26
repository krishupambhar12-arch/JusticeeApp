import React, { useState } from "react";
import "../styles/login.css"; // your existing CSS
import "../styles/variables.css";
import { API } from "../config/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSocialLogin = async (provider) => {
    try {
      let authUrl;
      const popupWidth = 500;
      const popupHeight = 600;
      const left = (window.innerWidth - popupWidth) / 2;
      const top = (window.innerHeight - popupHeight) / 2;

      switch (provider) {
        case 'google':
          authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=714671509629-2ue74rqbh90ngtjtfi8aspa740tlid27.apps.googleusercontent.com&` +
            `redirect_uri=${encodeURIComponent('http://localhost:3000/user')}&` +
            `response_type=code&` +
            `scope=email profile&` +
            `access_type=offline`;
          break;
        case 'facebook':
          authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
            `client_id=1714010942910521&` +
            `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/facebook/callback')}&` +
            `scope=email,public_profile`;
          break;
        case 'linkedin':
          authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
            `client_id=865holnprw1p7h&` +
            `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/linkedin/callback')}&` +
            `response_type=code&` +
            `scope=openid profile email`;
          break;
        default:
          return;
      }

      // Open popup for OAuth
      const popup = window.open(
        authUrl,
        'socialLogin',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      // Listen for messages from popup
      const messageHandler = async (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'social-auth-success') {
          popup.close();
          window.removeEventListener('message', messageHandler);

          // Save token and role
          localStorage.setItem('token', event.data.token);
          localStorage.setItem('role', event.data.user.role);

          // Navigate based on role
          if (event.data.user.role === 'Attorney') {
            navigate('/attorney/dashboard');
          } else if (event.data.user.role === 'Client') {
            navigate('/client/dashboard');
          } else if (event.data.user.role === 'Admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        } else if (event.data.type === 'social-auth-error') {
          popup.close();
          window.removeEventListener('message', messageHandler);
          console.error('Social auth error:', event.data.error);
          alert('Social login failed: ' + event.data.error);
        }
      };

      window.addEventListener('message', messageHandler);

      // Check if popup was blocked
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
        }
      }, 1000);

    } catch (error) {
      console.error('Social login error:', error);
      alert('Social login failed. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    console.log('Login attempt with:', { email: form.email, password: '***' });

    try {
      const res = await fetch(API.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      console.log('Login response status:', res.status);
      const data = await res.json();
      console.log('Login response data:', data);

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      // Show success message
      setMessage("✅ Login Successful! Redirecting...");
      
      // token & role save
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      console.log('Saved to localStorage:', { token: data.token, role: data.user.role });

      // Delay navigation to show success message
      setTimeout(() => {
        // role wise navigation
        if (data.user.role === "Attorney") {
          console.log('Navigating to attorney dashboard');
          navigate("/attorney/dashboard");
        } else if (data.user.role === "Client") {
          console.log('Navigating to client dashboard');
          navigate("/client/dashboard");
        } else if (data.user.role === "Admin") {
          console.log('Navigating to admin dashboard');
          navigate("/admin/dashboard");
        } else {
          console.log('Navigating to home');
          navigate("/");
        }
      }, 1500);

    } catch (err) {
      console.error("Login error:", err);
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-links">
          <button
            type="button"
            className="forgot-password"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Please wait...' : 'Login'}
        </button>

        <div className="social-login-divider">
          <span>or continue with</span>
        </div>

        <div className="social-login-buttons">
          <button 
            type="button" 
            className="social-btn google-btn"
            onClick={() => handleSocialLogin('google')}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 9H9v2.89h4.13c-.18 1.01-.73 1.87-1.55 2.44v1.87h2.51c1.47-1.35 2.32-3.34 2.32-5.7 0-.57-.06-1.12-.18-1.5z"/>
              <path fill="#34A853" d="M9 17c2.16 0 3.97-.71 5.29-1.93l-2.51-1.87c-.7.47-1.59.73-2.78.73-2.13 0-3.94-1.44-4.59-3.38H1.83v1.93C3.13 15.53 5.87 17 9 17z"/>
              <path fill="#FBBC05" d="M4.41 10.05c-.17-.51-.26-1.06-.26-1.62s.09-1.11.26-1.62V4.88H1.83C1.31 5.88 1 7.02 1 8.43s.31 2.55.83 3.55l1.58-1.93z"/>
              <path fill="#EA4335" d="M9 3.38c1.21 0 2.3.42 3.16 1.24l2.22-2.22C12.96 1.09 11.16.43 9 .43 5.87.43 3.13 1.97 1.83 4.88l2.58 1.93C5.06 4.82 6.87 3.38 9 3.38z"/>
            </svg>
            Google
          </button>

          <button 
            type="button" 
            className="social-btn facebook-btn"
            onClick={() => handleSocialLogin('facebook')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>

          <button 
            type="button" 
            className="social-btn linkedin-btn"
            onClick={() => handleSocialLogin('linkedin')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0077B5">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </button>
        </div>

        <div className="register-link">
          Don’t have an account? <a href="/register">Register</a>
        </div>
      </form>
    </div>
  );
};

export default Login;