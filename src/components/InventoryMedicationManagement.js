import React, { useEffect, useState } from "react";
import apiService from "../services/api";

export default function InventoryMedicationManagement() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMedications() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getMedications();
        setMedications(data);
      } catch (err) {
        setError("Failed to load medications");
      } finally {
        setLoading(false);
      }
    }
    fetchMedications();
  }, []);

  if (loading) return <div className="p-8">Loading medications...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Inventory & Medication Management</h1>
      <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Medication Name</th>
            <th className="px-4 py-2 text-left">Stock</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {medications.map((med) => (
            <tr key={med.id} className="border-t">
              <td className="px-4 py-2">{med.name}</td>
              <td className="px-4 py-2">{med.stock}</td>
              <td className="px-4 py-2">{med.status || '-'}</td>
              <td className="px-4 py-2 flex flex-wrap gap-2">
                <button className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Adjust stock for ' + med.name)}>Adjust Stock</button>
                <button className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('View low stock/expiring for ' + med.name)}>Low/Expiring</button>
                <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('View transactions for ' + med.name)}>Transactions</button>
                <button className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Delete medication ' + med.name)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
