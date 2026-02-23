import React, { useEffect, useState } from "react";
import apiService from "../services/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getAllUsers();
        setUsers(data);
      } catch (err) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) return <div className="p-8">Loading users...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.role}</td>
              <td className="px-4 py-2 flex flex-wrap gap-2">
                <button className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Delete user ' + user.id)}>Delete</button>
                <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Reset password for ' + user.id)}>Reset Password</button>
                <button className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Update role for ' + user.id)}>Update Role</button>
                <button className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Update status for ' + user.id)}>Update Status</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
