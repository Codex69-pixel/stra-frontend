import React, { useState, useEffect } from 'react';
import { Building2, Edit2, Trash2, Plus } from 'lucide-react';
// ...existing code...
import apiService from '../services/api';


// ================= MOCK DATA FOR PRESENTATION =================
// This mock data is used for demo purposes only. Remove or disable for production.
const MOCK_DEPARTMENTS = [
  {
    id: 1,
    name: 'Cardiology',
    code: 'CARD',
    head: 'Dr. Alice Johnson',
    staffCount: 18,
    location: 'Building A, Floor 2',
    status: 'active',
    description: 'Heart and vascular care.'
  },
  {
    id: 2,
    name: 'Emergency',
    code: 'EMER',
    head: 'Dr. Bob Smith',
    staffCount: 25,
    location: 'Main Entrance, Ground Floor',
    status: 'active',
    description: '24/7 emergency services.'
  },
  {
    id: 3,
    name: 'Neurology',
    code: 'NEUR',
    head: 'Dr. Daniel Kim',
    staffCount: 12,
    location: 'Building B, Floor 3',
    status: 'active',
    description: 'Brain and nervous system.'
  },
  {
    id: 4,
    name: 'Pharmacy',
    code: 'PHAR',
    head: 'Eva Green',
    staffCount: 10,
    location: 'Building C, Floor 1',
    status: 'active',
    description: 'Medication dispensing.'
  },
  {
    id: 5,
    name: 'Pediatrics',
    code: 'PED',
    head: 'Dr. Frank White',
    staffCount: 14,
    location: 'Building D, Floor 2',
    status: 'active',
    description: 'Child healthcare.'
  },
  {
    id: 6,
    name: 'ICU',
    code: 'ICU',
    head: 'Dr. Riley Ivy',
    staffCount: 8,
    location: 'Building E, Floor 1',
    status: 'active',
    description: 'Intensive care unit.'
  },
  {
    id: 7,
    name: 'Orthopedics',
    code: 'ORTH',
    head: 'Dr. Henry Adams',
    staffCount: 11,
    location: 'Building F, Floor 2',
    status: 'active',
    description: 'Bone and joint care.'
  },
  {
    id: 8,
    name: 'Dermatology',
    code: 'DERM',
    head: 'Dr. Liam Clark',
    staffCount: 7,
    location: 'Building G, Floor 1',
    status: 'active',
    description: 'Skin care.'
  },
  {
    id: 9,
    name: 'Administration',
    code: 'ADMIN',
    head: 'Carol Lee',
    staffCount: 6,
    location: 'Admin Block',
    status: 'active',
    description: 'Hospital administration.'
  },
];
// ================= END MOCK DATA =================

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  // Toggle this to true for demo/mock mode
  const DEMO_MODE = true;


  useEffect(() => {
    if (DEMO_MODE) {
      setDepartments(MOCK_DEPARTMENTS);
    } else {
      fetchDepartments();
    }
  }, [DEMO_MODE]);

  const fetchDepartments = async () => {
    setError(null);
    try {
      const response = await apiService.getDepartments();
      setDepartments(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments. Please try again.');
      setDepartments([]);
    }
  };

  // Search and sort: matching results move to top
  const filteredDepartments = Array.isArray(departments)
    ? [
        ...departments.filter(dept =>
          dept?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept?.head?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        ...departments.filter(dept =>
          !(
            dept?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept?.head?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        ),
      ]
    : [];

  const handleDelete = async (deptId) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await apiService.deleteDepartment(deptId);
        await fetchDepartments();
      } catch (err) {
        console.error('Error deleting department:', err);
        setError('Failed to delete department. Please try again.');
      }
    }
  };

  const handleSave = async (deptData) => {
    try {
      if (editingDepartment) {
        await apiService.updateDepartment(editingDepartment.id, deptData);
      } else {
        await apiService.createDepartment(deptData);
      }
      setShowModal(false);
      setEditingDepartment(null);
      await fetchDepartments();
    } catch (err) {
      console.error('Error saving department:', err);
      setError('Failed to save department. Please try again.');
    }
  };

  // Removed loading spinner for department fetch

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Building2 className="w-6 h-6 mr-2 text-purple-600" />
          Department Management
        </h2>
        <button
          onClick={() => {
            setEditingDepartment(null);
            setShowModal(true);
          }}
          className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          style={{
            background: 'linear-gradient(to right, rgb(20,184,166), rgb(13,148,136))',
            border: 'none'
          }}
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Departments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((dept) => (
                <tr key={dept?.id || Math.random()} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dept?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept?.head || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept?.staffCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept?.location || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      dept?.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {dept?.status || 'inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingDepartment(dept);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? 'No departments found matching your search.' : 'No departments available.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Department Modal */}
      {showModal && (
        <DepartmentModal
          department={editingDepartment}
          onClose={() => {
            setShowModal(false);
            setEditingDepartment(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// Department Modal Component
function DepartmentModal({ department, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: department?.name || '',
    head: department?.head || '',
    location: department?.location || '',
    status: department?.status || 'active',
    description: department?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">
          {department ? 'Edit Department' : 'Add New Department'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Head</label>
              <input
                type="text"
                value={formData.head}
                onChange={(e) => setFormData({...formData, head: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-lg"
              style={{
                background: 'linear-gradient(to right, rgb(20,184,166), rgb(13,148,136))',
                border: 'none'
              }}
            >
              {department ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}