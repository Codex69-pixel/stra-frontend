
import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, X, Edit2, Trash2, User, Pill, Download } from "lucide-react";
import apiService from '../services/api';
import "./prescription.css";

// Prescription type definition
const PRESCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};



// ================= MOCK DATA FOR PRESENTATION =================
// This mock data is used for demo purposes only. Remove or disable for production.
const DEMO_MODE = true;
// If userRole is doctor, show only prescriptions issued by doctor
const MOCK_PRESCRIPTIONS_DOCTOR = [
  {
    id: 'RX2001',
    patientName: 'John Doe',
    patientId: 'DP001',
    medication: 'Lisinopril',
    dosage: '10mg',
    frequency: '1x/day',
    duration: '30 days',
    instructions: 'Take in the morning',
    refills: 2,
    prescribedBy: 'Dr. Sarah Johnson',
    datePrescribed: '2026-02-20',
    expiryDate: '2026-03-20',
    status: PRESCRIPTION_STATUS.ACTIVE,
    allergies: [],
  },
  {
    id: 'RX2002',
    patientName: 'Jane Smith',
    patientId: 'DP002',
    medication: 'Sumatriptan',
    dosage: '50mg',
    frequency: 'as needed',
    duration: 'as needed',
    instructions: 'Take at onset of migraine',
    refills: 1,
    prescribedBy: 'Dr. Sarah Johnson',
    datePrescribed: '2026-02-21',
    expiryDate: '2026-03-21',
    status: PRESCRIPTION_STATUS.COMPLETED,
    allergies: [],
  },
  {
    id: 'RX2003',
    patientName: 'Michael Brown',
    patientId: 'DP003',
    medication: 'Metformin',
    dosage: '500mg',
    frequency: '2x/day',
    duration: '90 days',
    instructions: 'Take with meals',
    refills: 3,
    prescribedBy: 'Dr. Sarah Johnson',
    datePrescribed: '2026-02-22',
    expiryDate: '2026-05-22',
    status: PRESCRIPTION_STATUS.ACTIVE,
    allergies: [],
  },
];

const MOCK_PRESCRIPTIONS = [
  {
    id: 'RX1001',
    patientName: 'John Doe',
    patientId: 'P001',
    medication: 'Amoxicillin',
    dosage: '500mg',
    frequency: '3x/day',
    duration: '7 days',
    instructions: 'Take after meals',
    refills: 1,
    prescribedBy: 'Dr. Sarah Johnson',
    datePrescribed: '2026-02-20',
    expiryDate: '2026-03-20',
    status: PRESCRIPTION_STATUS.ACTIVE,
    allergies: [],
  },
  {
    id: 'RX1002',
    patientName: 'Jane Smith',
    patientId: 'P002',
    medication: 'Ibuprofen',
    dosage: '200mg',
    frequency: '2x/day',
    duration: '5 days',
    instructions: 'Take with water',
    refills: 0,
    prescribedBy: 'Dr. Sarah Johnson',
    datePrescribed: '2026-02-21',
    expiryDate: '2026-03-21',
    status: PRESCRIPTION_STATUS.COMPLETED,
    allergies: [],
  },
  {
    id: 'RX1003',
    patientName: 'Michael Brown',
    patientId: 'P003',
    medication: 'Paracetamol',
    dosage: '500mg',
    frequency: '4x/day',
    duration: '3 days',
    instructions: 'Take as needed',
    refills: 2,
    prescribedBy: 'Dr. Sarah Johnson',
    datePrescribed: '2026-02-22',
    expiryDate: '2026-03-22',
    status: PRESCRIPTION_STATUS.ACTIVE,
    allergies: [],
  },
  {
    id: 'RX1004',
    patientName: 'Emily Davis',
    patientId: 'P004',
    medication: 'Cetirizine',
    dosage: '10mg',
    frequency: '1x/day',
    duration: '10 days',
    instructions: 'Take at bedtime',
    refills: 1,
    prescribedBy: 'Dr. Sarah Johnson',
    datePrescribed: '2026-02-23',
    expiryDate: '2026-03-23',
    status: PRESCRIPTION_STATUS.CANCELLED,
    allergies: [],
  },
  {
    id: 'RX1005',
    patientName: 'Chris Evans',
    patientId: 'P005',
    medication: 'Azithromycin',
    dosage: '250mg',
    frequency: '1x/day',
    duration: '3 days',
    instructions: 'Take before meals',
    refills: 0,
    prescribedBy: 'Dr. Sarah Johnson',
    datePrescribed: '2026-02-24',
    expiryDate: '2026-03-24',
    status: PRESCRIPTION_STATUS.ACTIVE,
    allergies: [],
  },
  {
    id: 'RX1006',
    patientName: 'Sophia Lee',
    patientId: 'P006',
    medication: 'Metformin',
    dosage: '500mg',
    frequency: '2x/day',
    duration: '30 days',
    instructions: 'Take with breakfast and dinner',
    refills: 3,
    prescribedBy: 'Dr. Sarah Johnson',
    datePrescribed: '2026-02-24',
    expiryDate: '2026-03-24',
    status: PRESCRIPTION_STATUS.ACTIVE,
    allergies: [],
  },
];
// ================= END MOCK DATA =================

function Prescriptions({ userRole = "doctor" }) {
  const [search, setSearch] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    patientName: "", 
    patientId: "",
    medication: "", 
    dosage: "", 
    frequency: "",
    duration: "",
    instructions: "",
    refills: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Fetch prescriptions from backend or use mock data for demo
  useEffect(() => {
    if (DEMO_MODE) {
      if (userRole === 'doctor') {
        setPrescriptions(MOCK_PRESCRIPTIONS_DOCTOR);
      } else {
        setPrescriptions(MOCK_PRESCRIPTIONS);
      }
    } else {
      async function fetchPrescriptions() {
        try {
          // TODO: Replace with actual backend call when available
          // Example: const data = await apiService.getPrescriptions();
          // setPrescriptions(data);
          setPrescriptions([]); // No endpoint yet, so empty
        } catch (err) {
          // Optionally handle error
        }
      }
      fetchPrescriptions();
    }
  }, [userRole]);

  // Filter prescriptions based on search and status
  const filteredPrescriptions = useCallback(() => {
    return prescriptions.filter(p => {
      const matchesSearch = search === "" || 
        p.patientName.toLowerCase().includes(search.toLowerCase()) ||
        p.medication.toLowerCase().includes(search.toLowerCase()) ||
        p.patientId.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = filterStatus === "ALL" || p.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, search, filterStatus]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  // Reset form
  const resetForm = () => {
    setForm({ 
      patientName: "", 
      patientId: "",
      medication: "", 
      dosage: "", 
      frequency: "",
      duration: "",
      instructions: "",
      refills: 0
    });
    setEditingId(null);
  };

  // Handle prescription submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      // TODO: Implement update prescription if backend supports
      // For now, just update locally
      setPrescriptions(prev => prev.map(p => p.id === editingId ? { ...p, ...form } : p));
    } else {
      // Create new prescription via backend
      const payload = {
        ...form,
        patientId: form.patientId || `P${String(Date.now()).slice(-4)}`,
        prescribedBy: "Dr. Sarah Johnson", // Replace with real user
        datePrescribed: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: PRESCRIPTION_STATUS.ACTIVE,
        allergies: []
      };
      try {
        const created = await apiService.createPrescription(payload);
        setPrescriptions(prev => [...prev, created]);
      } catch (err) {
        // Fallback: add locally if backend fails
        setPrescriptions(prev => [...prev, payload]);
      }
    }
    resetForm();
    setShowForm(false);
  };

  // Handle edit prescription
  const handleEdit = (prescription) => {
    setForm({
      patientName: prescription.patientName,
      patientId: prescription.patientId,
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      instructions: prescription.instructions,
      refills: prescription.refills
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
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by patient name, ID, or medication..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="prescription-search"
            aria-label="Search prescriptions"
          />
        </div>

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

          {userRole === "doctor" && (
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
      </div>

      {/* Prescription Form Modal */}
      {showForm && (
        <div className="prescription-form-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? "Edit Prescription" : "New Prescription"}</h2>
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
                  <label htmlFor="patientName">
                    <User size={16} />
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    id="patientName"
                    name="patientName"
                    placeholder="Enter patient name"
                    value={form.patientName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="patientId">Patient ID</label>
                  <input
                    type="text"
                    id="patientId"
                    name="patientId"
                    placeholder="Auto-generated if empty"
                    value={form.patientId}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="medication">
                    <Pill size={16} />
                    Medication *
                  </label>
                  <input
                    type="text"
                    id="medication"
                    name="medication"
                    placeholder="Enter medication name"
                    value={form.medication}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dosage">Dosage *</label>
                  <input
                    type="text"
                    id="dosage"
                    name="dosage"
                    placeholder="e.g., 200mg, 500mg"
                    value={form.dosage}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="frequency">Frequency *</label>
                  <select
                    id="frequency"
                    name="frequency"
                    value={form.frequency}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select frequency</option>
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="Every 6 hours">Every 6 hours</option>
                    <option value="Every 8 hours">Every 8 hours</option>
                    <option value="As needed">As needed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration *</label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    placeholder="e.g., 7 days, 30 days"
                    value={form.duration}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="instructions">Instructions</label>
                  <textarea
                    id="instructions"
                    name="instructions"
                    placeholder="Special instructions for the patient..."
                    value={form.instructions}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="refills">Refills</label>
                  <input
                    type="number"
                    id="refills"
                    name="refills"
                    min="0"
                    max="10"
                    value={form.refills}
                    onChange={handleChange}
                  />
                </div>
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
                  {editingId ? "Update Prescription" : "Create Prescription"}
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