import React, { useEffect, useState } from "react";
import apiService from "../services/api";

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDepartments() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getDepartments();
        // Defensive: ensure departments is always an array
        setDepartments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load departments");
      } finally {
        setLoading(false);
      }
    }
    fetchDepartments();
  }, []);

  if (loading) return <div className="p-8">Loading departments...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Department Management</h1>
      <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Department Name</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(departments) && departments.map((dept) => (
            <tr key={dept.id} className="border-t">
              <td className="px-4 py-2">{dept.name}</td>
              <td className="px-4 py-2 flex flex-wrap gap-2">
                <button className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Delete department ' + dept.id)}>Delete</button>
                <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Assign staff to ' + dept.id)}>Assign Staff</button>
                <button className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Update load for ' + dept.id)}>Update Load</button>
                <button className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('View stats/queue for ' + dept.id)}>View Stats/Queue</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
