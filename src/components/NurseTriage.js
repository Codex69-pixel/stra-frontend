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
  // State declarations
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  // Emergency modal state
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [emergencyError, setEmergencyError] = useState('');
  // Submit error/success state
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  
  // SATS discriminators and triage
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
  const [selectedDiscriminator, setSelectedDiscriminator] = useState('');
  const [discriminatorNotes, setDiscriminatorNotes] = useState('');
  
  // Symptoms and chronic conditions lists
  const symptomsList = [
    'Fever', 'Cough', 'Shortness of Breath', 'Chest Pain', 'Abdominal Pain',
    'Headache', 'Dizziness', 'Nausea/Vomiting', 'Fatigue', 'Body Aches'
  ];
  const chronicConditionsList = [
    'Hypertension', 'Diabetes', 'Asthma', 'Heart Disease', 'Cancer',
    'Thyroid Disease', 'Arthritis', 'Kidney Disease'
  ];
  
  // Triage level calculation (dummy)
  const triageLevel = { level: 'GREEN', status: 'Normal', color: 'from-green-500 to-green-600' };

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Patient Registration
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    phoneNumber: '',
    emergencyContact: '',
    emergencyContactName: '',
    nationalId: '',
    nhifNumber: '',
    address: '',
    county: '',
    subCounty: '',
    bloodGroup: '',
    allergies: '',
    allergyInput: '',
    chronicConditions: [],
    conditionInput: '',
    // Step 2: Vitals
    temperature: '',
    systolicBp: '',
    diastolicBp: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    bloodGlucose: '',
    painScale: '',
    weight: '',
    height: '',
    avpu: '',
    mobility: '',
    // For backward compatibility with field names used in validation
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    spo2: '',
    // Step 2: Symptoms (array for checkboxes)
    symptoms: [],
    // Step 3: Additional fields
    symptomDuration: '',
    severity: '',
    // Step 4: Medical History
    medications: '',
    surgicalHistory: '',
    familyHistory: '',
    // Chief complaint and notes
    chiefComplaint: '',
    triageNotes: '',
    name: '' // For summary display
  });

  // Symptom toggle handler
  const handleSymptomToggle = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  // Condition toggle handler
  const handleConditionToggle = (condition) => {
    setFormData(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter(c => c !== condition)
        : [...prev.chronicConditions, condition]
    }));
  };

  // Input handler
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (name === 'allergyInput') {
      setFormData(prev => ({ ...prev, allergyInput: value }));
    } else if (name === 'conditionInput') {
      setFormData(prev => ({ ...prev, conditionInput: value }));
    } else if (name === 'firstName' || name === 'lastName') {
      // Update name field for summary display
      setFormData(prev => {
        const newData = { ...prev, [name]: value };
        newData.name = `${newData.firstName} ${newData.lastName}`.trim();
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Add allergy
  const handleAddAllergy = () => {
    if (formData.allergyInput && formData.allergyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: prev.allergies
          ? prev.allergies + ',' + prev.allergyInput.trim()
          : prev.allergyInput.trim(),
        allergyInput: ''
      }));
    }
  };

  // Add chronic condition
  const handleAddCondition = () => {
    if (formData.conditionInput && formData.conditionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        chronicConditions: [...prev.chronicConditions, prev.conditionInput.trim()],
        conditionInput: ''
      }));
    }
  };

  // Handle next step
  const handleNext = () => {
    const validation = validateStep(step);
    if (validation.valid) {
      setStep(step + 1);
    } else {
      setErrors(validation.errors);
    }
  };

  // Register patient
  const handleRegisterPatient = async () => {
    setRegistering(true);
    setRegisterError(null);
    setRegisterSuccess(null);
    
    // Validate only registration fields
    const errors = {};
    if (!formData.firstName) errors.firstName = 'First name is required.';
    if (!formData.lastName) errors.lastName = 'Last name is required.';
    if (!formData.dob) errors.dob = 'Date of birth is required.';
    if (!formData.gender) errors.gender = 'Gender is required.';
    if (!formData.phoneNumber) errors.phoneNumber = 'Phone number is required.';
    if (!formData.county) errors.county = 'County is required.';
    if (!formData.subCounty) errors.subCounty = 'Sub-county is required.';
    if (!formData.bloodGroup) errors.bloodGroup = 'Blood group is required.';
    
    setErrors(errors);
    if (Object.keys(errors).length > 0) {
      setRegistering(false);
      return;
    }
    
    // Prepare payload
    const patientPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dob,
      gender: formData.gender,
      phoneNumber: formData.phoneNumber,
      emergencyContact: formData.emergencyContact,
      emergencyContactName: formData.emergencyContactName,
      nationalId: formData.nationalId,
      nhifNumber: formData.nhifNumber,
      address: formData.address,
      county: formData.county,
      subCounty: formData.subCounty,
      bloodGroup: formData.bloodGroup,
      allergies: formData.allergies,
      chronicConditions: formData.chronicConditions,
    };
    
    try {
      const res = await fetch('/api/v1/triage/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (localStorage.getItem('token') || ''),
        },
        body: JSON.stringify(patientPayload),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to register patient');
      }
      
      await res.json();
      setRegisterSuccess('Patient registered successfully!');
      setRegistering(false);
      
      setTimeout(() => {
        setStep(2);
        setRegisterSuccess(null);
      }, 1000);
    } catch (err) {
      setRegisterError(err.message || 'Failed to register patient');
      setRegistering(false);
    }
  };

  // Helper: get nurseId from localStorage
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

  // Validation for each step
  function validateStep(step) {
    const errors = {};
    
    if (step === 1) {
      if (!formData.firstName) errors.firstName = 'First name is required.';
      if (!formData.lastName) errors.lastName = 'Last name is required.';
      if (!formData.dob) errors.dob = 'Date of birth is required (YYYY-MM-DD).';
      if (!formData.gender) errors.gender = 'Gender must be Male, Female, or Other.';
      if (!formData.phoneNumber) errors.phoneNumber = 'Phone number is required.';
      if (!formData.county) errors.county = 'County is required.';
      if (!formData.subCounty) errors.subCounty = 'Sub-county is required.';
      if (!formData.bloodGroup) errors.bloodGroup = 'Blood group is required.';
    }
    
    if (step === 2) {
      if (!formData.temperature) errors.temperature = 'Temperature is required.';
      if (!formData.systolicBp && !formData.bloodPressureSystolic) errors.bloodPressureSystolic = 'Systolic BP is required.';
      if (!formData.diastolicBp && !formData.bloodPressureDiastolic) errors.bloodPressureDiastolic = 'Diastolic BP is required.';
      if (!formData.heartRate) errors.heartRate = 'Heart rate is required.';
      if (!formData.respiratoryRate) errors.respiratoryRate = 'Respiratory rate is required.';
      if (!formData.oxygenSaturation && !formData.spo2) errors.spo2 = 'Oxygen saturation is required.';
      if (!formData.weight) errors.weight = 'Weight is required.';
      if (!formData.height) errors.height = 'Height is required.';
      if (!formData.avpu) errors.avpu = 'AVPU is required.';
      if (!formData.mobility) errors.mobility = 'Mobility is required.';
    }
    
    if (step === 3) {
      if (!formData.chiefComplaint) errors.chiefComplaint = 'Chief complaint is required.';
      if (!formData.symptoms || formData.symptoms.length === 0) errors.symptoms = 'At least one symptom is required.';
    }
    
    if (step === 4) {
      if (!formData.allergies) errors.allergies = 'Allergies information is required.';
      if (!formData.chronicConditions || formData.chronicConditions.length === 0) errors.chronicConditions = 'At least one chronic condition is required.';
    }
    
    return { valid: Object.keys(errors).length === 0, errors };
  }

  // Complete triage
  const handleSubmit = async (e, isEmergency = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    // Validate all steps before submit
    let allErrors = {};
    for (let s = 1; s <= 4; s++) {
      const stepValidation = validateStep(s);
      allErrors = { ...allErrors, ...stepValidation.errors };
    }
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setSubmitError('Please correct the errors before submitting.');
      setLoading(false);
      return;
    }

    // 1. Register patient
    const patientPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dob,
      gender: formData.gender,
      phoneNumber: formData.phoneNumber,
      emergencyContact: formData.emergencyContact,
      emergencyContactName: formData.emergencyContactName,
      nationalId: formData.nationalId,
      nhifNumber: formData.nhifNumber,
      address: formData.address,
      county: formData.county,
      subCounty: formData.subCounty,
      bloodGroup: formData.bloodGroup,
      allergies: formData.allergies,
      chronicConditions: formData.chronicConditions,
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
      patientId = patient.id || patient.patientId;
      
      // Save patient name and ID to localStorage for search
      if (patientId) {
        const patientName = `${formData.firstName} ${formData.lastName}`.trim().toLowerCase();
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

    // 2. Submit triage
    const nurseId = getNurseId();
    
    let vitals = {
      temperature: parseFloat(formData.temperature),
      systolicBp: parseInt(formData.systolicBp || formData.bloodPressureSystolic),
      diastolicBp: parseInt(formData.diastolicBp || formData.bloodPressureDiastolic),
      heartRate: parseInt(formData.heartRate),
      respiratoryRate: parseInt(formData.respiratoryRate),
      oxygenSaturation: parseInt(formData.oxygenSaturation || formData.spo2),
      bloodGlucose: parseFloat(formData.bloodGlucose) || null,
      painScale: parseInt(formData.painScale) || null,
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      avpu: formData.avpu,
      mobility: formData.mobility,
    };
    
    let symptoms = formData.symptoms;
    let chiefComplaint = formData.chiefComplaint;
    
    if (isEmergency) {
      // Set extreme vitals and symptoms for emergency
      vitals = {
        ...vitals,
        temperature: 42,
        heartRate: 200,
        systolicBp: 60,
        diastolicBp: 40,
        respiratoryRate: 40,
        oxygenSaturation: 80,
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
      if (onNavigate) onNavigate('queue');
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit triage');
      setLoading(false);
    }
  };

  // Emergency submit handler
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

          {/* Nurse dropdown */}
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
      </header>

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
            {/* Step 1: Patient Registration */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                  <User className="w-6 h-6 mr-2 text-blue-600" />
                  Patient Registration
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="input-label">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      className="input-field"
                    />
                    {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      className="input-field"
                    />
                    {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
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
                    <label className="input-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+254 712 345 678"
                      className="input-field"
                    />
                    {errors.phoneNumber && <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Emergency Contact</label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      placeholder="Emergency Contact"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Emergency Contact Name</label>
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
                    <label className="input-label">National ID</label>
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleInputChange}
                      placeholder="National ID"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">NHIF Number</label>
                    <input
                      type="text"
                      name="nhifNumber"
                      value={formData.nhifNumber}
                      onChange={handleInputChange}
                      placeholder="NHIF Number"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Address"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">County *</label>
                    <input
                      type="text"
                      name="county"
                      value={formData.county}
                      onChange={handleInputChange}
                      placeholder="County"
                      className="input-field"
                    />
                    {errors.county && <p className="text-red-600 text-sm mt-1">{errors.county}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Sub County *</label>
                    <input
                      type="text"
                      name="subCounty"
                      value={formData.subCounty}
                      onChange={handleInputChange}
                      placeholder="Sub County"
                      className="input-field"
                    />
                    {errors.subCounty && <p className="text-red-600 text-sm mt-1">{errors.subCounty}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Blood Group *</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                    {errors.bloodGroup && <p className="text-red-600 text-sm mt-1">{errors.bloodGroup}</p>}
                  </div>
                </div>
                
                {/* Allergies Section */}
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Allergies</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.allergies || '').split(',').filter(a => a.trim()).map((allergy, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        {allergy}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="allergyInput"
                      value={formData.allergyInput || ''}
                      onChange={handleInputChange}
                      placeholder="Allergy"
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleAddAllergy}
                    >Add Allergy</button>
                  </div>
                </div>
                
                {/* Chronic Conditions Section */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Chronic Conditions</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.chronicConditions || []).map((condition, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {condition}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="conditionInput"
                      value={formData.conditionInput || ''}
                      onChange={handleInputChange}
                      placeholder="Condition"
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleAddCondition}
                    >Add Condition</button>
                  </div>
                </div>
                
                {/* Register Patient Button */}
                <div className="flex flex-col items-end mt-8 gap-2">
                  {registerError && <div className="text-red-600 font-semibold mb-2">{registerError}</div>}
                  {registerSuccess && <div className="text-green-600 font-semibold mb-2">{registerSuccess}</div>}
                  <button
                    type="button"
                    className="btn btn-success px-8 py-3 text-lg font-bold"
                    onClick={handleRegisterPatient}
                    disabled={registering}
                  >
                    {registering ? 'Registering...' : 'Register Patient'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Vitals & Symptoms */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                  <Heart className="w-6 h-6 mr-2 text-red-600" />
                  Vitals & Symptoms
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="input-group">
                    <label className="input-label flex items-center">
                      <Thermometer className="w-4 h-4 mr-2 text-red-600" />
                      Temperature (°C) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleInputChange}
                      placeholder="Enter value"
                      className="input-field"
                    />
                    {errors.temperature && <p className="text-red-600 text-sm mt-1">{errors.temperature}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label flex items-center">
                      <Activity className="w-4 h-4 mr-2 text-pink-600" />
                      Heart Rate (bpm) *
                    </label>
                    <input
                      type="number"
                      name="heartRate"
                      value={formData.heartRate}
                      onChange={handleInputChange}
                      placeholder="Enter value"
                      className="input-field"
                    />
                    {errors.heartRate && <p className="text-red-600 text-sm mt-1">{errors.heartRate}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-blue-600" />
                      Systolic BP (mmHg) *
                    </label>
                    <input
                      type="number"
                      name="bloodPressureSystolic"
                      value={formData.bloodPressureSystolic}
                      onChange={handleInputChange}
                      placeholder="Enter value"
                      className="input-field"
                    />
                    {errors.bloodPressureSystolic && <p className="text-red-600 text-sm mt-1">{errors.bloodPressureSystolic}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-blue-600" />
                      Diastolic BP (mmHg) *
                    </label>
                    <input
                      type="number"
                      name="bloodPressureDiastolic"
                      value={formData.bloodPressureDiastolic}
                      onChange={handleInputChange}
                      placeholder="Enter value"
                      className="input-field"
                    />
                    {errors.bloodPressureDiastolic && <p className="text-red-600 text-sm mt-1">{errors.bloodPressureDiastolic}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label flex items-center">
                      <Wind className="w-4 h-4 mr-2 text-teal-600" />
                      Respiratory Rate *
                    </label>
                    <input
                      type="number"
                      name="respiratoryRate"
                      value={formData.respiratoryRate}
                      onChange={handleInputChange}
                      placeholder="Enter value"
                      className="input-field"
                    />
                    {errors.respiratoryRate && <p className="text-red-600 text-sm mt-1">{errors.respiratoryRate}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label flex items-center">
                      <Droplet className="w-4 h-4 mr-2 text-cyan-600" />
                      SpO₂ (%) *
                    </label>
                    <input
                      type="number"
                      name="spo2"
                      value={formData.spo2}
                      onChange={handleInputChange}
                      placeholder="Enter value"
                      className="input-field"
                    />
                    {errors.spo2 && <p className="text-red-600 text-sm mt-1">{errors.spo2}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label flex items-center">
                      <Gauge className="w-4 h-4 mr-2 text-purple-600" />
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="Weight in kg"
                      className="input-field"
                    />
                    {errors.weight && <p className="text-red-600 text-sm mt-1">{errors.weight}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label flex items-center">
                      <Ruler className="w-4 h-4 mr-2 text-green-600" />
                      Height (cm) *
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      placeholder="Height in cm"
                      className="input-field"
                    />
                    {errors.height && <p className="text-red-600 text-sm mt-1">{errors.height}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">AVPU *</label>
                    <select
                      name="avpu"
                      value={formData.avpu}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Select AVPU</option>
                      <option value="ALERT">ALERT</option>
                      <option value="VERBAL">VERBAL</option>
                      <option value="PAIN">PAIN</option>
                      <option value="UNRESPONSIVE">UNRESPONSIVE</option>
                    </select>
                    {errors.avpu && <p className="text-red-600 text-sm mt-1">{errors.avpu}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Mobility *</label>
                    <select
                      name="mobility"
                      value={formData.mobility}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Select Mobility</option>
                      <option value="WALKING">WALKING</option>
                      <option value="WHEELCHAIR">WHEELCHAIR</option>
                      <option value="STRETCHER">STRETCHER</option>
                    </select>
                    {errors.mobility && <p className="text-red-600 text-sm mt-1">{errors.mobility}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Blood Glucose</label>
                    <input
                      type="number"
                      step="0.1"
                      name="bloodGlucose"
                      value={formData.bloodGlucose}
                      onChange={handleInputChange}
                      placeholder="Blood Glucose"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Pain Scale</label>
                    <input
                      type="number"
                      name="painScale"
                      value={formData.painScale}
                      onChange={handleInputChange}
                      placeholder="Pain Scale (0-10)"
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
                    {symptomsList.map((symptom) => (
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
                  <label className="input-label mb-3">Chronic Conditions *</label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {chronicConditionsList.map((condition) => (
                      <label key={condition} className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          checked={formData.chronicConditions.includes(condition)}
                          onChange={() => handleConditionToggle(condition)}
                          className="w-5 h-5 text-purple-600 rounded"
                        />
                        <span className="text-gray-700">{condition}</span>
                      </label>
                    ))}
                  </div>
                  {errors.chronicConditions && <p className="text-red-600 text-sm mt-2">{errors.chronicConditions}</p>}
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
                    <p><span className="font-semibold text-gray-700">Name:</span> {formData.name || `${formData.firstName} ${formData.lastName}`}</p>
                    <p><span className="font-semibold text-gray-700">Phone:</span> {formData.phoneNumber}</p>
                    <p><span className="font-semibold text-gray-700">DOB:</span> {formData.dob}</p>
                    <p><span className="font-semibold text-gray-700">Gender:</span> {formData.gender}</p>
                  </div>

                  <h3 className="font-bold text-gray-900 mt-6">Chief Complaint</h3>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-gray-800">{formData.chiefComplaint}</p>
                  </div>

                  <h3 className="font-bold text-gray-900 mt-6">Symptoms</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(formData.symptoms) && formData.symptoms.map((symptom) => (
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

          {/* Loading Spinner */}
          {loading && <LoadingSpinner text="Processing..." fullScreen />}
        </div>
      </div>
    </>
  );
}