import React, { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { NurseTriage } from './components/NurseTriage';
import QueueManagement from './components/QueueManagement';
import { ResourceDashboard } from './components/ResourceDashboard';
import { DoctorPortal } from './components/DoctorPortal';
import { InventoryManagement } from './components/InventoryManagement';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import AdminDashboard from './components/AdminDashboard';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';
import PatientRegistration from './components/PatientRegistration';
// Set to true to bypass authentication during development
const DEV_MODE = true;

export default function App() {
    // Define required variables for PatientRegistration
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
    const nurseId = user?.id || 'nurse123';
    const departmentId = user?.departmentId || 'dept1';
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

  const handleNavigate = (screen) => {
    // Allow both 'nurse' and 'nastriage' to show NurseTriage
    if (screen === 'nastriage') {
      setCurrentScreen('nurse');
    } else {
      setCurrentScreen(screen);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Wrap main content in ErrorBoundary */}
      <ErrorBoundary>
        <main className="flex-1 overflow-auto w-full bg-gray-50">
          <PatientRegistration baseUrl={baseUrl} nurseId={nurseId} departmentId={departmentId} />
          {(currentScreen === 'nurse' || currentScreen === 'nastriage') && <NurseTriage onNavigate={handleNavigate} />}
          {currentScreen === 'queue' && <QueueManagement onNavigate={handleNavigate} portalType={user?.role === 'doctor' ? 'doctor' : 'nurse'} />}
          {currentScreen === 'resources' && <ResourceDashboard onNavigate={handleNavigate} />}
          {currentScreen === 'admin' && <AdminDashboard onNavigate={handleNavigate} />}
          {currentScreen === 'doctor' && <DoctorPortal onNavigate={handleNavigate} />}
          {currentScreen === 'inventory' && <InventoryManagement onNavigate={handleNavigate} />}
          {currentScreen === 'analytics' && <AnalyticsDashboard onNavigate={handleNavigate} />}
        </main>
      </ErrorBoundary>
    </div>
  );
}