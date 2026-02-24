
import React, { useEffect, useState } from "react";
import apiService from "../services/api";

export default function AdminDashboard({ onNavigate }) {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  // Removed unused error state

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch user list (for stats)
        const users = await apiService.getUsers();
        setUserStats({ count: users.length });
      } catch (err) {
        // Log error to console, do not display in UI
        console.error("Failed to load admin data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading admin dashboard...</div>;
  // Do not display error in frontend

  return (
    <div>
      {/* Fixed TopBar for Admin Dashboard */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 50,
        background: 'linear-gradient(to right, #6366f1, #0ea5e9)',
        color: '#fff',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: '0 24px',
        marginBottom: 32
      }}>
        <h1 style={{fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.01em', margin: 0}}>Admin Dashboard</h1>
        {/* Go to module dropdown for admin */}
        {onNavigate && (
          <select
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #6366f1', background: '#fff', color: '#0ea5e9', fontWeight: 600 }}
            onChange={e => onNavigate(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Go to module...</option>
            <option value="nurse">Nurse Triage</option>
            <option value="queue">Queue Management</option>
            <option value="doctor">Doctor Portal</option>
          </select>
        )}
      </header>
      <div className="p-8 space-y-8" style={{paddingTop: 72}}>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Total Users</h2>
            <div className="text-4xl font-bold">{userStats?.count ?? "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
