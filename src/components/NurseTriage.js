import React, { useState } from 'react';

import NotificationButton from './common/NotificationButton';
import { logout } from '../utils/logout';
import {
  User, Heart, Activity, Save, FileText, AlertCircle,
  CheckCircle, ArrowRight, ArrowLeft,
  Thermometer, Zap, Droplet, Wind, Gauge, Ruler
} from 'lucide-react';
import LoadingSpinner from './common/LoadingSpinner';

export function NurseTriage({ onNavigate }) {
    // Toggle a symptom in the symptoms array
    const handleSymptomToggle = (symptom) => {
      setFormData((prev) => {
        const symptoms = prev.symptoms.includes(symptom)
          ? prev.symptoms.filter((s) => s !== symptom)
          : [...prev.symptoms, symptom];
        return { ...prev, symptoms };
      });
    };

    // Toggle a condition in the pastConditions array
    const handleConditionToggle = (condition) => {
      setFormData((prev) => {
        const pastConditions = prev.pastConditions.includes(condition)
          ? prev.pastConditions.filter((c) => c !== condition)
          : [...prev.pastConditions, condition];
        return { ...prev, pastConditions };
      });
    };

    // Go to the next step, with optional validation
    const handleNext = () => {
      // If you have step validation, add it here
      setStep((prev) => Math.min(prev + 1, 5));
    };
  const [step, setStep] = useState(1);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [emergencyError, setEmergencyError] = useState('');
  const [showLogout, setShowLogout] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Demographics
    name: '',
    dob: '',
    gender: '',
    homePhone: '',
    mobilePhone: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    address: '',
    city: '',
    subCounty: '',

    // Step 2: Vital Signs
    temperature: '',
    heartRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    respiratoryRate: '',
    spo2: '',
    height: '',
    weight: '',

    // Step 3: Symptoms
    chiefComplaint: '',
    symptoms: [],
    symptomDuration: '',
    severity: '',

    // Step 4: Medical History
    allergies: '',
    medications: '',
    pastConditions: [],
    surgicalHistory: '',
    familyHistory: '',

    // Step 5: Review
    triageNotes: ''
  });


  const [errors] = useState({});
  const [loading, setLoading] = useState(false);

  const symptoms = [
    'Fever', 'Cough', 'Shortness of Breath', 'Chest Pain', 'Abdominal Pain',
    'Headache', 'Dizziness', 'Nausea/Vomiting', 'Fatigue', 'Body Aches'
  ];

  const pastConditions = [
    'Hypertension', 'Diabetes', 'Asthma', 'Heart Disease', 'Cancer',
    'Thyroid Disease', 'Arthritis', 'Kidney Disease'
  ];


  // SATS Clinical Discriminators (examples, can be expanded)
  const satsDiscriminators = [
    { value: 'airway', label: 'Threatened airway' },
    { value: 'breathing', label: 'Severe respiratory distress' },
    { value: 'circulation', label: 'Shock (SBP < 90 mmHg)' },
    { value: 'neurology', label: 'Unresponsive (GCS < 9)' },
    { value: 'seizure', label: 'Active seizure' },
    { value: 'hypoglycaemia', label: 'Hypoglycaemia (glucose < 3)' },
    { value: 'major_trauma', label: 'Major trauma' },
    { value: 'other', label: 'Other (see notes)' },
  ];

  // SATS Triage Calculation
  const [selectedDiscriminator, setSelectedDiscriminator] = useState('');
  const [discriminatorNotes, setDiscriminatorNotes] = useState('');

  // SATS vital sign cutoffs (simplified for demo)
  function getSATSLevel() {
    // If a clinical discriminator is selected, RED
    if (selectedDiscriminator) return { level: 'RED', status: 'Emergency', color: 'from-red-500 to-red-600' };

    const rr = parseInt(formData.respiratoryRate);
    const hr = parseInt(formData.heartRate);
    const sbp = parseInt(formData.bloodPressureSystolic);
    const spo2 = parseInt(formData.spo2);
    const temp = parseFloat(formData.temperature);

    // RED: Any of these vital signs in critical range
    if (
      rr > 30 || rr < 10 ||
      hr > 130 || hr < 40 ||
      sbp < 90 ||
      spo2 < 90 ||
      temp > 40 || temp < 35
    ) return { level: 'RED', status: 'Emergency', color: 'from-red-500 to-red-600' };

    // ORANGE: Next most urgent
    if (
      (rr >= 21 && rr <= 30) ||
      (hr >= 111 && hr <= 130) ||
      (sbp >= 90 && sbp <= 100) ||
      (spo2 >= 90 && spo2 <= 94) ||
      (temp >= 38.5 && temp <= 40)
    ) return { level: 'ORANGE', status: 'Very Urgent', color: 'from-orange-500 to-orange-600' };

    // YELLOW: Moderate
    if (
      (rr >= 16 && rr <= 20) ||
      (hr >= 91 && hr <= 110) ||
      (sbp >= 101 && sbp <= 110) ||
      (spo2 >= 95 && spo2 <= 96) ||
      (temp >= 37.5 && temp < 38.5)
    ) return { level: 'YELLOW', status: 'Urgent', color: 'from-yellow-500 to-yellow-600' };

    // GREEN: Normal
    if (
      (rr >= 10 && rr <= 15) &&
      (hr >= 51 && hr <= 90) &&
      (sbp > 110) &&
      (spo2 > 96) &&
      (temp >= 35 && temp < 37.5)
    ) return { level: 'GREEN', status: 'Routine', color: 'from-green-500 to-green-600' };

    // BLUE: Dead on arrival (not implemented in UI)
    return { level: 'BLUE', status: 'Deceased', color: 'from-blue-500 to-blue-600' };
  }

  const triageLevel = getSATSLevel();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Example: Simulate loading on submit
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Helper: get nurseId from localStorage or context (assume stored at login)
  function getNurseId() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user && user.id ? user.id : '';
    } catch {
      return '';
    }
  }

  // Helper: get auth token
  function getToken() {
    return localStorage.getItem('token') || '';
  }

  // Strict sequential patient registration and triage submission
  const handleSubmit = async (e, isEmergency = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    // 1. Validate required fields (minimal for demo)
    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    if (!firstName || !lastName) {
      setSubmitError('First and last name are required.');
      setLoading(false);
      return;
    }
    let dateOfBirth = formData.dob;
    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      const d = new Date(dateOfBirth);
      if (!isNaN(d.getTime())) {
        dateOfBirth = d.toISOString().slice(0, 10);
      }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      setSubmitError('Date of birth must be in YYYY-MM-DD format.');
      setLoading(false);
      return;
    }
    const gender = formData.gender;
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      setSubmitError('Gender must be Male, Female, or Other.');
      setLoading(false);
      return;
    }
    const phoneNumber = (formData.mobilePhone || formData.homePhone || '').trim();
    if (!phoneNumber || phoneNumber.length < 10) {
      setSubmitError('Phone number must be at least 10 digits.');
      setLoading(false);
      return;
    }

    // 2. Register patient
    const patientPayload = {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phoneNumber,
      emergencyContact: formData.emergencyContactPhone,
      emergencyContactName: formData.emergencyContactName,
      nationalId: formData.nationalId || '',
      nhifNumber: formData.nhifNumber || '',
      address: formData.address,
      county: formData.city,
      subCounty: formData.subCounty,
      bloodGroup: formData.bloodGroup || '',
      allergies: Array.isArray(formData.allergies) ? formData.allergies : formData.allergies ? [formData.allergies] : [],
      chronicConditions: Array.isArray(formData.pastConditions) ? formData.pastConditions : formData.pastConditions ? [formData.pastConditions] : [],
    };

    let patientId = '';
    try {
      const res = await fetch('/api/v1/triage/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken(),
        },
        body: JSON.stringify(patientPayload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to register patient');
      }
      const patient = await res.json();
      patientId = patient.id;
      // Save patient name and ID to localStorage for search
      if (patientId) {
        const patientName = `${firstName} ${lastName}`.trim().toLowerCase();
        let patientMap = {};
        try {
          patientMap = JSON.parse(localStorage.getItem('patientMap') || '{}');
        } catch (e) { patientMap = {}; }
        patientMap[patientName] = patientId;
        localStorage.setItem('patientMap', JSON.stringify(patientMap));
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to register patient');
      setLoading(false);
      return;
    }

    // 3. Submit triage
    const nurseId = getNurseId();
    // Emergency override: force severe symptoms/vitals
    let vitals = {
      temperature: formData.temperature,
      heartRate: formData.heartRate,
      bloodPressureSystolic: formData.bloodPressureSystolic,
      bloodPressureDiastolic: formData.bloodPressureDiastolic,
      respiratoryRate: formData.respiratoryRate,
      spo2: formData.spo2,
      height: formData.height,
      weight: formData.weight,
    };
    let symptoms = formData.symptoms;
    let chiefComplaint = formData.chiefComplaint;
    if (isEmergency) {
      // Set extreme vitals and symptoms for emergency
      vitals = {
        ...vitals,
        temperature: 42,
        heartRate: 200,
        bloodPressureSystolic: 60,
        bloodPressureDiastolic: 40,
        respiratoryRate: 40,
        spo2: 80,
      };
      symptoms = [...new Set([...(symptoms || []), 'Unresponsive', 'Seizure', 'Not Breathing'])];
      chiefComplaint = 'EMERGENCY: ' + (chiefComplaint || 'Emergency override');
    }
    const triagePayload = {
      patientId,
      nurseId,
      vitals,
      symptoms,
      chiefComplaint,
      triageNotes: formData.triageNotes || '',
    };
    try {
      const res = await fetch('/api/v1/triage/triage/smart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken(),
        },
        body: JSON.stringify(triagePayload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to submit triage');
      }
      setSubmitSuccess('Triage submitted successfully! Patient is now in the queue.');
      setLoading(false);
      // Optionally, redirect to queue view
      if (onNavigate) onNavigate('queue');
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit triage');
      setLoading(false);
    }
  };
  // ...existing code...

  // Emergency submit handler (bypasses normal flow, forces emergency)
  const handleEmergencySubmit = async () => {
    if (!emergencyReason || (emergencyReason === 'Others' && !emergencyNotes.trim())) {
      setEmergencyError('Please select a reason and provide notes if "Others".');
      return;
    }
    setEmergencyError('');
    // Set chief complaint to emergency reason
    setFormData(prev => ({
      ...prev,
      chiefComplaint: `EMERGENCY: ${emergencyReason}${emergencyNotes ? ' - ' + emergencyNotes : ''}`
    }));
    setShowEmergencyModal(false);
    setEmergencyReason('');
    setEmergencyNotes('');
    setEmergencyError('');
    // Submit triage as emergency
    await handleSubmit(null, true);
  };

  return (
    <>
      {submitError && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, margin: 12, textAlign: 'center' }}>{submitError}</div>
      )}
      {submitSuccess && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: 12, borderRadius: 8, margin: 12, textAlign: 'center' }}>{submitSuccess}</div>
      )}
      {/* Fixed TopBar for Nurse Triage */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 50,
        background: 'linear-gradient(to right, #14b8a6, #0d9488)',
        color: '#fff',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: '0 24px'
      }}>
        <h1 style={{fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.01em', margin: 0}}>Nurses Stra-Health Triage</h1>
        <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 12}}>
          {/* Notification Button */}
          <NotificationButton onClick={() => alert('Notifications will appear here. (Backend integration pending)')} />
          {/* Emergency Button */}
          <button
            style={{
              background: 'linear-gradient(to right, #ef4444, #b91c1c)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontWeight: 700,
              fontSize: 16,
              marginRight: 8,
              boxShadow: '0 2px 8px rgba(239,68,68,0.10)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
            onClick={() => setShowEmergencyModal(true)}
          >
            <AlertCircle className="w-5 h-5" style={{marginRight: 4}} /> Emergency
          </button>



          {/* Nurse dropdown: add Medical Form and Queue buttons above Logout */}
          <div style={{ position: 'relative' }}>
            <button
              style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, marginLeft: 16}}
              onClick={() => setShowLogout(prev => !prev)}
              aria-label="User menu"
            >
              <User size={28} />
            </button>
            {showLogout && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                background: '#fff',
                color: '#222',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                minWidth: 140,
                zIndex: 100,
                padding: 8
              }}>
                <button
                  style={{
                    width: '100%',
                    background: '#0d9488',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 16,
                    padding: '8px 0',
                    cursor: 'pointer',
                    border: 'none',
                    borderRadius: 4,
                    marginBottom: 6
                  }}
                  onClick={() => { setShowLogout(false); if (onNavigate) onNavigate('nastriage'); }}
                >
                  Medical Form
                </button>
                <button
                  style={{
                    width: '100%',
                    background: '#14b8a6',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 16,
                    padding: '8px 0',
                    cursor: 'pointer',
                    border: 'none',
                    borderRadius: 4,
                    marginBottom: 6
                  }}
                  onClick={() => { setShowLogout(false); if (onNavigate) onNavigate('queue'); }}
                >
                  Queue
                </button>
                <button
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#0d9488',
                    fontWeight: 600,
                    fontSize: 16,
                    padding: '8px 0',
                    cursor: 'pointer',
                    borderRadius: 4
                  }}
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Emergency Modal */}
        {showEmergencyModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.25)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              padding: 32,
              minWidth: 340,
              maxWidth: 400,
              width: '90%',
              position: 'relative',
            }}>
              <h2 style={{fontWeight: 700, fontSize: 22, color: '#b91c1c', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8}}>
                <AlertCircle className="w-6 h-6" style={{color: '#b91c1c'}} /> Emergency Override
              </h2>
              <p style={{marginBottom: 16, color: '#444'}}>Select the reason for skipping triage forms:</p>
              <form onSubmit={e => { e.preventDefault(); handleEmergencySubmit(); }}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                  {[
                    'Not Breathing',
                    'Seizure-current',
                    'Hypoglycaemia-glucose less than 3',
                    'Cardiac arrest',
                    'Obstructive air way-Not breathing',
                    'Others'
                  ].map(option => (
                    <label key={option} style={{display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, color: '#222'}}>
                      <input
                        type="radio"
                        name="emergencyReason"
                        value={option}
                        checked={emergencyReason === option}
                        onChange={() => { setEmergencyReason(option); if(option !== 'Others') setEmergencyNotes(''); }}
                        style={{marginRight: 8}}
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {emergencyReason === 'Others' && (
                  <div style={{marginTop: 14}}>
                    <textarea
                      placeholder="Please specify reason..."
                      value={emergencyNotes}
                      onChange={e => setEmergencyNotes(e.target.value)}
                      rows={3}
                      style={{width: '100%', borderRadius: 8, border: '1px solid #b91c1c', padding: 8, fontSize: 15, marginTop: 4}}
                    />
                  </div>
                )}
                {emergencyError && <p style={{color: '#b91c1c', marginTop: 8, fontWeight: 500}}>{emergencyError}</p>}
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24}}>
                  <button
                    type="button"
                    onClick={() => { setShowEmergencyModal(false); setEmergencyReason(''); setEmergencyNotes(''); setEmergencyError(''); }}
                    style={{background: '#f3f4f6', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer'}}
                  >Cancel</button>
                  <button
                    type="submit"
                    style={{background: 'linear-gradient(to right, #ef4444, #b91c1c)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 700, fontSize: 15, cursor: 'pointer'}}
                  >Send to Doctor</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </header>
      <div className="w-full bg-gradient-to-br from-gray-50 to-teal-50/30 p-4 md:p-6" style={{paddingTop: '72px'}}>
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Step {step} of 5</span>
              <span className="text-sm font-semibold text-blue-600">{Math.round((step/5)*100)}%</span>
            </div>
            <div className="flex items-center space-x-2">
              {[1,2,3,4,5].map((s) => (
                <div key={s} className="flex-1">
                  <button
                    onClick={() => s < step && setStep(s)}
                    className={`w-full h-2 rounded-full transition-all duration-300 ${
                      s <= step ? 'bg-gradient-to-r from-teal-600 to-teal-700' : 'bg-gray-200'
                    }`}
                    disabled={s > step}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 animate-fadeIn">
            {/* Step 1: Demographics */}
            {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <User className="w-6 h-6 mr-2 text-blue-600" />
                Patient Demographics
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter patient's full name"
                    className="input-field"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="input-group">
                  <label className="input-label">Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                  {errors.dob && <p className="text-red-600 text-sm mt-1">{errors.dob}</p>}
                </div>

                <div className="input-group">
                  <label className="input-label">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
                </div>

                <div className="input-group">
                  <label className="input-label">Mobile Phone *</label>
                  <input
                    type="tel"
                    name="mobilePhone"
                    value={formData.mobilePhone}
                    onChange={handleInputChange}
                    placeholder="+254 712 345 678"
                    className="input-field"
                  />
                  {errors.mobilePhone && <p className="text-red-600 text-sm mt-1">{errors.mobilePhone}</p>}
                </div>

                <div className="input-group">
                  <label className="input-label">Home Phone</label>
                  <input
                    type="tel"
                    name="homePhone"
                    value={formData.homePhone}
                    onChange={handleInputChange}
                    placeholder="Optional"
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="patient@email.com"
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Sub-County</label>
                  <input
                    type="text"
                    name="subCounty"
                    value={formData.subCounty}
                    onChange={handleInputChange}
                    placeholder="Sub-county (optional)"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="input-label">Name</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      placeholder="Contact person name"
                      className="input-field"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Phone</label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      placeholder="Contact number"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Vital Signs */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <Heart className="w-6 h-6 mr-2 text-red-600" />
                Vital Signs Assessment
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Temperature (°C)', name: 'temperature', icon: Thermometer, color: 'text-red-600' },
                  { label: 'Heart Rate (bpm)', name: 'heartRate', icon: Activity, color: 'text-pink-600' },
                  { label: 'Systolic BP (mmHg)', name: 'bloodPressureSystolic', icon: Zap, color: 'text-blue-600' },
                  { label: 'Diastolic BP (mmHg)', name: 'bloodPressureDiastolic', icon: Zap, color: 'text-blue-600' },
                  { label: 'Respiratory Rate', name: 'respiratoryRate', icon: Wind, color: 'text-teal-600' },
                  { label: 'SpO₂ (%)', name: 'spo2', icon: Droplet, color: 'text-cyan-600' }
                ].map((vital) => {
                  const Icon = vital.icon;
                  return (
                    <div key={vital.name} className="input-group">
                      <label className="input-label flex items-center">
                        <Icon className={`w-4 h-4 mr-2 ${vital.color}`} />
                        {vital.label} *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name={vital.name}
                        value={formData[vital.name]}
                        onChange={handleInputChange}
                        placeholder="Enter value"
                        className="input-field"
                      />
                      {errors[vital.name] && <p className="text-red-600 text-sm mt-1">{errors[vital.name]}</p>}
                    </div>
                  );
                })}

                <div className="input-group">
                  <label className="input-label flex items-center">
                    <Ruler className="w-4 h-4 mr-2 text-green-600" />
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="Height in cm"
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label flex items-center">
                    <Gauge className="w-4 h-4 mr-2 text-purple-600" />
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="Weight in kg"
                    className="input-field"
                  />
                </div>
              </div>

              {/* SATS Triage Display */}
              <div className={`bg-gradient-to-r ${triageLevel.color} text-white rounded-2xl p-6 shadow-lg`}>
                <h3 className="text-lg font-bold mb-2">SATS Triage: {triageLevel.level} - {triageLevel.status}</h3>
                <p className="text-white/90">(Based on SATS vital signs and clinical discriminators)</p>
              </div>

              {/* SATS Clinical Discriminator Selection */}
              <div className="mt-6">
                <label className="input-label font-semibold mb-2">SATS Clinical Discriminator (if present):</label>
                <select
                  className="input-field"
                  value={selectedDiscriminator}
                  onChange={e => setSelectedDiscriminator(e.target.value)}
                >
                  <option value="">None</option>
                  {satsDiscriminators.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                {selectedDiscriminator === 'other' && (
                  <textarea
                    className="input-field mt-2"
                    placeholder="Describe other clinical discriminator..."
                    value={discriminatorNotes}
                    onChange={e => setDiscriminatorNotes(e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 3: Symptoms */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <AlertCircle className="w-6 h-6 mr-2 text-orange-600" />
                Chief Complaint & Symptoms
              </h2>

              <div className="input-group">
                <label className="input-label">Chief Complaint *</label>
                <textarea
                  name="chiefComplaint"
                  value={formData.chiefComplaint}
                  onChange={handleInputChange}
                  placeholder="Describe the main reason for visit..."
                  rows="4"
                  className="input-field"
                />
                {errors.chiefComplaint && <p className="text-red-600 text-sm mt-1">{errors.chiefComplaint}</p>}
              </div>

              <div>
                <label className="input-label mb-3">Symptoms Present *</label>
                <div className="grid md:grid-cols-2 gap-3">
                  {symptoms.map((symptom) => (
                    <label key={symptom} className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={formData.symptoms.includes(symptom)}
                        onChange={() => handleSymptomToggle(symptom)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="text-gray-700">{symptom}</span>
                    </label>
                  ))}
                </div>
                {errors.symptoms && <p className="text-red-600 text-sm mt-2">{errors.symptoms}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">Duration of Symptoms</label>
                  <input
                    type="text"
                    name="symptomDuration"
                    value={formData.symptomDuration}
                    onChange={handleInputChange}
                    placeholder="e.g., 3 days"
                    className="input-field"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Severity</label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select severity</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Medical History */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <FileText className="w-6 h-6 mr-2 text-purple-600" />
                Medical History
              </h2>

              <div className="input-group">
                <label className="input-label">Allergies *</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  placeholder="List any known allergies (medications, food, etc.)"
                  rows="3"
                  className="input-field"
                />
                {errors.allergies && <p className="text-red-600 text-sm mt-1">{errors.allergies}</p>}
              </div>

              <div className="input-group">
                <label className="input-label">Current Medications</label>
                <textarea
                  name="medications"
                  value={formData.medications}
                  onChange={handleInputChange}
                  placeholder="List current medications with dosages"
                  rows="3"
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label mb-3">Past Medical Conditions</label>
                <div className="grid md:grid-cols-2 gap-3">
                  {pastConditions.map((condition) => (
                    <label key={condition} className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={formData.pastConditions.includes(condition)}
                        onChange={() => handleConditionToggle(condition)}
                        className="w-5 h-5 text-purple-600 rounded"
                      />
                      <span className="text-gray-700">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Surgical History</label>
                <textarea
                  name="surgicalHistory"
                  value={formData.surgicalHistory}
                  onChange={handleInputChange}
                  placeholder="List any previous surgeries"
                  rows="3"
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Family Medical History</label>
                <textarea
                  name="familyHistory"
                  value={formData.familyHistory}
                  onChange={handleInputChange}
                  placeholder="Any significant family medical history"
                  rows="3"
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* Step 5: Review & Summary */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                Review & Triage Assessment
              </h2>

              {/* SATS Triage Badge */}
              <div className={`bg-gradient-to-r ${triageLevel.color} text-white rounded-2xl p-6 shadow-lg mb-6`}>
                <h3 className="text-2xl font-bold mb-2">{triageLevel.level} - {triageLevel.status}</h3>
                <p className="text-white/90">(SATS Triage Category)</p>
                {selectedDiscriminator && (
                  <div className="mt-2 text-white/90">
                    <span className="font-semibold">Discriminator:</span> {satsDiscriminators.find(d => d.value === selectedDiscriminator)?.label || 'Other'}
                    {selectedDiscriminator === 'other' && discriminatorNotes && (
                      <span> - {discriminatorNotes}</span>
                    )}
                  </div>
                )}
              </div>
          {/* SATS Reference Chart */}
          <div className="mt-8 mb-4">
            <h3 className="font-bold text-gray-900 mb-2">SATS Adult Triage Reference (Vital Signs)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border border-gray-300 rounded-lg bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 border">Category</th>
                    <th className="px-2 py-1 border">Resp. Rate</th>
                    <th className="px-2 py-1 border">Heart Rate</th>
                    <th className="px-2 py-1 border">Systolic BP</th>
                    <th className="px-2 py-1 border">SpO₂</th>
                    <th className="px-2 py-1 border">Temp (°C)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-red-100">
                    <td className="px-2 py-1 border font-bold text-red-700">RED</td>
                    <td className="px-2 py-1 border">&gt;30 or &lt;10</td>
                    <td className="px-2 py-1 border">&gt;130 or &lt;40</td>
                    <td className="px-2 py-1 border">&lt;90</td>
                    <td className="px-2 py-1 border">&lt;90</td>
                    <td className="px-2 py-1 border">&gt;40 or &lt;35</td>
                  </tr>
                  <tr className="bg-orange-100">
                    <td className="px-2 py-1 border font-bold text-orange-700">ORANGE</td>
                    <td className="px-2 py-1 border">21-30</td>
                    <td className="px-2 py-1 border">111-130</td>
                    <td className="px-2 py-1 border">90-100</td>
                    <td className="px-2 py-1 border">90-94</td>
                    <td className="px-2 py-1 border">38.5-40</td>
                  </tr>
                  <tr className="bg-yellow-100">
                    <td className="px-2 py-1 border font-bold text-yellow-700">YELLOW</td>
                    <td className="px-2 py-1 border">16-20</td>
                    <td className="px-2 py-1 border">91-110</td>
                    <td className="px-2 py-1 border">101-110</td>
                    <td className="px-2 py-1 border">95-96</td>
                    <td className="px-2 py-1 border">37.5-38.4</td>
                  </tr>
                  <tr className="bg-green-100">
                    <td className="px-2 py-1 border font-bold text-green-700">GREEN</td>
                    <td className="px-2 py-1 border">10-15</td>
                    <td className="px-2 py-1 border">51-90</td>
                    <td className="px-2 py-1 border">&gt;110</td>
                    <td className="px-2 py-1 border">&gt;96</td>
                    <td className="px-2 py-1 border">35-37.4</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

              {/* Patient Summary */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900">Patient Information</h3>
                <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <p><span className="font-semibold text-gray-700">Name:</span> {formData.name}</p>
                  <p><span className="font-semibold text-gray-700">Phone:</span> {formData.mobilePhone}</p>
                  <p><span className="font-semibold text-gray-700">DOB:</span> {formData.dob}</p>
                  <p><span className="font-semibold text-gray-700">Gender:</span> {formData.gender}</p>
                </div>

                <h3 className="font-bold text-gray-900 mt-6">Chief Complaint</h3>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-gray-800">{formData.chiefComplaint}</p>
                </div>

                <h3 className="font-bold text-gray-900 mt-6">Symptoms</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.symptoms.map((symptom) => (
                    <span key={symptom} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Triage Notes</label>
                <textarea
                  name="triageNotes"
                  value={formData.triageNotes}
                  onChange={handleInputChange}
                  placeholder="Additional notes for clinical staff..."
                  rows="4"
                  className="input-field"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 gap-4">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              step === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-sm text-gray-600 font-medium">
            Step {step} of 5
          </div>

          {step < 5 ? (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 btn btn-primary"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 btn btn-success px-8"
            >
              <Save className="w-4 h-4" />
              <span>Complete Registration</span>
            </button>
          )}
        </div>

        {/* Loading Spinner Example */}
        {loading && <LoadingSpinner text="Processing..." fullScreen />}
      </div>
    </div>
    </>
  );
}
