
import React, { useState, useEffect, useCallback } from "react";
import { Plus, X, Edit2, Trash2, User, Pill, Download } from "lucide-react";
import apiService from '../services/api';
import "./prescription.css";

// Prescription type definition
const PRESCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};



function Prescriptions({ userRole = "doctor", selectedPatient }) {
  const [search] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    diagnosis: "",
    instructions: "",
    medications: [
      { medicationId: "", name: "", dosage: "", frequency: "", duration: "", instructions: "" }
    ]
  });
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Fetch prescriptions for selected patient or all (pharmacy)
  useEffect(() => {
    async function fetchPrescriptions() {
      setLoading(true);
      setError(null);
      try {
        let data = [];
        if (userRole === 'pharmacy') {
          // TODO: Replace with actual API call for all prescriptions if available
          // data = await apiService.getAllPrescriptions();
        } else if (selectedPatient && selectedPatient.id) {
          // TODO: Replace with actual API call for patient prescriptions if available
          // data = await apiService.getPrescriptionsByPatient(selectedPatient.id);
        }
        setPrescriptions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    }
    fetchPrescriptions();
  }, [selectedPatient, userRole]);

  // Filter prescriptions based on search and status
  const filteredPrescriptions = useCallback(() => {
    return prescriptions.filter(p => {
      const matchesSearch =
        search === "" ||
        (p.diagnosis && p.diagnosis.toLowerCase().includes(search.toLowerCase())) ||
        (p.medications && p.medications.some(med => med.name.toLowerCase().includes(search.toLowerCase())));
      const matchesStatus = filterStatus === "ALL" || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, search, filterStatus]);


  // Handle form input changes (for diagnosis/instructions)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle medication input changes
  const handleMedicationChange = (idx, e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const meds = prev.medications.map((med, i) =>
        i === idx ? { ...med, [name]: value } : med
      );
      return { ...prev, medications: meds };
    });
  };


  // Reset form
  const resetForm = () => {
    setForm({
      diagnosis: "",
      instructions: "",
      medications: [
        { medicationId: "", name: "", dosage: "", frequency: "", duration: "", instructions: "" }
      ]
    });
  };


  // Handle prescription submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !selectedPatient.id) return;
    const payload = {
      patientId: selectedPatient.id,
      diagnosis: form.diagnosis,
      instructions: form.instructions,
      medications: form.medications.map(med => ({
        medicationId: med.medicationId,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions
      }))
    };
    try {
      await apiService.createPrescription(payload);
      // Optionally refetch prescriptions after create
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError('Failed to create prescription');
    }
  };

  // Handle edit prescription (placeholder, as update API not available)
  const handleEdit = (prescription) => {
    setForm({
      diagnosis: prescription.diagnosis || "",
      instructions: prescription.instructions || "",
      medications: prescription.medications || [
        { medicationId: "", name: "", dosage: "", frequency: "", duration: "", instructions: "" }
      ]
    });
    setEditingId(prescription.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete prescription
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this prescription?")) {
      setPrescriptions(prev => prev.filter(p => p.id !== id));
    }
  };

  // Handle status change
  // const handleStatusChange = (id, newStatus) => {
  //   setPrescriptions(prev => 
  //     prev.map(p => p.id === id ? { ...p, status: newStatus } : p)
  //   );
  // };

  // Handle print/download
  const handlePrint = (prescription) => {
    const printContent = `
      Prescription Details
      --------------------
      Patient: ${prescription.patientName} (ID: ${prescription.patientId})
      Medication: ${prescription.medication}
      Dosage: ${prescription.dosage}
      Frequency: ${prescription.frequency}
      Duration: ${prescription.duration}
      Instructions: ${prescription.instructions}
      Prescribed by: ${prescription.prescribedBy}
      Date: ${prescription.datePrescribed}
      Expiry: ${prescription.expiryDate}
      Refills remaining: ${prescription.refills}
    `;
    
    alert("In a real application, this would generate a printable prescription PDF.\n\n" + printContent);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case PRESCRIPTION_STATUS.ACTIVE: return "#10b981";
      case PRESCRIPTION_STATUS.COMPLETED: return "#3b82f6";
      case PRESCRIPTION_STATUS.CANCELLED: return "#ef4444";
      default: return "#6b7280";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch(status) {
      case PRESCRIPTION_STATUS.ACTIVE: return "Active";
      case PRESCRIPTION_STATUS.COMPLETED: return "Completed";
      case PRESCRIPTION_STATUS.CANCELLED: return "Cancelled";
      default: return status;
    }
  };

  return (
    <div className="prescriptions-container">
      <div className="prescriptions-header">
        <h1 className="prescriptions-title">
          <Pill size={24} />
          Prescription Management
        </h1>
        <p className="prescriptions-subtitle">
          View, create, and manage patient prescriptions
        </p>
      </div>

      <div className="prescriptions-controls">
        <div className="filter-controls">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
            aria-label="Filter by status"
          >
            <option value="ALL">All Status</option>
            <option value={PRESCRIPTION_STATUS.ACTIVE}>Active</option>
            <option value={PRESCRIPTION_STATUS.COMPLETED}>Completed</option>
            <option value={PRESCRIPTION_STATUS.CANCELLED}>Cancelled</option>
          </select>

          {userRole === "doctor" && selectedPatient && (
            <button
              className="add-prescription-btn"
              onClick={() => setShowForm(true)}
              aria-label="Add new prescription"
            >
              <Plus size={20} />
              New Prescription
            </button>
          )}
        </div>
        {!selectedPatient && (
          <div style={{color: '#dc2626', marginTop: 8}}>
            Select a patient before creating a prescription.
          </div>
        )}
      </div>

      {/* Prescription Form Modal */}
      {showForm && selectedPatient && (
        <div className="prescription-form-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>New Prescription</h2>
              <button
                className="close-modal"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="prescription-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Patient</label>
                  <input type="text" value={selectedPatient?.name || (selectedPatient?.firstName ? selectedPatient.firstName + ' ' + selectedPatient.lastName : '')} disabled />
                </div>
                <div className="form-group">
                  <label>Diagnosis *</label>
                  <input type="text" name="diagnosis" value={form.diagnosis} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Instructions</label>
                  <input type="text" name="instructions" value={form.instructions} onChange={handleChange} />
                </div>
                {form.medications.map((med, idx) => (
                  <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                    <div className="form-group">
                      <label>Medication Name *</label>
                      <input type="text" name="name" value={med.name} onChange={e => handleMedicationChange(idx, e)} required />
                    </div>
                    <div className="form-group">
                      <label>Medication ID</label>
                      <input type="text" name="medicationId" value={med.medicationId} onChange={e => handleMedicationChange(idx, e)} />
                    </div>
                    <div className="form-group">
                      <label>Dosage *</label>
                      <input type="text" name="dosage" value={med.dosage} onChange={e => handleMedicationChange(idx, e)} required />
                    </div>
                    <div className="form-group">
                      <label>Frequency *</label>
                      <input type="text" name="frequency" value={med.frequency} onChange={e => handleMedicationChange(idx, e)} required />
                    </div>
                    <div className="form-group">
                      <label>Duration *</label>
                      <input type="text" name="duration" value={med.duration} onChange={e => handleMedicationChange(idx, e)} required />
                    </div>
                    <div className="form-group">
                      <label>Instructions</label>
                      <input type="text" name="instructions" value={med.instructions} onChange={e => handleMedicationChange(idx, e)} />
                    </div>
                  </div>
                ))}
                <button type="button" className="btn-secondary" onClick={() => setForm(prev => ({ ...prev, medications: [...prev.medications, { medicationId: "", name: "", dosage: "", frequency: "", duration: "", instructions: "" }] }))}>Add Medication</button>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescriptions List */}
      <div className="prescriptions-list-container">
        {filteredPrescriptions().length === 0 ? (
          <div className="no-prescriptions">
            <Pill size={48} />
            <p>No prescriptions found</p>
            {search && <p>Try adjusting your search terms</p>}
          </div>
        ) : (
          <div className="prescriptions-grid">
            {filteredPrescriptions().map((prescription) => (
              <div key={prescription.id} className="prescription-card">
                <div className="prescription-header">
                  <div className="patient-info">
                    <h3 className="patient-name">
                      <User size={18} />
                      {prescription.patientName}
                      <span className="patient-id">({prescription.patientId})</span>
                    </h3>
                    <div className="prescription-medication">
                      <Pill size={16} />
                      <strong>{prescription.medication}</strong>
                      <span className="dosage">{prescription.dosage}</span>
                    </div>
                  </div>
                  <div className="prescription-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(prescription.status) }}
                    >
                      {getStatusText(prescription.status)}
                    </span>
                  </div>
                </div>

                <div className="prescription-details">
                  <div className="detail-item">
                    <span className="detail-label">Frequency:</span>
                    <span className="detail-value">{prescription.frequency}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{prescription.duration}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Refills:</span>
                    <span className="detail-value">{prescription.refills} remaining</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Instructions:</span>
                    <span className="detail-value">{prescription.instructions || "None"}</span>
                  </div>
                </div>

                <div className="prescription-footer">
                  <div className="prescription-meta">
                    <span className="meta-item">
                      Prescribed by: {prescription.prescribedBy}
                    </span>
                    <span className="meta-item">
                      Date: {prescription.datePrescribed}
                    </span>
                    {prescription.expiryDate && (
                      <span className="meta-item">
                        Expires: {prescription.expiryDate}
                      </span>
                    )}
                  </div>

                  {userRole === "doctor" && (
                    <div className="prescription-actions">
                      <button
                        className="action-btn"
                        onClick={() => handleEdit(prescription)}
                        aria-label="Edit prescription"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => handlePrint(prescription)}
                        aria-label="Print prescription"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        className="action-btn danger"
                        onClick={() => handleDelete(prescription.id)}
                        aria-label="Delete prescription"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescriptions Summary */}
      {userRole === "doctor" && prescriptions.length > 0 && (
        <div className="prescriptions-summary">
          <div className="summary-card">
            <h4>Prescription Summary</h4>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Total Prescriptions</span>
                <span className="stat-value">{prescriptions.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active</span>
                <span className="stat-value">
                  {prescriptions.filter(p => p.status === PRESCRIPTION_STATUS.ACTIVE).length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">This Month</span>
                <span className="stat-value">
                  {prescriptions.filter(p => 
                    new Date(p.datePrescribed).getMonth() === new Date().getMonth()
                  ).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Prescriptions;