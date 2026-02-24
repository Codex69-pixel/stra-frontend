import React, { useState, useEffect } from 'react';
import NotificationButton from './common/NotificationButton';
import { logout } from '../utils/logout';
import apiService from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';
import UserManagement from './UserManagement';
import DepartmentManagement from './DepartmentManagement';
// ...existing code...
import AccountSettings from './AccountSettings';

export function ResourceDashboard({ onNavigate }) {
  const [view, setView] = useState('users');
  const [loading, setLoading] = useState(false);
  // Removed unused error state

  useEffect(() => {
    async function fetchResourceDashboard() {
      setLoading(true);
      setError(null);
      try {
        await apiService.getResourceDashboard();
      } catch (err) {
        // Log error to console, do not display in UI
        console.error('Error fetching resource dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchResourceDashboard();
  }, []);

  // Navigation options
  const navigationOptions = [
    { key: 'nurse', label: 'Nurse Triage' },
    { key: 'queue', label: 'Queue Management' },
    { key: 'doctor', label: 'Doctor Portal' },
    { key: 'logout', label: 'Logout' }
  ];

  const tabs = [
    { key: 'users', label: 'Users' },
    { key: 'departments', label: 'Departments' },
    { key: 'account', label: 'Account' }
  ];

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
              {navigationOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          
          <NotificationButton onClick={() => alert('Notifications will appear here. (Backend integration pending)')} />
        </div>
      </header>

      {/* Main Content with proper padding to account for fixed header */}
      <div 
        className="max-w-7xl mx-auto" 
        style={{
          paddingTop: '88px',
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingBottom: '24px'
        }}
      >
        {/* Error Display removed: errors are only logged to console */}

        {/* Admin Feature Tabs */}
        <div className="mb-6 border-b-2 border-gray-200">
          <div className="flex gap-4 flex-wrap">
            {tabs.map(tab => (
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
        <div className="min-h-[400px]">
          {view === 'users' && <UserManagement />}
          {view === 'departments' && <DepartmentManagement />}
          {view === 'account' && <AccountSettings />}
        </div>
        
        {loading && <LoadingSpinner text="Updating resources..." fullScreen />}
      </div>
    </div>
  );
}