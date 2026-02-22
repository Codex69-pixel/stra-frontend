import React, { useState } from 'react';
import axios from 'axios';

const initialPatientData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
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
  allergies: [''],
  chronicConditions: [''],
};

const initialTriageData = {
  patientId: '',
  nurseId: '',
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
  },
  symptoms: {},
  chiefComplaint: '',
};

const PatientRegistration = ({ baseUrl, nurseId, departmentId }) => {
  const [step, setStep] = useState(1);
  const [patientData, setPatientData] = useState(initialPatientData);
  const [triageData, setTriageData] = useState(initialTriageData);
  const [patientId, setPatientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle input changes for patient registration
  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle allergies and chronic conditions
  const handleArrayChange = (e, field, idx) => {
    const { value } = e.target;
    setPatientData((prev) => {
      const arr = [...prev[field]];
      arr[idx] = value;
      return { ...prev, [field]: arr };
    });
  };

  // Add new allergy or chronic condition field
  const addArrayField = (field) => {
    setPatientData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  // Remove allergy or chronic condition field
  const removeArrayField = (field, idx) => {
    setPatientData((prev) => {
      const arr = [...prev[field]];
      arr.splice(idx, 1);
      return { ...prev, [field]: arr };
    });
  };

  // Handle triage input changes
  const handleTriageChange = (e) => {
    const { name, value } = e.target;
    setTriageData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle vitals changes
  const handleVitalsChange = (e) => {
    const { name, value } = e.target;
    setTriageData((prev) => ({
      ...prev,
      vitals: { ...prev.vitals, [name]: value },
    }));
  };

  // Handle symptoms (checkboxes)
  const handleSymptomChange = (e) => {
    const { name, checked } = e.target;
    setTriageData((prev) => ({
      ...prev,
      symptoms: { ...prev.symptoms, [name]: checked },
    }));
  };

  // Step 1: Register patient
  const submitPatient = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(`${baseUrl}/api/v1/triage/patients`, patientData);
      setPatientId(res.data.id || res.data.patientId);
      setTriageData((prev) => ({ ...prev, patientId: res.data.id || res.data.patientId, nurseId }));
      setSuccess('Patient registered successfully!');
      setStep(2);
    } catch (err) {
      setError('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit triage
  const submitTriage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(`${baseUrl}/api/v1/triage/triage/smart`, triageData);
      setSuccess('Triage data submitted!');
    } catch (err) {
      setError('Triage submission failed.');
    } finally {
      setLoading(false);
    }
  };

  // Emergency override
  const emergencyOverride = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(`${baseUrl}/api/v1/triage/queue/${departmentId}/prioritize`, { patientId });
      setSuccess('Patient prioritized in queue!');
    } catch (err) {
      setError('Emergency override failed.');
    } finally {
      setLoading(false);
    }
  };

  // Send to queue
  const sendToQueue = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(`${baseUrl}/api/v1/triage/queue/${departmentId}`, { patientId });
      setSuccess('Patient sent to queue!');
    } catch (err) {
      setError('Send to queue failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Patient Registration & Triage</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      {loading && <div>Loading...</div>}
      {step === 1 && (
        <form onSubmit={submitPatient}>
          <h3>Registration</h3>
          <input name="firstName" placeholder="First Name" value={patientData.firstName} onChange={handlePatientChange} required />
          <input name="lastName" placeholder="Last Name" value={patientData.lastName} onChange={handlePatientChange} required />
          <input name="dateOfBirth" type="date" placeholder="Date of Birth" value={patientData.dateOfBirth} onChange={handlePatientChange} required />
          <input name="gender" placeholder="Gender" value={patientData.gender} onChange={handlePatientChange} required />
          <input name="phoneNumber" placeholder="Phone Number" value={patientData.phoneNumber} onChange={handlePatientChange} required />
          <input name="emergencyContact" placeholder="Emergency Contact" value={patientData.emergencyContact} onChange={handlePatientChange} required />
          <input name="emergencyContactName" placeholder="Emergency Contact Name" value={patientData.emergencyContactName} onChange={handlePatientChange} required />
          <input name="nationalId" placeholder="National ID" value={patientData.nationalId} onChange={handlePatientChange} required />
          <input name="nhifNumber" placeholder="NHIF Number" value={patientData.nhifNumber} onChange={handlePatientChange} required />
          <input name="address" placeholder="Address" value={patientData.address} onChange={handlePatientChange} required />
          <input name="county" placeholder="County" value={patientData.county} onChange={handlePatientChange} required />
          <input name="subCounty" placeholder="Sub County" value={patientData.subCounty} onChange={handlePatientChange} required />
          <input name="bloodGroup" placeholder="Blood Group" value={patientData.bloodGroup} onChange={handlePatientChange} required />
          <div>
            <label>Allergies:</label>
            {patientData.allergies.map((a, idx) => (
              <div key={idx}>
                <input value={a} onChange={(e) => handleArrayChange(e, 'allergies', idx)} placeholder="Allergy" required />
                {patientData.allergies.length > 1 && (
                  <button type="button" onClick={() => removeArrayField('allergies', idx)}>-</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addArrayField('allergies')}>Add Allergy</button>
          </div>
          <div>
            <label>Chronic Conditions:</label>
            {patientData.chronicConditions.map((c, idx) => (
              <div key={idx}>
                <input value={c} onChange={(e) => handleArrayChange(e, 'chronicConditions', idx)} placeholder="Condition" required />
                {patientData.chronicConditions.length > 1 && (
                  <button type="button" onClick={() => removeArrayField('chronicConditions', idx)}>-</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addArrayField('chronicConditions')}>Add Condition</button>
          </div>
          <button type="submit">Register Patient</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={submitTriage}>
          <h3>Triage</h3>
          <input name="chiefComplaint" placeholder="Chief Complaint" value={triageData.chiefComplaint} onChange={handleTriageChange} required />
          <h4>Vitals</h4>
          {Object.keys(triageData.vitals).map((key) => (
            <input
              key={key}
              name={key}
              placeholder={key}
              value={triageData.vitals[key]}
              onChange={handleVitalsChange}
              required
            />
          ))}
          <h4>Symptoms</h4>
          {[
            'notBreathing','seizureCurrent','burnFacialInhalation','cardiacArrest','airwayObstruction','reducedConsciousness','severeMechanismInjury','shortnessOfBreath','coughingBlood','chestPain','stabbedNeckOrChest','uncontrolledHemorrhage','seizurePostIctal','acuteStrokeSigns','aggression','threatenedLimb','dislocationLargeJoint','compoundFracture','burnOver20Percent','electricalBurn','circumferentialBurn','chemicalBurn','poisoningOverdose','vomitingFreshBlood','pregnancyAbdominalTrauma','pregnancyAbdominalPain','controlledHemorrhage','dislocationFingerToe','closedFracture','burnOther','abdominalPain','vomitingPersistently','pregnancyTrauma','pregnancyPvBleed','ketonuria','backache','diabetesHistory','moderatePain','severePain'
          ].map((symptom) => (
            <label key={symptom}>
              <input
                type="checkbox"
                name={symptom}
                checked={!!triageData.symptoms[symptom]}
                onChange={handleSymptomChange}
              />
              {symptom}
            </label>
          ))}
          <button type="submit">Submit Triage</button>
        </form>
      )}
      {step === 2 && (
        <div style={{ marginTop: 20 }}>
          <button onClick={emergencyOverride}>Emergency Override</button>
          <button onClick={sendToQueue}>Send to Queue</button>
        </div>
      )}
    </div>
  );
};

export default PatientRegistration;
