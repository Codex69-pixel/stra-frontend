import React, { useState, useEffect } from 'react';
import NotificationButton from './common/NotificationButton';
import { logout } from '../utils/logout';
import apiService from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';
import UserManagement from './UserManagement';
import DepartmentManagement from './DepartmentManagement';
import ResourceManagement from './ResourceManagement';
import InventoryMedicationManagement from './InventoryMedicationManagement';
import AppointmentPatientManagement from './AppointmentPatientManagement';
import LabImagingManagement from './LabImagingManagement';
import AnalyticsReporting from './AnalyticsReporting';
import AccountSettings from './AccountSettings';

export function ResourceDashboard({ onNavigate }) {
  const [view, setView] = useState('users');
  const [loading, setLoading] = useState(false);


  // Removed unused state variables

  useEffect(() => {
    async function fetchResourceDashboard() {
      setLoading(true);
      try {
        await apiService.getResourceDashboard(); // Data fetch for future use, no state update needed
      } catch (err) {
        console.error('Error fetching resource dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchResourceDashboard();
  }, []);

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-teal-50/30 min-h-screen">
      {/* Top Bar - Fixed */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 1000,
          background: 'linear-gradient(to right, #14b8a6, #0d9488)',
          color: '#fff',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '0 24px',
        }}
      >
        {/* Left side - Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.01em', margin: 0 }}>
            Hospital Resources
          </h1>
        </div>

        {/* Right side - Navigation and Notifications */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            height: '64px',
          }}
        >
          {onNavigate && (
            <select
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#fff',
                color: '#0d9488',
                fontWeight: 600,
                fontSize: '14px',
                minWidth: '160px',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              onChange={e => {
                if (e.target.value === 'logout') {
                  logout();
                } else {
                  onNavigate(e.target.value);
                }
              }}
              defaultValue=""
              aria-label="Navigate to module"
            >
              <option value="" disabled>Go to module...</option>
              <option value="nurse">Nurse Triage</option>
              <option value="queue">Queue Management</option>
              <option value="doctor">Doctor Portal</option>
              <option value="inventory">Inventory</option>
              <option value="analytics">Analytics</option>
              <option value="logout">Logout</option>
            </select>
          )}
          
          <NotificationButton onClick={() => alert('Notifications will appear here. (Backend integration pending)')} />
          
          {/* ...existing code... */}
        </div>
      </header>

      {/* Main Content with proper padding to account for fixed header */}
      <div 
        className="max-w-7xl mx-auto" 
        style={{
          paddingTop: '88px', // 64px (header) + 24px (extra space)
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingBottom: '24px'
        }}
      >
        {/* Alerts Section removed as new admin features do not use it */}

        {/* Admin Feature Tabs */}
        <div className="mb-6 border-b-2 border-gray-200">
          <div className="flex gap-4 flex-wrap">
            {[
              { key: 'users', label: 'Users' },
              { key: 'departments', label: 'Departments' },
              { key: 'resources', label: 'Resources' },
              { key: 'inventory', label: 'Inventory' },
              { key: 'appointments', label: 'Appointments/Patients' },
              { key: 'lab', label: 'Lab/Imaging' },
              { key: 'analytics', label: 'Analytics' },
              { key: 'account', label: 'Account' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                className={`px-4 py-3 font-bold border-b-4 transition-all capitalize ${
                  view === tab.key
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Admin Feature Content */}
        {view === 'users' && <UserManagement />}
        {view === 'departments' && <DepartmentManagement />}
        {view === 'resources' && <ResourceManagement />}
        {view === 'inventory' && <InventoryMedicationManagement />}
        {view === 'appointments' && <AppointmentPatientManagement />}
        {view === 'lab' && <LabImagingManagement />}
        {view === 'analytics' && <AnalyticsReporting />}
        {view === 'account' && <AccountSettings />}
        {loading && <LoadingSpinner text="Updating resources..." fullScreen />}
      </div>
    </div>
  );
}