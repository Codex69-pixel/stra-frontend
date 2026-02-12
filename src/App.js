import React, { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { NurseTriage } from './components/NurseTriage';
import QueueManagement from './components/QueueManagement';
import { ResourceDashboard } from './components/ResourceDashboard';
import { DoctorPortal } from './components/DoctorPortal';
import { InventoryManagement } from './components/InventoryManagement';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import ErrorBoundary from './components/common/ErrorBoundary';
// Set to true to bypass authentication during development
const DEV_MODE = true;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  // Removed unused sidebarOpen state

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'nurse') {
      setCurrentScreen('nurse');
    } else if (userData.role === 'doctor') {
      setCurrentScreen('doctor');
    } else if (userData.role === 'pharmacy') {
      setCurrentScreen('inventory');
    } else {
      setCurrentScreen('resources');
    }
  };

  // Removed unused handleLogout function

  if (currentScreen === 'login' || !user) {
    return <LoginScreen onLogin={handleLogin} devMode={DEV_MODE} />;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Wrap main content in ErrorBoundary */}
      <ErrorBoundary>
        <main className="flex-1 overflow-auto w-full bg-gray-50">
          {currentScreen === 'nurse' && <NurseTriage />}
          {currentScreen === 'queue' && <QueueManagement />}
          {currentScreen === 'resources' && <ResourceDashboard />}
          {currentScreen === 'doctor' && <DoctorPortal />}
          {currentScreen === 'inventory' && <InventoryManagement />}
          {currentScreen === 'analytics' && <AnalyticsDashboard />}
        </main>
      </ErrorBoundary>
    </div>
  );
}