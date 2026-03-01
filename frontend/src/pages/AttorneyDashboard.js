// src/pages/DoctorDashboard.js
import React, { useEffect, useState } from "react";
import Sidebar from "../components/AttorneySidebar";
import "../styles/doctorDashboard.css";
import { API } from "../config/api";

const AttorneyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attorneyName, setAttorneyName] = useState("Attorney");
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState(0);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userEmail = localStorage.getItem("email");
    
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    // Set attorney name from localStorage if available
    const savedName = localStorage.getItem("name");
    if (savedName) {
      setAttorneyName(savedName);
    } else if (userEmail) {
      // Extract name from email or use a default
      const nameFromEmail = userEmail.split('@')[0];
      setAttorneyName(nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1));
    }

    const fetchDashboard = async () => {
      try {
        const res = await fetch(API.ATTORNEY_DASHBOARD, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Check if response is JSON
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          console.error('Received non-JSON response:', text);
          throw new Error('Server error. Please try again later.');
        }
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load");

        // Update attorney name if available from API
        if (data?.attorney?.name) {
          setAttorneyName(data.attorney.name);
        }
        
        setTodayAppointments(data?.stats?.todayAppointments || 0);
        setTotalPatients(data?.stats?.totalPatients || 0);
        setUpcomingAppointments(data?.stats?.upcomingAppointments || 0);
        setEarnings(data?.stats?.earnings || 0);
      } catch (e) {
        console.error("Dashboard error:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="dashboard-page">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          {loading ? (
            <>
              <h1>Loading dashboard…</h1>
              <p>Please wait</p>
            </>
          ) : error ? (
            <>
              <h1>Welcome</h1>
              <p style={{ opacity: 0.9 }}>{error}</p>
            </>
          ) : (
            <>
              <h1>Welcome Attorney {attorneyName} 👋</h1>
              <p>You have {todayAppointments} appointments today.</p>
            </>
          )}
        </div>

        <div className="stats-cards">
          <div className="card">
            <h2>Total Users</h2>
            <p>{totalPatients}</p>
          </div>
          <div className="card">
            <h2>Upcoming Appointments</h2>
            <p>{upcomingAppointments}</p>
          </div>
          <div className="card">
            <h2>Earnings</h2>
            <p>₹{earnings}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AttorneyDashboard;
