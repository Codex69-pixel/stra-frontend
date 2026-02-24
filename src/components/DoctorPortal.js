import React, { useState, useEffect } from 'react';
import NotificationButton from './common/NotificationButton';
import { logout } from '../utils/logout';
import {
  FileText, User, Users, Activity, ChevronRight, ChevronDown, Stethoscope, LogOut, X, Save
} from 'lucide-react';
import './DoctorPortal.css';
import LoadingSpinner from './common/LoadingSpinner';
import Prescriptions from './prescription';
import apiService from '../services/api';
import { MOCK_NURSE_QUEUE } from './QueueManagement';

// ================= MOCK DATA FOR PRESENTATION =================
// This mock data is used for demo purposes only. Remove or disable for production.
const DEMO_MODE = true;



export const MOCK_PATIENTS = [
  {
    id: 'DP001',
    name: 'John Doe',
    age: 34,
    gender: 'Male',
    diagnosis: 'Hypertension',
    visitStatus: 'Checked In',
  },
  {
    id: 'DP002',
    name: 'Jane Smith',
    age: 28,
    gender: 'Female',
    diagnosis: 'Migraine',
    visitStatus: 'Waiting',
  },
  {
    id: 'DP003',
    name: 'Michael Brown',
    age: 45,
    gender: 'Male',
    diagnosis: 'Diabetes',
    visitStatus: 'In Consultation',
  },
  {
    id: 'DP004',
    name: 'Emily Davis',
    age: 52,
    gender: 'Female',
    diagnosis: 'Asthma',
    visitStatus: 'Checked In',
  },
  {
    id: 'DP005',
    name: 'Chris Evans',
    age: 39,
    gender: 'Male',
    diagnosis: 'Back Pain',
    visitStatus: 'Waiting',
  },
  {
    id: 'DP006',
    name: 'Sophia Lee',
    age: 23,
    gender: 'Female',
    diagnosis: 'Allergy',
    visitStatus: 'Checked In',
  },
  {
    id: 'DP007',
    name: 'David Kim',
    age: 31,
    gender: 'Male',
    diagnosis: 'Sprain',
    visitStatus: 'In Consultation',
  },
  {
    id: 'DP008',
    name: 'Olivia Green',
    age: 27,
    gender: 'Female',
    diagnosis: 'Migraine',
    visitStatus: 'Waiting',
  },
  {
    id: 'DP009',
    name: 'Lucas White',
    age: 36,
    gender: 'Male',
    diagnosis: 'Asthma',
    visitStatus: 'Checked In',
  },
  {
    id: 'DP010',
    name: 'Mia Black',
    age: 41,
    gender: 'Female',
    diagnosis: 'Infection',
    visitStatus: 'Waiting',
  },
];

// Mock lab results, history, triage, and vitals for demo
const MOCK_LAB_RESULTS = {
  'DP001': { CBC: 'Normal', Glucose: 'High', Cholesterol: 'Borderline' },
  'DP002': { MRI: 'Normal', Blood: 'Normal' },
  'DP003': { HbA1c: '8.2%', Glucose: 'High' },
  'DP004': { Spirometry: 'Mild obstruction' },
  'DP005': { XRay: 'No abnormality' },
  'DP006': { AllergyTest: 'Positive (Pollen)' },
  'DP007': { XRay: 'Mild swelling' },
  'DP008': { CT: 'Normal' },
  'DP009': { Spirometry: 'Normal' },
  'DP010': { Blood: 'Normal' },
};

const MOCK_PATIENT_HISTORY = {
  'DP001': ['2025-12-01: Annual checkup', '2026-01-15: Hypertension diagnosed'],
  'DP002': ['2026-01-10: Migraine episode'],
  'DP003': ['2025-11-20: Diabetes diagnosed', '2026-02-01: Routine follow-up'],
  'DP004': ['2025-10-05: Asthma attack'],
  'DP005': ['2026-02-10: Back pain onset'],
  'DP006': ['2026-01-25: Allergy symptoms'],
  'DP007': ['2026-02-18: Sprain injury'],
  'DP008': ['2026-01-30: Migraine episode'],
  'DP009': ['2025-12-15: Asthma review'],
  'DP010': ['2026-02-12: Infection treated'],
};

const MOCK_TRIAGE_SUMMARY = {
  'DP001': 'BP elevated, pulse normal.',
  'DP002': 'Migraine symptoms, no neuro deficit.',
  'DP003': 'Blood sugar high, needs adjustment.',
  'DP004': 'Asthma controlled, mild wheeze.',
  'DP005': 'Musculoskeletal pain, no red flags.',
  'DP006': 'Allergy confirmed, mild symptoms.',
  'DP007': 'Sprain, mild swelling.',
  'DP008': 'Migraine, stable.',
  'DP009': 'Asthma, stable.',
  'DP010': 'Infection resolved.',
};

const MOCK_VITALS = {
  'DP001': { BP: '145/92', Pulse: 78, Temp: '36.8C' },
  'DP002': { BP: '120/80', Pulse: 72, Temp: '36.7C' },
  'DP003': { BP: '130/85', Pulse: 80, Temp: '36.9C' },
  'DP004': { BP: '125/82', Pulse: 76, Temp: '36.6C' },
  'DP005': { BP: '118/76', Pulse: 70, Temp: '36.5C' },
  'DP006': { BP: '110/70', Pulse: 74, Temp: '36.7C' },
  'DP007': { BP: '122/78', Pulse: 75, Temp: '36.8C' },
  'DP008': { BP: '119/75', Pulse: 73, Temp: '36.6C' },
  'DP009': { BP: '124/80', Pulse: 77, Temp: '36.7C' },
  'DP010': { BP: '117/74', Pulse: 71, Temp: '36.5C' },
};
// ================= END MOCK DATA =================

export default function DoctorPortal() {
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

  // Fetch unified queue (same as nurse portal)
  const fetchDoctorQueue = async () => {
    setLoading(true);
    try {
      if (DEMO_MODE) {
        setDoctorQueue(MOCK_NURSE_QUEUE || []);
      } else {
        const queue = await apiService.getDoctorQueue();
        setDoctorQueue(Array.isArray(queue) ? queue : []);
      }
    } catch (err) {
      console.error('Error fetching doctor queue:', err);
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
    setPatientHistory([]);
    setTriageSummary('');
    setPatientVitals(null);
    
    if (!searchName.trim()) {
      setSearchError('Please enter a patient name.');
      return;
    }
    
    setLoading(true);
    try {
      let allPatients;
      if (DEMO_MODE) {
        allPatients = MOCK_PATIENTS;
      } else {
        allPatients = await apiService.getPatients();
        allPatients = Array.isArray(allPatients) ? allPatients : [];
      }
      
      const searchKey = searchName.trim().toLowerCase();
      
      // Find patient by name (case-insensitive, full match)
      const found = allPatients.find(
        p => (p.name && p.name.toLowerCase() === searchKey) ||
             ((p.firstName && p.lastName) && (`${p.firstName} ${p.lastName}`.toLowerCase() === searchKey))
      );
      
      if (!found) {
        setSearchError('Patient not found. Make sure the name is correct and registered.');
        setLoading(false);
        return;
      }
      
      setSelectedPatient(found);
    } catch (err) {
      console.error('Error searching patient:', err);
      setSearchError('Failed to fetch patient details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchPatientDetails() {
      if (selectedPatient && selectedPatient.id) {
        if (DEMO_MODE) {
          // Use mock data for demo
          setLabResults(MOCK_LAB_RESULTS[selectedPatient.id] || null);
          setPatientHistory(MOCK_PATIENT_HISTORY[selectedPatient.id] || []);
          setTriageSummary(MOCK_TRIAGE_SUMMARY[selectedPatient.id] || '');
          setPatientVitals(MOCK_VITALS[selectedPatient.id] || null);
        } else {
          try {
            const details = await apiService.getPatientById(selectedPatient.id);
            setSelectedPatient(prev => ({ ...prev, ...details }));
          } catch (err) {
            console.error('Error fetching patient details:', err);
          }
          
          // Fetch lab results
          try {
            const labs = await apiService.getLabResults(selectedPatient.id);
            setLabResults(labs || null);
          } catch (err) { 
            console.error('Error fetching lab results:', err);
            setLabResults(null); 
          }
          
          // Fetch patient history
          try {
            const history = await apiService.getPatientHistory(selectedPatient.id);
            setPatientHistory(Array.isArray(history) ? history : []);
          } catch (err) { 
            console.error('Error fetching patient history:', err);
            setPatientHistory([]); 
          }
          
          // Fetch triage summary
          try {
            const triage = await apiService.performTriage({ patientId: selectedPatient.id });
            setTriageSummary(triage?.summary || JSON.stringify(triage) || '');
          } catch (err) { 
            console.error('Error fetching triage summary:', err);
            setTriageSummary(''); 
          }
          
          // Fetch patient vitals
          try {
            const vitals = await apiService.getPatientVitals(selectedPatient.id);
            setPatientVitals(vitals || null);
          } catch (err) { 
            console.error('Error fetching patient vitals:', err);
            setPatientVitals(null); 
          }
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

  // Handle saving clinical notes (placeholder, implement backend call)
  const handleSave = async () => {
    if (!selectedPatient) return;
    setLoading(true);
    try {
      // TODO: Implement backend call for saving clinical notes
      // await apiService.saveClinicalNotes(selectedPatient.id, clinicalNotes);
      alert('Clinical notes saved (backend integration needed)');
      // Clear notes after save? Optional
      // setClinicalNotes('');
    } catch (err) {
      console.error('Error saving notes:', err);
      alert('Failed to save notes');
    } finally {
      setLoading(false);
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

  return (
    <div className="doctor-portal-layout">
      <TopBar />
      <main className="doctor-portal-main" role="main">
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
                    <li
                      key={patient?.id || idx}
                      className={`doctor-queue-item ${patient?.urgency === 'High' ? 'urgent-patient' : ''}`}
                      style={patient?.urgency === 'High' ? { background: '#fee2e2', fontWeight: 'bold' } : {}}
                    >
                      <span>{patient?.name || `${patient?.firstName || ''} ${patient?.lastName || ''}`}</span>
                      <span>Urgency: <span style={{ 
                        color: patient?.urgency === 'High' ? '#dc2626' : 
                               patient?.urgency === 'Medium' ? '#ca8a04' : 
                               patient?.urgency === 'Low' ? '#16a34a' : '#6b7280' 
                      }}>
                        {patient?.urgency || 'N/A'}
                      </span></span>
                      <span>Status: {patient?.status || 'N/A'}</span>
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
            
            {searchError && <div className="alert alert-error" style={{ color: '#b91c1c', marginBottom: 16, padding: '8px 12px', backgroundColor: '#fee2e2', borderRadius: '6px' }}>{searchError}</div>}
            
            {/* Patient Details Section */}
            {selectedPatient && (
              <div className="patient-details-section">
                <h3>Selected Patient</h3>
                <div className="patient-info-grid">
                  <div className="patient-info-item">
                    <User size={16} />
                    <span>Name: {selectedPatient?.name || `${selectedPatient?.firstName || ''} ${selectedPatient?.lastName || ''}`}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>DOB: {selectedPatient?.dateOfBirth || selectedPatient?.dob || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Gender: {selectedPatient?.gender || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Phone: {selectedPatient?.phoneNumber || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Emergency Contact: {selectedPatient?.emergencyContactName || ''} ({selectedPatient?.emergencyContact || ''})</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Address: {selectedPatient?.address || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>County: {selectedPatient?.county || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>SubCounty: {selectedPatient?.subCounty || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Blood Group: {selectedPatient?.bloodGroup || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Allergies: {Array.isArray(selectedPatient?.allergies) ? selectedPatient.allergies.join(', ') : selectedPatient?.allergies || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Chronic Conditions: {Array.isArray(selectedPatient?.chronicConditions) ? selectedPatient.chronicConditions.join(', ') : selectedPatient?.chronicConditions || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Symptoms: {Array.isArray(selectedPatient?.symptoms) ? selectedPatient.symptoms.join(', ') : selectedPatient?.symptoms || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Chief Complaint: {selectedPatient?.chiefComplaint || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Vitals: {selectedPatient?.vitals ? JSON.stringify(selectedPatient.vitals) : ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Triage Summary: {selectedPatient?.triageSummary || ''}</span>
                  </div>
                  <div className="patient-info-item">
                    <span>Previous Notes: {selectedPatient?.notes || ''}</span>
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