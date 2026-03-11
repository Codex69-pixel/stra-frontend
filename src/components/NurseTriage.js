import React, { useState, useEffect, useCallback, useMemo } from 'react';
import NotificationButton from './common/NotificationButton';
import { logout } from '../utils/logout';
import {
  User, Heart, Activity, Save, FileText, AlertCircle,
  CheckCircle, ArrowRight, ArrowLeft, Plus, X,
  Thermometer, Zap, Droplet, Wind, Gauge, Ruler
} from 'lucide-react';
import LoadingSpinner from './common/LoadingSpinner';
import apiService from '../services/api';

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
  
  // SATS discriminators based on Adult SATS Chart
  const satsDiscriminators = useMemo(() => [
    // RED (Emergency) Discriminators
    { value: 'airway_threatened', label: 'Threatened airway', level: 'RED' },
    { value: 'breathing_severe', label: 'Severe respiratory distress', level: 'RED' },
    { value: 'shock', label: 'Shock (SBP < 90 mmHg)', level: 'RED' },
    { value: 'unresponsive', label: 'Unresponsive (GCS < 9)', level: 'RED' },
    { value: 'active_seizure', label: 'Active seizure', level: 'RED' },
    { value: 'hypoglycaemia_severe', label: 'Hypoglycaemia (glucose < 3 mmol/L)', level: 'RED' },
    { value: 'major_trauma', label: 'Major trauma', level: 'RED' },
    { value: 'severe_bleeding', label: 'Severe bleeding', level: 'RED' },
    
    // ORANGE (Very Urgent) Discriminators
    { value: 'airway_partial', label: 'Partial airway obstruction', level: 'ORANGE' },
    { value: 'breathing_moderate', label: 'Moderate respiratory distress', level: 'ORANGE' },
    { value: 'shock_compensated', label: 'Compensated shock', level: 'ORANGE' },
    { value: 'altered_loc', label: 'Altered level of consciousness', level: 'ORANGE' },
    { value: 'post_ictal', label: 'Post-ictal', level: 'ORANGE' },
    { value: 'hypoglycaemia_moderate', label: 'Hypoglycaemia (glucose 3-4 mmol/L)', level: 'ORANGE' },
    { value: 'severe_pain', label: 'Severe pain', level: 'ORANGE' },
    { value: 'hot_limb', label: 'Hot limb', level: 'ORANGE' },
    
    // YELLOW (Urgent) Discriminators
    { value: 'mild_respiratory', label: 'Mild respiratory distress', level: 'YELLOW' },
    { value: 'moderate_pain', label: 'Moderate pain', level: 'YELLOW' },
    { value: 'fever', label: 'Fever with rigors', level: 'YELLOW' },
    { value: 'dizziness', label: 'Dizziness', level: 'YELLOW' },
    { value: 'vaginal_bleeding', label: 'Vaginal bleeding (pregnant)', level: 'YELLOW' },
    
    // GREEN (Non-urgent) Discriminators
    { value: 'minor_symptoms', label: 'Minor symptoms only', level: 'GREEN' },
    { value: 'mild_pain', label: 'Mild pain', level: 'GREEN' },
    { value: 'repeat_script', label: 'Repeat prescription', level: 'GREEN' },
    { value: 'review_only', label: 'Review only', level: 'GREEN' }
  ], []);

  const [selectedDiscriminator, setSelectedDiscriminator] = useState('');
  const [discriminatorNotes, setDiscriminatorNotes] = useState('');
  
  // Predefined lists for chips/badges
  const symptomsList = [
    'Fever', 'Cough', 'Shortness of Breath', 'Chest Pain', 'Abdominal Pain',
    'Headache', 'Dizziness', 'Nausea/Vomiting', 'Fatigue', 'Body Aches',
    'Rash', 'Joint Pain', 'Sore Throat', 'Runny Nose', 'Back Pain',
    'Diarrhea', 'Constipation', 'Difficulty Swallowing', 'Palpitations', 'Swelling'
  ];
  
  const chronicConditionsList = [
    'Hypertension', 'Diabetes Type 1', 'Diabetes Type 2', 'Asthma', 
    'Heart Disease', 'Cancer', 'Thyroid Disease', 'Arthritis', 
    'Kidney Disease', 'COPD', 'Epilepsy', 'HIV/AIDS', 'Sickle Cell',
    'Stroke', 'Dementia', 'Parkinson\'s', 'Hepatitis', 'Tuberculosis'
  ];
  
  const allergyList = [
    'Penicillin', 'Cephalosporins', 'Sulfa', 'Aspirin', 'Ibuprofen',
    'Peanuts', 'Tree Nuts', 'Shellfish', 'Eggs', 'Milk', 'Wheat', 'Soy',
    'Latex', 'Bee Stings', 'Iodine', 'Contrast Dye', 'Codeine', 'Morphine'
  ];
  
  const countyList = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Uasin Gishu', 
    'Machakos', 'Meru', 'Kilifi', 'Kakamega', 'Bungoma', 'Turkana',
    'Kajiado', 'Garissa', 'Kisii', 'Nyandarua', 'Nyeri', 'Kirinyaga'
  ];
  
  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    name: '',
    dob: '',
    gender: '',
    phoneNumber: '',
    emergencyContact: '',
    emergencyContactName: '',
    nationalId: '',
    nhifNumber: '',
    address: '',
    county: '',
    countyInput: '',
    subCounty: '',
    subCountyInput: '',
    bloodGroup: '',
    allergies: [],
    allergyInput: '',
    chronicConditions: [],
    conditionInput: '',
    otherAllergy: '',
    otherCondition: '',
    otherCounty: '',
    otherSubCounty: '',
    vitals: {
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
      gcs: ''
    },
    symptoms: {},
    symptomDuration: '',
    severity: '',
    medications: '',
    surgicalHistory: '',
    familyHistory: '',
    chiefComplaint: '',
    triageNotes: ''
  });

  // SATS triage calculation based on Adult SATS Chart
  const [triageLevel, setTriageLevel] = useState({ 
    level: 'GREEN', 
    status: 'Non-urgent', 
    color: 'from-green-500 to-green-600',
    description: 'Stable for routine care',
    targetTime: 'Within 4 hours'
  });

  // Function to calculate GCS from AVPU if not provided
  const getGCSFromAVPU = (avpu) => {
    switch(avpu) {
      case 'ALERT': return 15;
      case 'VERBAL': return 12;
      case 'PAIN': return 8;
      case 'UNRESPONSIVE': return 3;
      default: return null;
    }
  };

  // SATS chart logic based on Adult SATS criteria
  const calculateSATS = useCallback((vitals, discriminator) => {
    // First check discriminators - these override vital signs
    const selectedDisc = satsDiscriminators.find(d => d.value === discriminator);
    if (selectedDisc) {
      switch(selectedDisc.level) {
        case 'RED':
          return { 
            level: 'RED', 
            status: 'Emergency', 
            color: 'from-red-500 to-red-700',
            description: 'Immediate life-saving intervention required',
            targetTime: 'Immediate'
          };
        case 'ORANGE':
          return { 
            level: 'ORANGE', 
            status: 'Very Urgent', 
            color: 'from-orange-500 to-orange-600',
            description: 'Potentially life-threatening - treat within 10 minutes',
            targetTime: 'Within 10 minutes'
          };
        case 'YELLOW':
          return { 
            level: 'YELLOW', 
            status: 'Urgent', 
            color: 'from-yellow-400 to-yellow-600',
            description: 'Serious condition - treat within 60 minutes',
            targetTime: 'Within 60 minutes'
          };
        case 'GREEN':
          return { 
            level: 'GREEN', 
            status: 'Non-urgent', 
            color: 'from-green-500 to-green-600',
            description: 'Stable for routine care',
            targetTime: 'Within 4 hours'
          };
        default:
          break;
      }
    }
    
    // If no discriminator, use vital signs
    if (!vitals) return { 
      level: 'GREEN', 
      status: 'Non-urgent', 
      color: 'from-green-500 to-green-600',
      description: 'Stable for routine care',
      targetTime: 'Within 4 hours'
    };
    
    const temp = Number(vitals.temperature);
    const sbp = Number(vitals.systolicBp);
    const hr = Number(vitals.heartRate);
    const rr = Number(vitals.respiratoryRate);
    const spo2 = Number(vitals.oxygenSaturation);
    const glucose = Number(vitals.bloodGlucose);
    const avpu = vitals.avpu;
    const gcs = vitals.gcs || getGCSFromAVPU(avpu);
    const pain = Number(vitals.painScale);
    
    // RED - Emergency (Any one criteria)
    if (
      // Airway/Breathing
      rr > 30 || rr < 8 ||
      spo2 < 90 ||
      
      // Circulation
      sbp < 90 ||
      hr > 130 || hr < 40 ||
      
      // Neurology
      gcs < 9 || avpu === 'UNRESPONSIVE' ||
      
      // Metabolic
      glucose < 3 ||
      
      // Temperature
      temp > 41 || temp < 32
    ) {
      return { 
        level: 'RED', 
        status: 'Emergency', 
        color: 'from-red-500 to-red-700',
        description: 'Immediate life-saving intervention required',
        targetTime: 'Immediate'
      };
    }
    
    // ORANGE - Very Urgent
    if (
      // Airway/Breathing
      (rr > 24 && rr <= 30) ||
      (spo2 >= 90 && spo2 < 94) ||
      
      // Circulation
      (sbp >= 90 && sbp < 100) ||
      (hr > 110 && hr <= 130) ||
      
      // Neurology
      (gcs >= 9 && gcs < 13) || avpu === 'PAIN' ||
      
      // Metabolic
      (glucose >= 3 && glucose < 4) ||
      
      // Temperature
      (temp >= 39 && temp <= 41) ||
      
      // Pain
      pain >= 8
    ) {
      return { 
        level: 'ORANGE', 
        status: 'Very Urgent', 
        color: 'from-orange-500 to-orange-600',
        description: 'Potentially life-threatening - treat within 10 minutes',
        targetTime: 'Within 10 minutes'
      };
    }
    
    // YELLOW - Urgent
    if (
      // Airway/Breathing
      (rr > 20 && rr <= 24) ||
      (spo2 >= 94 && spo2 < 96) ||
      
      // Circulation
      (sbp >= 100 && sbp < 110) ||
      (hr > 90 && hr <= 110) ||
      
      // Neurology
      (gcs >= 13 && gcs < 15) || avpu === 'VERBAL' ||
      
      // Temperature
      (temp >= 38 && temp < 39) ||
      
      // Pain
      (pain >= 4 && pain < 8)
    ) {
      return { 
        level: 'YELLOW', 
        status: 'Urgent', 
        color: 'from-yellow-400 to-yellow-600',
        description: 'Serious condition - treat within 60 minutes',
        targetTime: 'Within 60 minutes'
      };
    }
    
    // GREEN - Non-urgent
    return { 
      level: 'GREEN', 
      status: 'Non-urgent', 
      color: 'from-green-500 to-green-600',
      description: 'Stable for routine care',
      targetTime: 'Within 4 hours'
    };
  }, [satsDiscriminators]);

  // Update triage level when vitals or discriminator changes
  useEffect(() => {
    setTriageLevel(calculateSATS(formData.vitals, selectedDiscriminator));
  }, [formData.vitals, selectedDiscriminator, calculateSATS]);

  // Symptom toggle handler
  const handleSymptomToggle = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        [symptom]: !prev.symptoms[symptom]
      }
    }));
  };

  // Add custom allergy
  const addCustomAllergy = () => {
    if (formData.allergyInput && !formData.allergies.includes(formData.allergyInput)) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, prev.allergyInput],
        allergyInput: ''
      }));
    }
  };

  // Add custom condition
  const addCustomCondition = () => {
    if (formData.conditionInput && !formData.chronicConditions.includes(formData.conditionInput)) {
      setFormData(prev => ({
        ...prev,
        chronicConditions: [...prev.chronicConditions, prev.conditionInput],
        conditionInput: ''
      }));
    }
  };

  // Add custom county
  const addCustomCounty = () => {
    if (formData.countyInput) {
      setFormData(prev => ({
        ...prev,
        county: formData.countyInput,
        countyInput: ''
      }));
    }
  };

  // Add custom subcounty
  const addCustomSubCounty = () => {
    if (formData.subCountyInput) {
      setFormData(prev => ({
        ...prev,
        subCounty: formData.subCountyInput,
        subCountyInput: ''
      }));
    }
  };

  // Remove item from array
  const removeItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
    }));
  };



  // Input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Vitals fields
    const vitalFields = [
      'temperature', 'systolicBp', 'diastolicBp', 'heartRate', 'respiratoryRate', 
      'oxygenSaturation', 'bloodGlucose', 'painScale', 'weight', 'height', 
      'avpu', 'mobility', 'gcs'
    ];
    
    if (vitalFields.includes(name)) {
      setFormData(prev => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          [name]: value
        }
      }));
    } else if (name === 'allergyInput') {
      setFormData(prev => ({ ...prev, allergyInput: value }));
    } else if (name === 'conditionInput') {
      setFormData(prev => ({ ...prev, conditionInput: value }));
    } else if (name === 'countyInput') {
      setFormData(prev => ({ ...prev, countyInput: value }));
    } else if (name === 'subCountyInput') {
      setFormData(prev => ({ ...prev, subCountyInput: value }));
    } else if (name === 'firstName' || name === 'lastName') {
      setFormData(prev => {
        const newData = { ...prev, [name]: value };
        newData.name = `${newData.firstName} ${newData.lastName}`.trim();
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle next step - no validation required
  const handleNext = () => {
    setStep(step + 1);
  };

  // Register patient
  const handleRegisterPatient = async () => {
    setRegistering(true);
    setRegisterError(null);
    setRegisterSuccess(null);

    // Only validate names
    if (!formData.firstName || !formData.lastName) {
      setErrors({
        firstName: !formData.firstName ? 'First name is required.' : '',
        lastName: !formData.lastName ? 'Last name is required.' : ''
      });
      setRegisterError('Please enter patient name.');
      setRegistering(false);
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
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
      
      await apiService.registerPatient(payload);
      setRegisterSuccess('Patient registered successfully!');
      setRegistering(false);
      setTimeout(() => {
        setStep(2);
        setRegisterSuccess(null);
        setErrors({});
      }, 1000);
    } catch (err) {
      setRegisterError(err.message || 'Failed to register patient');
      setRegistering(false);
    }
  };

  // Validation for final submit - only names and condition
  function validateForSubmit() {
    const errors = {};
    if (!formData.firstName) errors.firstName = 'First name is required.';
    if (!formData.lastName) errors.lastName = 'Last name is required.';
    if (!formData.chiefComplaint) errors.chiefComplaint = 'Chief complaint is required.';
    return { valid: Object.keys(errors).length === 0, errors };
  }

  // Complete triage
  const handleSubmit = async (e, isEmergency = false) => {
    if (e) e.preventDefault();
    
    // Validate only names and chief complaint
    const validation = validateForSubmit();
    if (!validation.valid) {
      setErrors(validation.errors);
      setSubmitError('Please enter patient name and chief complaint.');
      return;
    }
    
    setLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      // Prepare final submission with triage data

      
      // Simulate API call
      await new Promise(res => setTimeout(res, 1200));
      
      setLoading(false);
      setSubmitSuccess('Patient registered and triage submitted successfully!');
      
      // Reset form after success
      setTimeout(() => {
        setStep(1);
        setSubmitSuccess(null);
        setFormData({
          firstName: '', lastName: '', dob: '', gender: '', phoneNumber: '', 
          emergencyContact: '', emergencyContactName: '', nationalId: '', 
          nhifNumber: '', address: '', county: '', countyInput: '', 
          subCounty: '', subCountyInput: '', bloodGroup: '', 
          allergies: [], allergyInput: '', chronicConditions: [], 
          conditionInput: '', otherAllergy: '', otherCondition: '', 
          otherCounty: '', otherSubCounty: '',
          vitals: { 
            temperature: '', systolicBp: '', diastolicBp: '', heartRate: '', 
            respiratoryRate: '', oxygenSaturation: '', bloodGlucose: '', 
            painScale: '', weight: '', height: '', avpu: '', mobility: '', gcs: ''
          }, 
          symptoms: {}, symptomDuration: '', severity: '', medications: '', 
          surgicalHistory: '', familyHistory: '', chiefComplaint: '', triageNotes: '', 
          name: ''
        });
        setSelectedDiscriminator('');
        setDiscriminatorNotes('');
        setErrors({});
      }, 2500);
    } catch (err) {
      setLoading(false);
      setSubmitError('Registration failed. Please try again.');
      setTimeout(() => setSubmitError(null), 3000);
    }
  };

  // Emergency submit handler
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

  return (
    <>
      {submitError && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, margin: 12, textAlign: 'center' }}>{submitError}</div>
      )}
      {submitSuccess && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: 12, borderRadius: 8, margin: 12, textAlign: 'center' }}>{submitSuccess}</div>
      )}
      {loading && <LoadingSpinner text="Processing registration..." fullScreen />}
      
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
            <p style={{marginBottom: 16, color: '#444'}}>Select the reason for emergency:</p>
            
            <form onSubmit={e => { e.preventDefault(); handleEmergencySubmit(); }}>
              <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                {[
                  'Not Breathing',
                  'Seizure-current',
                  'Hypoglycaemia (glucose less than 3)',
                  'Cardiac arrest',
                  'Obstructed airway',
                  'Severe bleeding',
                  'Unconscious',
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
          {/* SATS Triage Banner - Always Visible with Target Time */}
          <div className={`mb-6 bg-gradient-to-r ${triageLevel.color} text-white rounded-2xl p-4 shadow-lg`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold">{triageLevel.level}</span>
                  <span className="text-xl">{triageLevel.status}</span>
                </div>
                <p className="text-sm text-white/90 mt-1">{triageLevel.description}</p>
              </div>
              <div className="text-right bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-sm opacity-90 block">Target Time</span>
                <span className="text-lg font-bold">{triageLevel.targetTime}</span>
              </div>
            </div>
          </div>

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
                    onClick={() => setStep(s)}
                    className={`w-full h-2 rounded-full transition-all duration-300 ${
                      s <= step ? 'bg-gradient-to-r from-teal-600 to-teal-700' : 'bg-gray-200'
                    }`}
                    aria-label={`Go to step ${s}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Registration</span>
              <span>Vitals</span>
              <span>Complaint</span>
              <span>History</span>
              <span>Review</span>
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
                    <label className="input-label">First Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                    {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Last Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                    {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Gender</label>
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
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+254 712 345 678"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Emergency Contact</label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      placeholder="Emergency Contact Number"
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
                    <label className="input-label">County</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.county && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center">
                          {formData.county}
                          <button 
                            type="button" 
                            className="ml-2 text-blue-700 hover:text-blue-900"
                            onClick={() => setFormData(prev => ({ ...prev, county: '' }))}
                          >
                            <X size={14} />
                          </button>
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={countyList.includes(formData.county) ? formData.county : ''}
                        onChange={e => setFormData(prev => ({ ...prev, county: e.target.value, countyInput: '' }))}
                        className="input-field flex-1"
                      >
                        <option value="">Select County</option>
                        {countyList.map((county, idx) => (
                          <option key={idx} value={county}>{county}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="countyInput"
                        value={formData.countyInput}
                        onChange={handleInputChange}
                        placeholder="Or type county"
                        className="input-field flex-1"
                      />
                      <button 
                        type="button" 
                        className="btn btn-primary px-3"
                        onClick={addCustomCounty}
                        disabled={!formData.countyInput}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Sub County</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.subCounty && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center">
                          {formData.subCounty}
                          <button 
                            type="button" 
                            className="ml-2 text-green-700 hover:text-green-900"
                            onClick={() => setFormData(prev => ({ ...prev, subCounty: '' }))}
                          >
                            <X size={14} />
                          </button>
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="subCountyInput"
                        value={formData.subCountyInput}
                        onChange={handleInputChange}
                        placeholder="Enter sub county"
                        className="input-field flex-1"
                      />
                      <button 
                        type="button" 
                        className="btn btn-primary px-3"
                        onClick={addCustomSubCounty}
                        disabled={!formData.subCountyInput}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Blood Group</label>
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
                  </div>
                </div>
                
                {/* Allergies Section with Chips */}
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Allergies</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {allergyList.map((allergy) => (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => {
                          if (formData.allergies.includes(allergy)) {
                            removeItem('allergies', allergy);
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              allergies: [...prev.allergies, allergy]
                            }));
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          formData.allergies.includes(allergy)
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-red-300'
                        }`}
                      >
                        {allergy}
                      </button>
                    ))}
                  </div>
                  
                  {/* Selected allergies */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.allergies.filter(a => !allergyList.includes(a)).map((allergy, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center">
                        {allergy}
                        <button 
                          type="button" 
                          className="ml-2 text-purple-700 hover:text-purple-900"
                          onClick={() => removeItem('allergies', allergy)}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  {/* Add custom allergy */}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      name="allergyInput"
                      value={formData.allergyInput}
                      onChange={handleInputChange}
                      placeholder="Type custom allergy"
                      className="input-field flex-1"
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary px-3"
                      onClick={addCustomAllergy}
                      disabled={!formData.allergyInput}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                
                {/* Chronic Conditions Section with Chips */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Chronic Conditions</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {chronicConditionsList.map((condition) => (
                      <button
                        key={condition}
                        type="button"
                        onClick={() => {
                          if (formData.chronicConditions.includes(condition)) {
                            removeItem('chronicConditions', condition);
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              chronicConditions: [...prev.chronicConditions, condition]
                            }));
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          formData.chronicConditions.includes(condition)
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom conditions */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.chronicConditions.filter(c => !chronicConditionsList.includes(c)).map((condition, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center">
                        {condition}
                        <button 
                          type="button" 
                          className="ml-2 text-indigo-700 hover:text-indigo-900"
                          onClick={() => removeItem('chronicConditions', condition)}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  {/* Add custom condition */}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      name="conditionInput"
                      value={formData.conditionInput}
                      onChange={handleInputChange}
                      placeholder="Type custom condition"
                      className="input-field flex-1"
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary px-3"
                      onClick={addCustomCondition}
                      disabled={!formData.conditionInput}
                    >
                      <Plus size={18} />
                    </button>
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

            {/* Step 2: Vitals */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                  <Heart className="w-6 h-6 mr-2 text-red-600" />
                  Vital Signs
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="input-group">
                    <label className="input-label flex items-center">
                      <Thermometer className="w-4 h-4 mr-2 text-red-600" />
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="temperature"
                      value={formData.vitals.temperature}
                      onChange={handleInputChange}
                      placeholder="35.0 - 42.0"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label flex items-center">
                      <Activity className="w-4 h-4 mr-2 text-pink-600" />
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      name="heartRate"
                      value={formData.vitals.heartRate}
                      onChange={handleInputChange}
                      placeholder="40 - 200"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-blue-600" />
                      Systolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      name="systolicBp"
                      value={formData.vitals.systolicBp}
                      onChange={handleInputChange}
                      placeholder="70 - 250"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-blue-600" />
                      Diastolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      name="diastolicBp"
                      value={formData.vitals.diastolicBp}
                      onChange={handleInputChange}
                      placeholder="40 - 150"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label flex items-center">
                      <Wind className="w-4 h-4 mr-2 text-teal-600" />
                      Respiratory Rate
                    </label>
                    <input
                      type="number"
                      name="respiratoryRate"
                      value={formData.vitals.respiratoryRate}
                      onChange={handleInputChange}
                      placeholder="8 - 40"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label flex items-center">
                      <Droplet className="w-4 h-4 mr-2 text-cyan-600" />
                      SpO₂ (%)
                    </label>
                    <input
                      type="number"
                      name="oxygenSaturation"
                      value={formData.vitals.oxygenSaturation}
                      onChange={handleInputChange}
                      placeholder="70 - 100"
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
                      value={formData.vitals.weight}
                      onChange={handleInputChange}
                      placeholder="Weight in kg"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label flex items-center">
                      <Ruler className="w-4 h-4 mr-2 text-green-600" />
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={formData.vitals.height}
                      onChange={handleInputChange}
                      placeholder="Height in cm"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">AVPU</label>
                    <select
                      name="avpu"
                      value={formData.vitals.avpu}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Select AVPU</option>
                      <option value="ALERT">ALERT - Awake and alert</option>
                      <option value="VERBAL">VERBAL - Responds to voice</option>
                      <option value="PAIN">PAIN - Responds to pain</option>
                      <option value="UNRESPONSIVE">UNRESPONSIVE - No response</option>
                    </select>
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">GCS Score</label>
                    <input
                      type="number"
                      min="3"
                      max="15"
                      name="gcs"
                      value={formData.vitals.gcs}
                      onChange={handleInputChange}
                      placeholder="3 - 15"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Blood Glucose</label>
                    <input
                      type="number"
                      step="0.1"
                      name="bloodGlucose"
                      value={formData.vitals.bloodGlucose}
                      onChange={handleInputChange}
                      placeholder="mmol/L"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Pain Scale (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      name="painScale"
                      value={formData.vitals.painScale}
                      onChange={handleInputChange}
                      placeholder="0-10"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Mobility</label>
                    <select
                      name="mobility"
                      value={formData.vitals.mobility}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Select Mobility</option>
                      <option value="WALKING">Walking</option>
                      <option value="WHEELCHAIR">Wheelchair</option>
                      <option value="STRETCHER">Stretcher</option>
                      <option value="IMMOBILE">Immobile</option>
                    </select>
                  </div>
                </div>
                
                {/* SATS Clinical Discriminator Selection */}
                <div className="mt-6 border-t pt-6">
                  <label className="input-label font-semibold mb-2">SATS Clinical Discriminator (if present):</label>
                  <div className="grid md:grid-cols-2 gap-2 max-h-96 overflow-y-auto p-2 border rounded-lg">
                    {satsDiscriminators.map(d => (
                      <label key={d.value} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="radio"
                          name="discriminator"
                          value={d.value}
                          checked={selectedDiscriminator === d.value}
                          onChange={(e) => setSelectedDiscriminator(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          <span className={`font-bold mr-1 ${
                            d.level === 'RED' ? 'text-red-600' :
                            d.level === 'ORANGE' ? 'text-orange-600' :
                            d.level === 'YELLOW' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {d.level}:
                          </span>
                          {d.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {selectedDiscriminator === 'other' && (
                    <textarea
                      className="input-field mt-2"
                      placeholder="Describe other clinical discriminator..."
                      value={discriminatorNotes}
                      onChange={e => setDiscriminatorNotes(e.target.value)}
                      rows="2"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Chief Complaint & Symptoms */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                  <AlertCircle className="w-6 h-6 mr-2 text-orange-600" />
                  Chief Complaint & Symptoms
                </h2>

                <div className="input-group">
                  <label className="input-label">Chief Complaint <span className="text-red-500">*</span></label>
                  <textarea
                    name="chiefComplaint"
                    value={formData.chiefComplaint}
                    onChange={handleInputChange}
                    placeholder="Describe the main reason for visit..."
                    rows="4"
                    className={`input-field ${errors.chiefComplaint ? 'border-red-500' : ''}`}
                  />
                  {errors.chiefComplaint && <p className="text-red-600 text-sm mt-1">{errors.chiefComplaint}</p>}
                </div>

                <div>
                  <label className="input-label mb-3">Symptoms Present</label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {symptomsList.map((symptom) => (
                      <label key={symptom} className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          checked={!!formData.symptoms[symptom]}
                          onChange={() => handleSymptomToggle(symptom)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <span className="text-gray-700">{symptom}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="input-label">Duration of Symptoms</label>
                    <input
                      type="text"
                      name="symptomDuration"
                      value={formData.symptomDuration}
                      onChange={handleInputChange}
                      placeholder="e.g., 3 days, 2 weeks"
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

                {/* SATS Result Summary */}
                <div className={`bg-gradient-to-r ${triageLevel.color} text-white rounded-2xl p-6 shadow-lg mb-6`}>
                  <h3 className="text-2xl font-bold mb-2">SATS Triage Result</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-4xl font-bold mr-3">{triageLevel.level}</span>
                      <span className="text-2xl">{triageLevel.status}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm opacity-90">Target Time</span>
                      <p className="text-xl font-bold">{triageLevel.targetTime}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-white/90">{triageLevel.description}</p>
                  
                  {selectedDiscriminator && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <span className="font-semibold">Clinical Discriminator:</span>{' '}
                      {satsDiscriminators.find(d => d.value === selectedDiscriminator)?.label}
                      {selectedDiscriminator === 'other' && discriminatorNotes && (
                        <span> - {discriminatorNotes}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* SATS Reference Chart */}
                <div className="mt-8 mb-4">
                  <h3 className="font-bold text-gray-900 mb-2">SATS Adult Triage Reference</h3>
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
                          <th className="px-2 py-1 border">GCS</th>
                          <th className="px-2 py-1 border">Glucose</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-red-100">
                          <td className="px-2 py-1 border font-bold text-red-700">RED</td>
                          <td className="px-2 py-1 border">&gt;30 or &lt;8</td>
                          <td className="px-2 py-1 border">&gt;130 or &lt;40</td>
                          <td className="px-2 py-1 border">&lt;90</td>
                          <td className="px-2 py-1 border">&lt;90</td>
                          <td className="px-2 py-1 border">&gt;41 or &lt;32</td>
                          <td className="px-2 py-1 border">&lt;9</td>
                          <td className="px-2 py-1 border">&lt;3</td>
                        </tr>
                        <tr className="bg-orange-100">
                          <td className="px-2 py-1 border font-bold text-orange-700">ORANGE</td>
                          <td className="px-2 py-1 border">25-30</td>
                          <td className="px-2 py-1 border">111-130</td>
                          <td className="px-2 py-1 border">90-99</td>
                          <td className="px-2 py-1 border">90-93</td>
                          <td className="px-2 py-1 border">39-41</td>
                          <td className="px-2 py-1 border">9-12</td>
                          <td className="px-2 py-1 border">3-3.9</td>
                        </tr>
                        <tr className="bg-yellow-100">
                          <td className="px-2 py-1 border font-bold text-yellow-700">YELLOW</td>
                          <td className="px-2 py-1 border">21-24</td>
                          <td className="px-2 py-1 border">91-110</td>
                          <td className="px-2 py-1 border">100-109</td>
                          <td className="px-2 py-1 border">94-95</td>
                          <td className="px-2 py-1 border">38-38.9</td>
                          <td className="px-2 py-1 border">13-14</td>
                          <td className="px-2 py-1 border">4-4.9</td>
                        </tr>
                        <tr className="bg-green-100">
                          <td className="px-2 py-1 border font-bold text-green-700">GREEN</td>
                          <td className="px-2 py-1 border">10-20</td>
                          <td className="px-2 py-1 border">51-90</td>
                          <td className="px-2 py-1 border">&gt;110</td>
                          <td className="px-2 py-1 border">&gt;95</td>
                          <td className="px-2 py-1 border">35-37.9</td>
                          <td className="px-2 py-1 border">15</td>
                          <td className="px-2 py-1 border">&gt;5</td>
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
                    {formData.phoneNumber && <p><span className="font-semibold text-gray-700">Phone:</span> {formData.phoneNumber}</p>}
                    {formData.dob && <p><span className="font-semibold text-gray-700">DOB:</span> {formData.dob}</p>}
                    {formData.gender && <p><span className="font-semibold text-gray-700">Gender:</span> {formData.gender}</p>}
                    {formData.bloodGroup && <p><span className="font-semibold text-gray-700">Blood Group:</span> {formData.bloodGroup}</p>}
                  </div>

                  {/* Vitals Summary */}
                  {(formData.vitals.temperature || formData.vitals.heartRate || formData.vitals.systolicBp) && (
                    <>
                      <h3 className="font-bold text-gray-900 mt-4">Vital Signs</h3>
                      <div className="grid md:grid-cols-3 gap-2 bg-blue-50 p-4 rounded-lg">
                        {formData.vitals.temperature && <p><span className="font-semibold">Temp:</span> {formData.vitals.temperature}°C</p>}
                        {formData.vitals.heartRate && <p><span className="font-semibold">HR:</span> {formData.vitals.heartRate} bpm</p>}
                        {formData.vitals.systolicBp && <p><span className="font-semibold">BP:</span> {formData.vitals.systolicBp}/{formData.vitals.diastolicBp} mmHg</p>}
                        {formData.vitals.respiratoryRate && <p><span className="font-semibold">RR:</span> {formData.vitals.respiratoryRate}</p>}
                        {formData.vitals.oxygenSaturation && <p><span className="font-semibold">SpO₂:</span> {formData.vitals.oxygenSaturation}%</p>}
                        {formData.vitals.bloodGlucose && <p><span className="font-semibold">Glucose:</span> {formData.vitals.bloodGlucose} mmol/L</p>}
                      </div>
                    </>
                  )}

                  <h3 className="font-bold text-gray-900">Chief Complaint</h3>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-gray-800">{formData.chiefComplaint || 'Not specified'}</p>
                  </div>

                  {/* Symptoms */}
                  {Object.values(formData.symptoms).some(v => v) && (
                    <>
                      <h3 className="font-bold text-gray-900">Symptoms</h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(formData.symptoms)
                          .filter(([_, isSelected]) => isSelected)
                          .map(([symptom]) => (
                            <span key={symptom} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                              {symptom}
                            </span>
                          ))}
                      </div>
                    </>
                  )}

                  {/* Allergies */}
                  {formData.allergies.length > 0 && (
                    <>
                      <h3 className="font-bold text-gray-900">Allergies</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.allergies.map((allergy, idx) => (
                          <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Chronic Conditions */}
                  {formData.chronicConditions.length > 0 && (
                    <>
                      <h3 className="font-bold text-gray-900">Chronic Conditions</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.chronicConditions.map((condition, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
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
                <span>Complete Triage</span>
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