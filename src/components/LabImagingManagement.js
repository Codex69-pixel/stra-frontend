import React, { useEffect, useState } from "react";
import apiService from "../services/api";

export default function LabImagingManagement() {
  const [labOrders, setLabOrders] = useState([]);
  const [imagingOrders, setImagingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const labData = await apiService.getLabOrders();
        setLabOrders(labData);
        const imagingData = await apiService.getImagingOrders();
        setImagingOrders(imagingData);
      } catch (err) {
        setError("Failed to load lab or imaging orders");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading lab and imaging orders...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Lab Management</h1>
        <table className="min-w-full bg-white rounded-xl shadow overflow-hidden mb-8">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Order ID</th>
              <th className="px-4 py-2 text-left">Patient</th>
              <th className="px-4 py-2 text-left">Test</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {labOrders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="px-4 py-2">{order.id}</td>
                <td className="px-4 py-2">{order.patientName}</td>
                <td className="px-4 py-2">{order.testName}</td>
                <td className="px-4 py-2">{order.status}</td>
                <td className="px-4 py-2 flex flex-wrap gap-2">
                  <button className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Update results for ' + order.id)}>Update Results</button>
                  <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Mark collected for ' + order.id)}>Mark Collected</button>
                  <button className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Update status for ' + order.id)}>Update Status</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-4">Imaging Management</h1>
        <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Order ID</th>
              <th className="px-4 py-2 text-left">Patient</th>
              <th className="px-4 py-2 text-left">Imaging Type</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {imagingOrders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="px-4 py-2">{order.id}</td>
                <td className="px-4 py-2">{order.patientName}</td>
                <td className="px-4 py-2">{order.imagingType}</td>
                <td className="px-4 py-2">{order.status}</td>
                <td className="px-4 py-2 flex flex-wrap gap-2">
                  <button className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Update report for ' + order.id)}>Update Report</button>
                  <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Update status for ' + order.id)}>Update Status</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
