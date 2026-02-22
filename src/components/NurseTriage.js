import React, { useState } from 'react';
import NotificationButton from './common/NotificationButton';
import { logout } from '../utils/logout';
import {
  User, Heart, Activity, Save, FileText, AlertCircle,
  CheckCircle, ArrowRight, ArrowLeft, UserCircle, Phone,
  MapPin, Droplet, Calendar, Users, Plus, X,
  Thermometer, Zap, Droplet as DropletIcon, Wind, Gauge, Ruler,
  Scale, Eye, Bone, Brain, AlertTriangle, Heart as HeartIcon
} from 'lucide-react';
import LoadingSpinner from './common/LoadingSpinner';

export function NurseTriage({ onNavigate }) {
  // State declarations
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [emergencyError, setEmergencyError] = useState('');
  const [errors, setErrors] = useState({});

  // Form data state - Patient Registration (Step 1)
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
    heartRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    respiratoryRate: '',
    spo2: '',
    bloodGlucose: '',
    painScale: '',
    weight: '',
    height: '',
    avpu: '',
    mobility: '',
    
    // Step 3: Symptoms (object for checkboxes)
    symptoms: {
      notBreathing: false,
      seizureCurrent: false,
      burnFacialInhalation: false,
      cardiacArrest: false,
      airwayObstruction: false,
      reducedConsciousness: false,
      severeMechanismInjury: false,
      shortnessOfBreath: false,
      coughingBlood: false,
      chestPain: false,
      stabbedNeckOrChest: false,
      uncontrolledHemorrhage: false,
      seizurePostIctal: false,
      acuteStrokeSigns: false,
      aggression: false,
      threatenedLimb: false,
      dislocationLargeJoint: false,
      compoundFracture: false,
      burnOver20Percent: false,
      electricalBurn: false,
      circumferentialBurn: false,
      chemicalBurn: false,
      poisoningOverdose: false,
      vomitingFreshBlood: false,
      pregnancyAbdominalTrauma: false,
      pregnancyAbdominalPain: false,
      controlledHemorrhage: false,
      dislocationFingerToe: false,
      closedFracture: false,
      burnOther: false,
      abdominalPain: false,
      vomitingPersistently: false,
      pregnancyTrauma: false,
      pregnancyPvBleed: false,
      ketonuria: false,
      backache: false,
      diabetesHistory: false,
      moderatePain: false,
      severePain: false
    },
    
    // Step 4: Chief Complaint & Medical History
    chiefComplaint: '',
    symptomDuration: '',
    severity: '',
    medications: '',
    surgicalHistory: '',
    familyHistory: '',
    
    // Step 5: Additional Notes
    triageNotes: ''
  });

  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // SATS Clinical Discriminators
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

  // SATS vital sign calculation
  function getSATSLevel() {
    if (selectedDiscriminator) return { level: 'RED', status: 'Emergency', color: 'from-red-500 to-red-600' };

    const rr = parseInt(formData.respiratoryRate);
    const hr = parseInt(formData.heartRate);
    const sbp = parseInt(formData.bloodPressureSystolic);
    const spo2 = parseInt(formData.spo2);
    const temp = parseFloat(formData.temperature);

    if (
      rr > 30 || rr < 10 ||
      hr > 130 || hr < 40 ||
      sbp < 90 ||
      spo2 < 90 ||
      temp > 40 || temp < 35
    ) return { level: 'RED', status: 'Emergency', color: 'from-red-500 to-red-600' };

    if (
      (rr >= 21 && rr <= 30) ||
      (hr >= 111 && hr <= 130) ||
      (sbp >= 90 && sbp <= 100) ||
      (spo2 >= 90 && spo2 <= 94) ||
      (temp >= 38.5 && temp <= 40)
    ) return { level: 'ORANGE', status: 'Very Urgent', color: 'from-orange-500 to-orange-600' };

    if (
      (rr >= 16 && rr <= 20) ||
      (hr >= 91 && hr <= 110) ||
      (sbp >= 101 && sbp <= 110) ||
      (spo2 >= 95 && spo2 <= 96) ||
      (temp >= 37.5 && temp < 38.5)
    ) return { level: 'YELLOW', status: 'Urgent', color: 'from-yellow-500 to-yellow-600' };

    if (
      (rr >= 10 && rr <= 15) &&
      (hr >= 51 && hr <= 90) &&
      (sbp > 110) &&
      (spo2 > 96) &&
      (temp >= 35 && temp < 37.5)
    ) return { level: 'GREEN', status: 'Routine', color: 'from-green-500 to-green-600' };

    return { level: 'BLUE', status: 'Deceased', color: 'from-blue-500 to-blue-600' };
  }

  const triageLevel = getSATSLevel();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('symptom.')) {
      // Handle symptom checkboxes
      const symptomKey = name.replace('symptom.', '');
      setFormData(prev => ({
        ...prev,
        symptoms: {
          ...prev.symptoms,
          [symptomKey]: checked
        }
      }));
    } else {
      // Handle regular inputs
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Step 1: Register patient
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(null);

  const handleRegisterPatient = async () => {
    setRegistering(true);
    setRegisterError(null);
    setRegisterSuccess(null);
    
    // Validate registration fields
    const errors = {};
    if (!formData.firstName) errors.firstName = 'First name is required.';
    if (!formData.lastName) errors.lastName = 'Last name is required.';
    if (!formData.dob) errors.dob = 'Date of birth is required.';
    if (!formData.gender) errors.gender = 'Gender is required.';
    if (!formData.phoneNumber) errors.phoneNumber = 'Phone number is required.';
    
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
          'Authorization': 'Bearer ' + getToken(),
        },
        body: JSON.stringify(patientPayload),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to register patient');
      }
      
      setRegisterSuccess('Patient registered successfully!');
      setRegistering(false);
      setTimeout(() => {
        setStep(2);
        setRegisterSuccess(null);
      }, 1500);
    } catch (err) {
      setRegisterError(err.message || 'Failed to register patient');
      setRegistering(false);
    }
  };

  // Helper: get auth token
  function getToken() {
    return localStorage.getItem('token') || '';
  }

  // Step navigation validation
  const handleNext = () => {
    if (step === 2) {
      // Validate vitals
      const errors = {};
      if (!formData.temperature) errors.temperature = 'Temperature is required';
      if (!formData.heartRate) errors.heartRate = 'Heart rate is required';
      if (!formData.bloodPressureSystolic) errors.bloodPressureSystolic = 'Systolic BP is required';
      if (!formData.bloodPressureDiastolic) errors.bloodPressureDiastolic = 'Diastolic BP is required';
      if (!formData.respiratoryRate) errors.respiratoryRate = 'Respiratory rate is required';
      if (!formData.spo2) errors.spo2 = 'SpO₂ is required';
      if (!formData.weight) errors.weight = 'Weight is required';
      if (!formData.height) errors.height = 'Height is required';
      if (!formData.avpu) errors.avpu = 'AVPU is required';
      if (!formData.mobility) errors.mobility = 'Mobility is required';
      
      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        return;
      }
    }
    
    if (step === 3) {
      // Validate at least one symptom is selected
      const hasSymptom = Object.values(formData.symptoms).some(value => value === true);
      if (!hasSymptom) {
        setErrors({ symptoms: 'Please select at least one symptom' });
        return;
      }
    }
    
    if (step === 4) {
      if (!formData.chiefComplaint) {
        setErrors({ chiefComplaint: 'Chief complaint is required' });
        return;
      }
    }
    
    setErrors({});
    setStep(step + 1);
  };

  // Final submission to smart triage
  const handleSubmit = async (e, isEmergency = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    // Register patient first if not already registered
    let patientId = '';
    try {
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
    } catch (err) {
      setSubmitError(err.message || 'Failed to register patient');
      setLoading(false);
      return;
    }

    // Submit triage
    const vitals = {
      temperature: parseFloat(formData.temperature),
      systolicBp: parseInt(formData.bloodPressureSystolic),
      diastolicBp: parseInt(formData.bloodPressureDiastolic),
      heartRate: parseInt(formData.heartRate),
      respiratoryRate: parseInt(formData.respiratoryRate),
      oxygenSaturation: parseInt(formData.spo2),
      bloodGlucose: parseFloat(formData.bloodGlucose) || null,
      painScale: parseInt(formData.painScale) || null,
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      avpu: formData.avpu,
      mobility: formData.mobility,
    };

    let symptoms = { ...formData.symptoms };
    let chiefComplaint = formData.chiefComplaint;
    
    if (isEmergency) {
      vitals = {
        ...vitals,
        temperature: 42,
        heartRate: 200,
        systolicBp: 60,
        diastolicBp: 40,
        respiratoryRate: 40,
        oxygenSaturation: 80,
      };
      chiefComplaint = 'EMERGENCY: ' + (chiefComplaint || 'Emergency override');
    }

    const triagePayload = {
      patientId,
      nurseId: getNurseId(),
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

  function getNurseId() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user && user.id ? user.id : '';
    } catch {
      return '';
    }
  }

  const handleEmergencySubmit = async () => {
    if (!emergencyReason || (emergencyReason === 'Others' && !emergencyNotes.trim())) {
      setEmergencyError('Please select a reason and provide notes if "Others".');
      return;
    }
    setEmergencyError('');
    setFormData(prev => ({
      ...prev,
      chiefComplaint: `EMERGENCY: ${emergencyReason}${emergencyNotes ? ' - ' + emergencyNotes : ''}`
    }));
    setShowEmergencyModal(false);
    setEmergencyReason('');
    setEmergencyNotes('');
    setEmergencyError('');
    await handleSubmit(null, true);
  };

  // Group symptoms by category for better organization
  const symptomCategories = {
    "Critical": [
      { key: 'notBreathing', label: 'Not Breathing', icon: AlertTriangle },
      { key: 'cardiacArrest', label: 'Cardiac Arrest', icon: HeartIcon },
      { key: 'airwayObstruction', label: 'Airway Obstruction', icon: Wind },
      { key: 'uncontrolledHemorrhage', label: 'Uncontrolled Hemorrhage', icon: DropletIcon },
    ],
    "Neurological": [
      { key: 'seizureCurrent', label: 'Seizure (Current)', icon: Brain },
      { key: 'seizurePostIctal', label: 'Seizure (Post-Ictal)', icon: Brain },
      { key: 'reducedConsciousness', label: 'Reduced Consciousness', icon: Eye },
      { key: 'acuteStrokeSigns', label: 'Acute Stroke Signs', icon: Brain },
    ],
    "Respiratory": [
      { key: 'shortnessOfBreath', label: 'Shortness of Breath', icon: Wind },
      { key: 'coughingBlood', label: 'Coughing Blood', icon: Droplet },
    ],
    "Cardiac": [
      { key: 'chestPain', label: 'Chest Pain', icon: Heart },
    ],
    "Trauma": [
      { key: 'severeMechanismInjury', label: 'Severe Mechanism Injury', icon: Activity },
      { key: 'stabbedNeckOrChest', label: 'Stabbed Neck/Chest', icon: AlertCircle },
      { key: 'threatenedLimb', label: 'Threatened Limb', icon: Activity },
      { key: 'dislocationLargeJoint', label: 'Dislocation (Large Joint)', icon: Bone },
      { key: 'dislocationFingerToe', label: 'Dislocation (Finger/Toe)', icon: Bone },
      { key: 'compoundFracture', label: 'Compound Fracture', icon: Bone },
      { key: 'closedFracture', label: 'Closed Fracture', icon: Bone },
    ],
    "Burns": [
      { key: 'burnFacialInhalation', label: 'Burn (Facial/Inhalation)', icon: AlertCircle },
      { key: 'burnOver20Percent', label: 'Burn Over 20%', icon: AlertCircle },
      { key: 'electricalBurn', label: 'Electrical Burn', icon: Zap },
      { key: 'circumferentialBurn', label: 'Circumferential Burn', icon: AlertCircle },
      { key: 'chemicalBurn', label: 'Chemical Burn', icon: Droplet },
      { key: 'burnOther', label: 'Burn (Other)', icon: AlertCircle },
    ],
    "Other": [
      { key: 'aggression', label: 'Aggression', icon: AlertTriangle },
      { key: 'poisoningOverdose', label: 'Poisoning/Overdose', icon: AlertCircle },
      { key: 'vomitingFreshBlood', label: 'Vomiting Fresh Blood', icon: Droplet },
      { key: 'abdominalPain', label: 'Abdominal Pain', icon: AlertCircle },
      { key: 'vomitingPersistently', label: 'Vomiting Persistently', icon: AlertCircle },
      { key: 'backache', label: 'Backache', icon: Activity },
      { key: 'diabetesHistory', label: 'Diabetes History', icon: Activity },
      { key: 'moderatePain', label: 'Moderate Pain', icon: Activity },
      { key: 'severePain', label: 'Severe Pain', icon: AlertCircle },
    ],
    "Pregnancy": [
      { key: 'pregnancyAbdominalTrauma', label: 'Pregnancy Abdominal Trauma', icon: User },
      { key: 'pregnancyAbdominalPain', label: 'Pregnancy Abdominal Pain', icon: User },
      { key: 'pregnancyTrauma', label: 'Pregnancy Trauma', icon: User },
      { key: 'pregnancyPvBleed', label: 'Pregnancy PV Bleed', icon: Droplet },
      { key: 'ketonuria', label: 'Ketonuria', icon: Activity },
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Heart className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold">Nurse Triage</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationButton />
              
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md"
              >
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Emergency</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowLogout(!showLogout)}
                  className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-all"
                >
                  <User className="w-5 h-5" />
                </button>
                
                {showLogout && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                    <button
                      onClick={() => { setShowLogout(false); onNavigate?.('queue'); }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-teal-50 hover:text-teal-600"
                    >
                      Queue
                    </button>
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-teal-50 hover:text-teal-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
              <AlertCircle className="w-6 h-6 mr-2" />
              Emergency Override
            </h2>
            <p className="text-gray-600 mb-4">Select the reason for emergency triage:</p>
            
            <form onSubmit={(e) => { e.preventDefault(); handleEmergencySubmit(); }}>
              <div className="space-y-3 mb-4">
                {[
                  'Not Breathing',
                  'Seizure-current',
                  'Hypoglycaemia-glucose less than 3',
                  'Cardiac arrest',
                  'Obstructive air way-Not breathing',
                  'Others'
                ].map(option => (
                  <label key={option} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="emergencyReason"
                      value={option}
                      checked={emergencyReason === option}
                      onChange={() => { setEmergencyReason(option); }}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              
              {emergencyReason === 'Others' && (
                <textarea
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  placeholder="Please specify reason..."
                  rows={3}
                  className="w-full p-3 border rounded-lg mb-4"
                />
              )}
              
              {emergencyError && (
                <p className="text-red-600 mb-4">{emergencyError}</p>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700"
                >
                  Send to Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">Step {step} of 5</span>
              <span className="text-sm font-semibold text-teal-600">{Math.round((step/5)*100)}% Complete</span>
            </div>
            <div className="flex space-x-2">
              {[1,2,3,4,5].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    s <= step ? 'bg-gradient-to-r from-teal-500 to-teal-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Error/Success Messages */}
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700">{submitError}</p>
            </div>
          )}
          
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-700">{submitSuccess}</p>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Step Headers */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                {step === 1 && <><User className="w-6 h-6 mr-2" /> Patient Registration</>}
                {step === 2 && <><Heart className="w-6 h-6 mr-2" /> Vital Signs</>}
                {step === 3 && <><AlertCircle className="w-6 h-6 mr-2" /> Symptoms Assessment</>}
                {step === 4 && <><FileText className="w-6 h-6 mr-2" /> Chief Complaint & History</>}
                {step === 5 && <><CheckCircle className="w-6 h-6 mr-2" /> Review & Submit</>}
              </h2>
            </div>

            {/* Form Content */}
            <div className="p-6 md:p-8">
              {/* Step 1: Patient Registration */}
              {step === 1 && (
                <div className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <UserCircle className="w-5 h-5 mr-2 text-teal-600" />
                      Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="John"
                          />
                        </div>
                        {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Doe"
                          />
                        </div>
                        {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="+254 712 345 678"
                          />
                        </div>
                        {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          National ID
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="nationalId"
                            value={formData.nationalId}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="12345678"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NHIF Number
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="nhifNumber"
                            value={formData.nhifNumber}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="NHIF-123456"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-teal-600" />
                      Address Information
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Street address, building, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          County
                        </label>
                        <input
                          type="text"
                          name="county"
                          value={formData.county}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="County"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sub County
                        </label>
                        <input
                          type="text"
                          name="subCounty"
                          value={formData.subCounty}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Sub County"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Blood Group
                        </label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-teal-600" />
                      Emergency Contact
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emergency Contact Phone
                        </label>
                        <input
                          type="tel"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="+254 712 345 678"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emergency Contact Name
                        </label>
                        <input
                          type="text"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Contact person name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Allergies */}
                  <div className="bg-teal-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-teal-600" />
                      Allergies
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.allergies && formData.allergies.split(',').filter(a => a.trim()).map((allergy, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white text-red-600 rounded-full text-sm font-medium flex items-center shadow-sm">
                          {allergy}
                          <button
                            onClick={() => {
                              const newAllergies = formData.allergies.split(',').filter((_, i) => i !== idx).join(',');
                              setFormData(prev => ({ ...prev, allergies: newAllergies }));
                            }}
                            className="ml-2 text-red-400 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.allergyInput || ''}
                        onChange={e => setFormData(prev => ({ ...prev, allergyInput: e.target.value }))}
                        placeholder="Enter allergy"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.allergyInput?.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              allergies: prev.allergies ? `${prev.allergies},${prev.allergyInput.trim()}` : prev.allergyInput.trim(),
                              allergyInput: ''
                            }));
                          }
                        }}
                        className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors flex items-center"
                      >
                        <Plus className="w-5 h-5 mr-1" />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Chronic Conditions */}
                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-purple-600" />
                      Chronic Conditions
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.chronicConditions.map((condition, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white text-purple-600 rounded-full text-sm font-medium flex items-center shadow-sm">
                          {condition}
                          <button
                            onClick={() => {
                              const newConditions = formData.chronicConditions.filter((_, i) => i !== idx);
                              setFormData(prev => ({ ...prev, chronicConditions: newConditions }));
                            }}
                            className="ml-2 text-purple-400 hover:text-purple-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.conditionInput || ''}
                        onChange={e => setFormData(prev => ({ ...prev, conditionInput: e.target.value }))}
                        placeholder="Enter chronic condition"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.conditionInput?.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              chronicConditions: [...prev.chronicConditions, prev.conditionInput.trim()],
                              conditionInput: ''
                            }));
                          }
                        }}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center"
                      >
                        <Plus className="w-5 h-5 mr-1" />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Register Button */}
                  <div className="flex flex-col items-end pt-6 border-t border-gray-200">
                    {registerError && (
                      <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg w-full">
                        <p className="text-red-700">{registerError}</p>
                      </div>
                    )}
                    {registerSuccess && (
                      <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-lg w-full">
                        <p className="text-green-700">{registerSuccess}</p>
                      </div>
                    )}
                    <button
                      onClick={handleRegisterPatient}
                      disabled={registering}
                      className="px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold text-lg hover:from-teal-700 hover:to-teal-800 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {registering ? (
                        <span className="flex items-center">
                          <LoadingSpinner size="small" />
                          <span className="ml-2">Registering...</span>
                        </span>
                      ) : (
                        'Register Patient'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Vital Signs */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { icon: Thermometer, label: 'Temperature (°C)', name: 'temperature', color: 'text-red-600', step: 0.1 },
                      { icon: Heart, label: 'Heart Rate (bpm)', name: 'heartRate', color: 'text-pink-600' },
                      { icon: Zap, label: 'Systolic BP (mmHg)', name: 'bloodPressureSystolic', color: 'text-blue-600' },
                      { icon: Zap, label: 'Diastolic BP (mmHg)', name: 'bloodPressureDiastolic', color: 'text-blue-600' },
                      { icon: Wind, label: 'Respiratory Rate', name: 'respiratoryRate', color: 'text-teal-600' },
                      { icon: DropletIcon, label: 'SpO₂ (%)', name: 'spo2', color: 'text-cyan-600' },
                      { icon: Scale, label: 'Weight (kg)', name: 'weight', color: 'text-purple-600' },
                      { icon: Ruler, label: 'Height (cm)', name: 'height', color: 'text-green-600' },
                      { icon: Activity, label: 'Blood Glucose', name: 'bloodGlucose', color: 'text-orange-600', step: 0.1, required: false },
                      { icon: Gauge, label: 'Pain Scale (0-10)', name: 'painScale', color: 'text-red-400', required: false },
                    ].map((field) => {
                      const Icon = field.icon;
                      return (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <span className="flex items-center">
                              <Icon className={`w-4 h-4 mr-2 ${field.color}`} />
                              {field.label}
                              {field.required !== false && <span className="text-red-500 ml-1">*</span>}
                            </span>
                          </label>
                          <input
                            type="number"
                            step={field.step || 1}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                              errors[field.name] ? 'border-red-300 bg-red-50' : 'border-gray-200'
                            }`}
                          />
                          {errors[field.name] && (
                            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                          )}
                        </div>
                      );
                    })}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AVPU <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="avpu"
                        value={formData.avpu}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Select AVPU</option>
                        <option value="ALERT">Alert</option>
                        <option value="VERBAL">Responds to Voice</option>
                        <option value="PAIN">Responds to Pain</option>
                        <option value="UNRESPONSIVE">Unresponsive</option>
                      </select>
                      {errors.avpu && <p className="mt-1 text-sm text-red-600">{errors.avpu}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobility <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="mobility"
                        value={formData.mobility}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Select Mobility</option>
                        <option value="WALKING">Walking</option>
                        <option value="WHEELCHAIR">Wheelchair</option>
                        <option value="STRETCHER">Stretcher</option>
                      </select>
                      {errors.mobility && <p className="mt-1 text-sm text-red-600">{errors.mobility}</p>}
                    </div>
                  </div>

                  {/* SATS Display */}
                  <div className={`bg-gradient-to-r ${triageLevel.color} text-white p-6 rounded-xl shadow-lg mt-6`}>
                    <h3 className="text-xl font-bold mb-2">SATS Triage: {triageLevel.level} - {triageLevel.status}</h3>
                    <p className="opacity-90">Based on vital signs assessment</p>
                  </div>

                  {/* SATS Discriminator */}
                  <div className="mt-6 p-6 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SATS Clinical Discriminator
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent mb-3"
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Describe other clinical discriminator..."
                        value={discriminatorNotes}
                        onChange={e => setDiscriminatorNotes(e.target.value)}
                        rows={3}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Symptoms Assessment */}
              {step === 3 && (
                <div className="space-y-8">
                  {Object.entries(symptomCategories).map(([category, symptoms]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        {category === 'Critical' && <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />}
                        {category === 'Neurological' && <Brain className="w-5 h-5 mr-2 text-purple-600" />}
                        {category === 'Respiratory' && <Wind className="w-5 h-5 mr-2 text-blue-600" />}
                        {category === 'Cardiac' && <Heart className="w-5 h-5 mr-2 text-red-600" />}
                        {category === 'Trauma' && <Activity className="w-5 h-5 mr-2 text-orange-600" />}
                        {category === 'Burns' && <Zap className="w-5 h-5 mr-2 text-yellow-600" />}
                        {category === 'Pregnancy' && <User className="w-5 h-5 mr-2 text-pink-600" />}
                        {category}
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {symptoms.map((symptom) => {
                          const SymptomIcon = symptom.icon;
                          return (
                            <label
                              key={symptom.key}
                              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                formData.symptoms[symptom.key]
                                  ? 'border-teal-500 bg-teal-50'
                                  : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                name={`symptom.${symptom.key}`}
                                checked={formData.symptoms[symptom.key]}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                              />
                              <SymptomIcon className={`w-5 h-5 ml-3 mr-2 ${
                                formData.symptoms[symptom.key] ? 'text-teal-600' : 'text-gray-400'
                              }`} />
                              <span className={`text-sm ${
                                formData.symptoms[symptom.key] ? 'text-teal-900 font-medium' : 'text-gray-700'
                              }`}>
                                {symptom.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {errors.symptoms && (
                    <p className="text-red-600 text-sm mt-2">{errors.symptoms}</p>
                  )}
                </div>
              )}

              {/* Step 4: Chief Complaint & History */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chief Complaint <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="chiefComplaint"
                      value={formData.chiefComplaint}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.chiefComplaint ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="Describe the main reason for visit..."
                    />
                    {errors.chiefComplaint && (
                      <p className="mt-1 text-sm text-red-600">{errors.chiefComplaint}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration of Symptoms
                      </label>
                      <input
                        type="text"
                        name="symptomDuration"
                        value={formData.symptomDuration}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="e.g., 3 days"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Severity
                      </label>
                      <select
                        name="severity"
                        value={formData.severity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Select severity</option>
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Medications
                    </label>
                    <textarea
                      name="medications"
                      value={formData.medications}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="List current medications with dosages"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Surgical History
                    </label>
                    <textarea
                      name="surgicalHistory"
                      value={formData.surgicalHistory}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="List any previous surgeries"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Family Medical History
                    </label>
                    <textarea
                      name="familyHistory"
                      value={formData.familyHistory}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Any significant family medical history"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {step === 5 && (
                <div className="space-y-6">
                  {/* SATS Summary */}
                  <div className={`bg-gradient-to-r ${triageLevel.color} text-white p-6 rounded-xl shadow-lg`}>
                    <h3 className="text-2xl font-bold mb-2">{triageLevel.level} - {triageLevel.status}</h3>
                    <p>SATS Triage Category</p>
                    {selectedDiscriminator && (
                      <div className="mt-3 pt-3 border-t border-white/30">
                        <span className="font-semibold">Discriminator:</span>{' '}
                        {satsDiscriminators.find(d => d.value === selectedDiscriminator)?.label || 'Other'}
                        {selectedDiscriminator === 'other' && discriminatorNotes && (
                          <span> - {discriminatorNotes}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Patient Summary Cards */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Patient Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-500">Name:</span> {formData.firstName} {formData.lastName}</p>
                        <p><span className="text-gray-500">DOB:</span> {formData.dob}</p>
                        <p><span className="text-gray-500">Gender:</span> {formData.gender}</p>
                        <p><span className="text-gray-500">Phone:</span> {formData.phoneNumber}</p>
                        <p><span className="text-gray-500">Blood Group:</span> {formData.bloodGroup || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        Vital Signs
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-500">Temp:</span> {formData.temperature}°C</p>
                        <p><span className="text-gray-500">HR:</span> {formData.heartRate} bpm</p>
                        <p><span className="text-gray-500">BP:</span> {formData.bloodPressureSystolic}/{formData.bloodPressureDiastolic} mmHg</p>
                        <p><span className="text-gray-500">RR:</span> {formData.respiratoryRate}</p>
                        <p><span className="text-gray-500">SpO₂:</span> {formData.spo2}%</p>
                        <p><span className="text-gray-500">AVPU:</span> {formData.avpu}</p>
                        <p><span className="text-gray-500">Mobility:</span> {formData.mobility}</p>
                      </div>
                    </div>
                  </div>

                  {/* Symptoms Summary */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Symptoms Present
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(formData.symptoms)
                        .filter(([, value]) => value)
                        .map(([key]) => {
                          const found = Object.values(symptomCategories)
                            .flat()
                            .find(s => s.key === key);
                          return found ? (
                            <span key={key} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                              {found.label}
                            </span>
                          ) : null;
                        })}
                    </div>
                  </div>

                  {/* Chief Complaint */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-700 mb-3">Chief Complaint</h4>
                    <p className="text-gray-800">{formData.chiefComplaint}</p>
                  </div>

                  {/* Triage Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      name="triageNotes"
                      value={formData.triageNotes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Additional notes for clinical staff..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${
                  step === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>

              <span className="text-sm text-gray-500 self-center">
                Step {step} of 5
              </span>

              {step < 5 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-teal-800 transition-all transform hover:scale-105"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Complete Registration
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {loading && <LoadingSpinner text="Processing..." fullScreen />}
    </div>
  );
}