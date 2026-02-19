import React, { useState, useEffect } from 'react';
import NotificationButton from './common/NotificationButton';
import { logout } from '../utils/logout';
import {
  FileText, User, Users, Activity, ChevronRight, ChevronDown, Home, Clipboard, Stethoscope, LogOut, X, Save
} from 'lucide-react';
import './DoctorPortal.css';
import LoadingSpinner from './common/LoadingSpinner';
import Prescriptions from './prescription';
import apiService from '../services/api';





export function DoctorPortal({ onNavigate }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [searchError, setSearchError] = useState('');

  // Remove fetching all patients, since backend does not support it
  // Search patient by name using localStorage
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSelectedPatient(null);
    if (!searchName.trim()) {
      setSearchError('Please enter a patient name.');
      return;
    }
    let patientMap = {};
    try {
      patientMap = JSON.parse(localStorage.getItem('patientMap') || '{}');
    } catch (e) { patientMap = {}; }
    const id = patientMap[searchName.trim()];
    if (!id) {
      setSearchError('Patient not found. Make sure the name is correct and registered.');
      return;
    }
    setLoading(true);
    try {
      const details = await apiService.getPatientById(id);
      setSelectedPatient(details);
    } catch (err) {
      setSearchError('Failed to fetch patient details.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch patient details when selectedPatient changes
  useEffect(() => {
    async function fetchPatientDetails() {
      if (selectedPatient && selectedPatient.id) {
        try {
          const details = await apiService.getPatientById(selectedPatient.id);
          setSelectedPatient(prev => ({ ...prev, ...details }));
        } catch (err) {
          // Ignore for now
        }
      }
    }
    if (selectedPatient && selectedPatient.id) {
      fetchPatientDetails();
    }
  }, [selectedPatient]);

  // Navigation handler
  const handleNavigation = (itemId) => {
    setShowUserMenu(false);
    switch (itemId) {
      case 'queue':
      case 'doctor':
      case 'reports':
        if (onNavigate) onNavigate(itemId);
        break;
      case 'prescriptions':
        setShowPrescriptions(true);
        break;
      case 'logout':
        logout();
        break;
      default:
        break;
    }
  };

  // TopBar Component
  const TopBar = () => (
    <header className="doctor-portal-topbar">
      <div className="doctor-portal-topbar-content">
        {/* Logo/Brand */}
        <div className="doctor-brand-section">
          <div className="doctor-brand-logo">
            <Stethoscope size={28} />
          </div>
          <div>
            <h1 className="doctor-brand-title">Stra-Health Doctor Portal</h1>
            <p className="doctor-brand-subtitle">Patient Management System</p>
          </div>
        </div>

        {/* Right Side Actions - Notification and User Menu */}
        <div className="doctor-right-actions">
          <NotificationButton 
            onClick={() => alert('Notifications will appear here. (Backend integration pending)')}
            aria-label="View notifications"
            className="doctor-notification-btn"
          />
          
          {/* User Menu */}
          <div className="doctor-user-menu-container">
            <button
              className="doctor-user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <div className="doctor-user-avatar">
                <User size={20} />
              </div>
              <ChevronDown className={`doctor-chevron ${showUserMenu ? 'rotated' : ''}`} size={16} />
            </button>

            {showUserMenu && (
              <>
                <div 
                  className="doctor-dropdown-backdrop" 
                  onClick={() => setShowUserMenu(false)}
                  aria-hidden="true"
                />
                <div className="doctor-user-dropdown">
                  <div className="doctor-user-info">
                    <div className="doctor-user-avatar large">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="doctor-user-name">Dr. Sarah Johnson</p>
                      <p className="doctor-user-role">Senior Physician</p>
                    </div>
                  </div>
                  
                  <div className="doctor-dropdown-divider" />
                  
                  <button
                    onClick={() => handleNavigation('queue')}
                    className="doctor-dropdown-item"
                    aria-label="Queue Management"
                  >
                    <Users size={18} />
                    <span>Queue Management</span>
                  </button>
                  
                  <button
                    onClick={() => handleNavigation('doctor')}
                    className="doctor-dropdown-item"
                    aria-label="Patient Dashboard"
                  >
                    <Activity size={18} />
                    <span>Patient Dashboard</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowPrescriptions(true);
                      setShowUserMenu(false);
                    }}
                    className="doctor-dropdown-item"
                    aria-label="Prescriptions"
                  >
                    <FileText size={18} />
                    <span>Prescriptions</span>
                  </button>
                  
                  <button
                    onClick={() => handleNavigation('reports')}
                    className="doctor-dropdown-item"
                    aria-label="Reports"
                  >
                    <Clipboard size={18} />
                    <span>Reports</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Navigate to home if needed
                      window.location.href = '/';
                    }}
                    className="doctor-dropdown-item"
                    aria-label="Home"
                  >
                    <Home size={18} />
                    <span>Home</span>
                  </button>
                  
                  <div className="doctor-dropdown-divider" />
                  
                  <button
                    onClick={() => handleNavigation('logout')}
                    className="doctor-dropdown-item logout"
                    aria-label="Logout"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  // Handle saving clinical notes (placeholder, implement backend call)
  const handleSave = async () => {
    if (!selectedPatient) return;
    setLoading(true);
    try {
      // TODO: Implement backend call for saving clinical notes
      // await apiService.saveClinicalNotes(selectedPatient.id, clinicalNotes);
      alert('Clinical notes saved (backend integration needed)');
    } catch (err) {
      alert('Failed to save notes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-portal-layout">
      <TopBar />
      <main className="doctor-portal-main" role="main">
        {error && <div className="alert alert-error">{error}</div>}
        {showPrescriptions ? (
          <div className="prescriptions-container">
            <button
              className="doctor-action-btn secondary"
              onClick={() => setShowPrescriptions(false)}
              aria-label="Go back to dashboard"
            >
              <ChevronRight size={16} style={{ transform: 'rotate(180deg)', marginRight: '8px' }} />
              Back to Dashboard
            </button>
            <Prescriptions userRole="doctor" />
          </div>
        ) : (
          <div className="doctor-dashboard-content">
            {/* Search Bar for Patient Name */}
            <form onSubmit={handleSearch} className="patient-search-form" style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                placeholder="Enter patient name (e.g. John Doe)"
                className="patient-search-input"
                style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              />
              <button type="submit" className="doctor-action-btn">Search</button>
            </form>
            {searchError && <div className="alert alert-error">{searchError}</div>}
            {/* Patient Details Section */}
            {selectedPatient && (
              <div className="patient-details-section">
                <h3>Selected Patient</h3>
                <div className="patient-info-grid">
                  <div className="patient-info-item">
                    <User size={16} />
                    <span>Name: {selectedPatient.name || `${selectedPatient.firstName || ''} ${selectedPatient.lastName || ''}`}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>DOB: {selectedPatient.dateOfBirth || selectedPatient.dob || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Gender: {selectedPatient.gender || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Phone: {selectedPatient.phoneNumber || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Emergency Contact: {selectedPatient.emergencyContactName || ''} ({selectedPatient.emergencyContact || ''})</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Address: {selectedPatient.address || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>County: {selectedPatient.county || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>SubCounty: {selectedPatient.subCounty || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Blood Group: {selectedPatient.bloodGroup || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Allergies: {Array.isArray(selectedPatient.allergies) ? selectedPatient.allergies.join(', ') : selectedPatient.allergies || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Chronic Conditions: {Array.isArray(selectedPatient.chronicConditions) ? selectedPatient.chronicConditions.join(', ') : selectedPatient.chronicConditions || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Symptoms: {Array.isArray(selectedPatient.symptoms) ? selectedPatient.symptoms.join(', ') : selectedPatient.symptoms || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Chief Complaint: {selectedPatient.chiefComplaint || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Vitals: {selectedPatient.vitals ? JSON.stringify(selectedPatient.vitals) : ''}</span>
                  </div>
                </div>
              </div>
            )}
            {/* Clinical Notes Section */}
            {selectedPatient && (
              <div className="clinical-notes-section">
                <h3>Clinical Notes</h3>
                <textarea
                  className="clinical-notes-input"
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Enter clinical notes here..."
                  rows={4}
                />
                <div className="notes-actions">
                  <button
                    className="doctor-action-btn"
                    onClick={handleSave}
                    disabled={loading}
                    aria-label="Save clinical notes"
                  >
                    <Save size={16} style={{ marginRight: '8px' }} />
                    {loading ? 'Saving...' : 'Save Notes'}
                  </button>
                  <button
                    className="doctor-action-btn secondary"
                    onClick={() => setClinicalNotes('')}
                    aria-label="Clear notes"
                  >
                    <X size={16} style={{ marginRight: '8px' }} />
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {loading && <LoadingSpinner text="Loading..." fullScreen />}
      </main>
    </div>
  );
}