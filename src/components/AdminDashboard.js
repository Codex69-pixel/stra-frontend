import React, { useEffect, useState } from "react";
import apiService from "../services/api";

export default function AdminDashboard() {
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
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
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
