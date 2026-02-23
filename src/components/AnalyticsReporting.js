import React, { useEffect, useState } from "react";
import apiService from "../services/api";

export default function AnalyticsReporting() {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const triage = await apiService.getTriageStatistics();
        const doctor = await apiService.getDoctorStatistics();
        const inventory = await apiService.getInventoryAnalytics();
        const pharmacy = await apiService.getPharmacyStatistics();
        const appointments = await apiService.getAppointmentStatistics();
        setAnalytics({ triage, doctor, inventory, pharmacy, appointments });
      } catch (err) {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-8">Loading analytics...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Analytics & Reporting</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Triage Statistics</h2>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(analytics.triage, null, 2)}</pre>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Doctor Statistics</h2>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(analytics.doctor, null, 2)}</pre>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Inventory Analytics</h2>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(analytics.inventory, null, 2)}</pre>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Pharmacy Statistics</h2>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(analytics.pharmacy, null, 2)}</pre>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Appointment Statistics</h2>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(analytics.appointments, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
