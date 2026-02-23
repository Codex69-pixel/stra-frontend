import React, { useState, useEffect } from 'react';
import NotificationButton from './common/NotificationButton';
import { logout } from '../utils/logout';
import {
  FileText, User, Users, Activity, ChevronRight, ChevronDown, Stethoscope, LogOut, X, Save
} from 'lucide-react';
import './DoctorPortal.css';

import LoadingSpinner from './common/LoadingSpinner';
import Prescriptions from './prescription';
// import QueueManagement from './QueueManagement';
import apiService from '../services/api';





export function DoctorPortal({ onNavigate }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctorQueue, setDoctorQueue] = useState([]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchError, setSearchError] = useState('');
  const [labResults, setLabResults] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [triageSummary, setTriageSummary] = useState('');
  const [patientVitals, setPatientVitals] = useState(null);

  // Fetch doctor's queue
  const fetchDoctorQueue = async () => {
    setLoading(true);
    try {
      const queue = await apiService.getDoctorQueue();
      setDoctorQueue(queue);
    } catch (err) {
      setDoctorQueue([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSelectedPatient(null);
    setLabResults(null);
    if (!searchName.trim()) {
      setSearchError('Please enter a patient name.');
      return;
    }
    setLoading(true);
    try {
      // 1. Get all patients (API returns array)
      const allPatients = await apiService.getPatients();
      const searchKey = searchName.trim().toLowerCase();
      // 2. Find patient by name (case-insensitive, full match)
      const found = allPatients.find(
        p => (p.name && p.name.toLowerCase() === searchKey) ||
             ((p.firstName && p.lastName) && (`${p.firstName} ${p.lastName}`.toLowerCase() === searchKey))
      );
      if (!found) {
        setSearchError('Patient not found. Make sure the name is correct and registered.');
        setLoading(false);
        return;
      }
      // 3. Fetch full details
      const details = await apiService.getPatientById(found.id || found.patientId);
      setSelectedPatient(details);
      // All patient-related fetches are handled in useEffect when selectedPatient changes
    } catch (err) {
      setSearchError('Failed to fetch patient details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchPatientDetails() {
      if (selectedPatient && selectedPatient.id) {
        try {
          const details = await apiService.getPatientById(selectedPatient.id);
          setSelectedPatient(prev => ({ ...prev, ...details }));
        } catch (err) {}
        // Fetch lab results
        try {
          const labs = await apiService.getLabResults(selectedPatient.id);
          setLabResults(labs);
        } catch (err) { setLabResults(null); }
        // Fetch patient history
        try {
          const history = await apiService.getPatientHistory(selectedPatient.id);
          setPatientHistory(Array.isArray(history) ? history : []);
        } catch (err) { setPatientHistory([]); }
        // Fetch triage summary
        try {
          const triage = await apiService.performTriage({ patientId: selectedPatient.id });
          setTriageSummary(triage.summary || JSON.stringify(triage));
        } catch (err) { setTriageSummary(''); }
        // Fetch patient vitals
        try {
          const vitals = await apiService.getPatientVitals(selectedPatient.id);
          setPatientVitals(vitals);
        } catch (err) { setPatientVitals(null); }
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
      case 'doctor':
        setShowPrescriptions(false);
        setShowQueue(false);
        setSelectedPatient(null);
        break;
      case 'queue':
        setShowPrescriptions(false);
        setShowQueue(true);
        fetchDoctorQueue();
        break;
      case 'prescriptions':
        setShowPrescriptions(true);
        setShowQueue(false);
        break;
      case 'logout':
        logout();
        break;
      default:
        break;
    }
  };



  // Ensure Patient Dashboard is default view on mount
  useEffect(() => {
    setShowPrescriptions(false);
    setSelectedPatient(null);
  }, []);

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
                  <button
                    onClick={() => handleNavigation('doctor')}
                    className="doctor-dropdown-item"
                    aria-label="Patient Dashboard"
                  >
                    <Activity size={18} />
                    <span>Patient Dashboard</span>
                  </button>
                  <button
                    onClick={() => handleNavigation('queue')}
                    className="doctor-dropdown-item"
                    aria-label="Queue Management"
                  >
                    <Users size={18} />
                    <span>Queue Management</span>
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
        {/* Removed error display as error variable is no longer used */}
        {showQueue ? (
          <div className="doctor-queue-section">
            <button
              className="doctor-action-btn secondary"
              onClick={() => setShowQueue(false)}
              aria-label="Go back to dashboard"
            >
              <ChevronRight size={16} style={{ transform: 'rotate(180deg)', marginRight: '8px' }} />
              Back to Dashboard
            </button>
            <h3>Doctor Queue</h3>
            {loading ? <LoadingSpinner text="Loading queue..." /> : (
              <ul className="doctor-queue-list">
                {doctorQueue.length === 0 ? (
                  <li>No patients in queue.</li>
                ) : (
                  doctorQueue.map((patient, idx) => (
                    <li key={patient.id || idx} className="doctor-queue-item">
                      <span>{patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`}</span>
                      <span>Urgency: {patient.urgency || 'N/A'}</span>
                      <span>Status: {patient.status || 'N/A'}</span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        ) : showPrescriptions ? (
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
            <form onSubmit={handleSearch} className="patient-search-form" style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <input
                type="text"
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                placeholder="Enter patient name (e.g. John Doe)"
                className="patient-search-input"
                style={{ flex: 1, minWidth: 180, padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, marginBottom: 4 }}
                aria-label="Patient name search"
              />
              <button type="submit" className="doctor-action-btn" style={{ minWidth: 100, fontSize: 16, borderRadius: 8 }}>Search</button>
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
                  <div className="patient-info-item">
                    <span>Triage Summary: {selectedPatient.triageSummary || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Previous Notes: {selectedPatient.notes || ''}</span>
                  </div>
                </div>
                {/* Lab Results Section */}
                <div className="patient-info-grid">
                  <div className="patient-info-item" style={{ gridColumn: '1 / -1' }}>
                    <span><b>Lab Results:</b> {labResults ? JSON.stringify(labResults) : 'No lab results found.'}</span>
                  </div>
                </div>
                {/* Patient History Section */}
                <div className="patient-info-grid">
                  <div className="patient-info-item" style={{ gridColumn: '1 / -1' }}>
                    <span><b>Patient History:</b></span>
                    {patientHistory.length === 0 ? (
                      <div>No history found.</div>
                    ) : (
                      <ul className="patient-history-list">
                        {patientHistory.map((entry, idx) => (
                          <li key={idx}>
                            {typeof entry === 'string' ? entry : JSON.stringify(entry)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {/* Triage Summary Section */}
                <div className="patient-info-grid">
                  <div className="patient-info-item" style={{ gridColumn: '1 / -1' }}>
                    <span><b>Triage Summary:</b> {triageSummary || 'No triage summary found.'}</span>
                  </div>
                </div>
                {/* Patient Vitals Section */}
                <div className="patient-info-grid">
                  <div className="patient-info-item" style={{ gridColumn: '1 / -1' }}>
                    <span><b>Patient Vitals:</b> {patientVitals ? JSON.stringify(patientVitals) : 'No vitals found.'}</span>
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