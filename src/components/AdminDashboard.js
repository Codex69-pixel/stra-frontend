
import React, { useEffect, useState } from "react";
import apiService from "../services/api";

export default function AdminDashboard({ onNavigate }) {
  const [userStats, setUserStats] = useState(null);
  const [resourceStats, setResourceStats] = useState(null);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch user list (for stats)
        const users = await apiService.getUsers();
        setUserStats({ count: users.length });
        // Fetch resource dashboard
        const resources = await apiService.getResourceDashboard();
        setResourceStats(resources);
        // Fetch inventory analytics
        const inventory = await apiService.getInventoryAnalytics();
        setInventoryStats(inventory);
      } catch (err) {
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading admin dashboard...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {/* Go to module dropdown for admin */}
        {onNavigate && (
          <select
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #14b8a6', background: '#fff', color: '#0d9488', fontWeight: 600 }}
            onChange={e => onNavigate(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Go to module...</option>
            <option value="nurse">Nurse Triage</option>
            <option value="queue">Queue Management</option>
            <option value="doctor">Doctor Portal</option>
            <option value="resources">Resource Dashboard</option>
            <option value="inventory">Inventory</option>
            <option value="analytics">Analytics</option>
          </select>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Total Users</h2>
          <div className="text-4xl font-bold">{userStats?.count ?? "-"}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Resource Utilization</h2>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(resourceStats, null, 2)}</pre>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Inventory Analytics</h2>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(inventoryStats, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
