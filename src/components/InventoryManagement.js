import React, { useState, useEffect, useMemo } from 'react';
import NotificationButton from './common/NotificationButton';
import { 
  User, ChevronDown, LogOut, Package, Plus, 
  AlertTriangle, CheckCircle, Clock, TrendingUp, Search, 
  Pill, MoreVertical, AlertCircle, ShoppingCart, X, FileText
} from 'lucide-react';
// import LoadingSpinner from './common/LoadingSpinner';
import './InventoryManagement.css';
import Prescriptions from './prescription';


import apiService from '../services/api';

const categories = ['Pain Relief', 'Antibiotics', 'Cardiovascular', 'Diabetes', 'Hypertension', 'GI Disorders'];

const STATUS_CONFIG = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle, label: 'Critical' },
  low: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle, label: 'Low' },
  optimal: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Optimal' }
};

const initialFormState = {
  name: '', 
  category: '', 
  stock: '', 
  reorderLevel: '', 
  supplier: '', 
  cost: '', 
  expiry: ''
};

export function InventoryManagement({ onNavigate }) {
  // State Management
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [addForm, setAddForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState(null);
    // Fetch medications from backend
    useEffect(() => {
      async function fetchMedications() {
        setLoading(true);
        setError(null);
        try {
          const meds = await apiService.getMedications();
          setInventory(Array.isArray(meds) ? meds : []);
        } catch (err) {
          setError('Failed to load inventory');
        } finally {
          setLoading(false);
        }
      }
      fetchMedications();
    }, []);
  const pageSize = 5;

  // Mock prescriptions data (shared with Prescriptions component)
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patientId: "P001",
      patientName: "John Doe",
      patientAge: 45,
      medication: "Paracetamol 500mg",
      dosage: "200mg",
      frequency: "Every 6 hours",
      duration: "7 days",
      instructions: "Take with food",
      prescribedBy: "Dr. Sarah Johnson",
      datePrescribed: "2024-01-15",
      expiryDate: "2024-02-15",
      status: 'COMPLETED',
      refills: 2,
      allergies: ["None"],
      quantity: 30
    },
    {
      id: 2,
      patientId: "P002",
      patientName: "Jane Smith",
      patientAge: 32,
      medication: "Amoxicillin 250mg",
      dosage: "500mg",
      frequency: "Every 8 hours",
      duration: "5 days",
      instructions: "Take as needed for fever",
      prescribedBy: "Dr. Michael Chen",
      datePrescribed: "2024-01-14",
      expiryDate: "2024-02-14",
      status: 'ACTIVE',
      refills: 1,
      allergies: ["Aspirin"],
      quantity: 20
    }
  ]);

  // Calculate medication usage from prescriptions
  const medicationUsage = useMemo(() => {
    const usageMap = {};
    
    prescriptions.forEach(prescription => {
      if (prescription.status === 'COMPLETED' || prescription.status === 'ACTIVE') {
        const medName = prescription.medication;
        if (!usageMap[medName]) {
          usageMap[medName] = {
            totalQuantity: 0,
            prescriptionCount: 0,
            lastPrescribed: prescription.datePrescribed
          };
        }
        usageMap[medName].totalQuantity += prescription.quantity || 0;
        usageMap[medName].prescriptionCount += 1;
      }
    });
    
    return usageMap;
  }, [prescriptions]);

  // Calculate statistics with prescription impact
  const stats = useMemo(() => ({
    total: inventory.reduce((sum, d) => sum + d.stock, 0),
    critical: inventory.filter(d => d.status === 'critical').length,
    reorderNeeded: inventory.filter(d => d.stock <= d.reorderLevel).length,
    totalValue: inventory.reduce((sum, d) => sum + (d.stock * d.cost), 0),
    expiringSoon: inventory.filter(d => {
      const expiryDate = new Date(d.expiry);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length,
    activePrescriptions: prescriptions.filter(p => p.status === 'ACTIVE').length
  }), [inventory, prescriptions]);

  // Handle prescription fulfillment (when medication is dispensed)
  const handlePrescriptionFulfilled = async (fulfillmentData) => {
    const { medicationId, quantity, prescriptionId } = fulfillmentData;
    setLoading(true);
    setError(null);
    try {
      // Update stock in backend
      await apiService.updateMedicationStock(medicationId, {
        adjustment: -quantity,
        reason: 'Dispensed for prescription',
        transactionType: 'DISPENSE',
        notes: '',
      });
      // Refresh inventory
      const meds = await apiService.getMedications();
      setInventory(Array.isArray(meds) ? meds : []);
      // Update prescription status locally
      setPrescriptions(prev =>
        prev.map(p => p.id === prescriptionId ? { ...p, status: 'COMPLETED' } : p)
      );
      alert(`✓ Inventory updated: ${quantity} units dispensed.`);
    } catch (err) {
      setError('Failed to update inventory');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort drugs with prescription data
  const filteredDrugs = useMemo(() => {
    return inventory.map(drug => {
      const usage = medicationUsage[drug.name];
      return {
        ...drug,
        prescriptionCount: usage ? usage.prescriptionCount : 0,
        totalPrescribed: usage ? usage.totalQuantity : 0
      };
    }).filter(drug => {
      const matchesSearch = drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          drug.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          drug.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || drug.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchQuery, selectedCategory, medicationUsage]);

  const sortedDrugs = useMemo(() => {
    return [...filteredDrugs].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      
      // Handle string comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      // Handle number comparison
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredDrugs, sortKey, sortOrder]);

  const pagedDrugs = useMemo(() => {
    return sortedDrugs.slice((page - 1) * pageSize, page * pageSize);
  }, [sortedDrugs, page, pageSize]);

  const totalPages = Math.ceil(filteredDrugs.length / pageSize);

  // Event Handlers
  const handleLogout = () => {
    setShowUserMenu(false);
    window.location.href = '/';
  };

  const validateAddForm = () => {
    const errors = {};
    if (!addForm.name.trim()) errors.name = 'Name is required';
    if (!addForm.category) errors.category = 'Category is required';
    if (!addForm.stock || isNaN(addForm.stock) || addForm.stock < 0) errors.stock = 'Valid stock required';
    if (!addForm.reorderLevel || isNaN(addForm.reorderLevel) || addForm.reorderLevel < 0) errors.reorderLevel = 'Valid reorder level required';
    if (!addForm.supplier.trim()) errors.supplier = 'Supplier is required';
    if (!addForm.cost || isNaN(addForm.cost) || addForm.cost < 0) errors.cost = 'Valid cost required';
    if (!addForm.expiry) errors.expiry = 'Expiry date required';
    return errors;
  };

  // const handleAddChange = (e) => {
  //   const { name, value } = e.target;
  //   setAddForm(prev => ({ ...prev, [name]: value }));
  //   if (addErrors[name]) {
  //     setAddErrors(prev => ({ ...prev, [name]: '' }));
  //   }
  // };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errors = validateAddForm();
    if (Object.keys(errors).length > 0) {
      // errors would be handled here if addErrors was used
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // No add medication endpoint in backend, so just close modal and reset form
      setShowAddModal(false);
      setAddForm(initialFormState);
      // setAddErrors({}); // removed unused state
      // Optionally, show a message
      alert('Medication add: Not implemented in backend');
    } catch (err) {
      setError('Failed to add medication');
    } finally {
      setLoading(false);
    }
  };

  // Removed unused handleExportCSV function

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.optimal;

  // TopBar Component - UPDATED
  const TopBar = () => (
    <header className="inventory-topbar">
      <div className="topbar-content">
        {/* Logo/Brand */}
        <div className="brand-section">
          <div className="brand-logo">
            <Pill size={28} />
          </div>
          <div>
            <h1 className="brand-title">Stra-Health Pharmacy</h1>
            <p className="brand-subtitle">Inventory Management System</p>
          </div>
        </div>

        {/* Desktop Navigation removed for pharmacy topbar */}

        {/* Right Side Actions - Notification and User Menu */}
        <div className="right-actions">
          <NotificationButton 
            onClick={() => alert('Notifications will appear here. (Backend integration pending)')}
            aria-label="View notifications"
            className="notification-btn-right"
          />
          
          {/* User Menu */}
          <div className="user-menu-container">
            <button
              className="user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <div className="user-avatar">
                <User size={20} />
              </div>
              <ChevronDown className={`chevron ${showUserMenu ? 'rotated' : ''}`} size={16} />
            </button>

            {showUserMenu && (
              <>
                <div 
                  className="dropdown-backdrop" 
                  onClick={() => setShowUserMenu(false)}
                  aria-hidden="true"
                />
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-avatar large">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="user-name">Pharmacy Admin</p>
                      <p className="user-role">Inventory Manager</p>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider" />
                  
                  <button
                    onClick={() => {
                      setShowPrescriptions(true);
                      setShowUserMenu(false);
                    }}
                    className="dropdown-item"
                    aria-label="View prescriptions"
                  >
                    <FileText size={18} />
                    <span>View Prescriptions</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowAddModal(true);
                      setShowUserMenu(false);
                    }}
                    className="dropdown-item"
                    aria-label="Add medication"
                  >
                    <Plus size={18} />
                    <span>Add Medication</span>
                  </button>
                  
                  <div className="dropdown-divider" />
                  
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout"
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

  // Prescriptions View Component
  const PrescriptionsView = () => (
    <div className="prescriptions-view">
      <div className="prescriptions-header">
        <button
          className="back-button"
          onClick={() => setShowPrescriptions(false)}
        >
          <ChevronDown size={20} className="back-arrow" />
          Back to Inventory
        </button>
        <div className="prescriptions-title">
          <h2>
            <FileText size={24} />
            Prescription Management
          </h2>
          <p>Manage and fulfill patient prescriptions</p>
        </div>
      </div>
      
      <Prescriptions 
        userRole="pharmacist" 
        inventory={inventory}
        onPrescriptionFulfilled={handlePrescriptionFulfilled}
        initialPrescriptions={prescriptions}
      />
    </div>
  );

  // Main Inventory View
  const InventoryView = () => (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="header-main">
          <h1>Pharmacy Inventory</h1>
          <p>Real-time medication stock management and alerts</p>
        </div>
        <div className="header-actions">
          <button 
            className="prescriptions-toggle-btn"
            onClick={() => setShowPrescriptions(true)}
          >
            <FileText size={18} />
            <span>Prescriptions ({stats.activePrescriptions})</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.total.toLocaleString()}</h3>
            <p>Total Stock Items</p>
            <span className="stat-trend">All medications</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.critical}</h3>
            <p>Critical Stock</p>
            <span className="stat-trend">Needs immediate action</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.reorderNeeded}</h3>
            <p>Reorder Needed</p>
            <span className="stat-trend">Below reorder level</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.activePrescriptions}</h3>
            <p>Active Prescriptions</p>
            <span className="stat-trend">Pending fulfillment</span>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search medications, suppliers, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search inventory"
          />
        </div>

        <div className="controls-group">
          <div className="category-filters">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-container">
        <div className="table-header">
          <h3>Medication Inventory</h3>
          <div className="table-info">
            <span>Showing {pagedDrugs.length} of {filteredDrugs.length} items</span>
            <span className="prescription-impact">
              • {Object.keys(medicationUsage).length} medications have prescription history
            </span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  Medication
                  {sortKey === 'name' && (
                    <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('category')} className="sortable">
                  Category
                  {sortKey === 'category' && (
                    <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('stock')} className="sortable">
                  Current Stock
                  {sortKey === 'stock' && (
                    <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('prescriptionCount')} className="sortable">
                  Prescriptions
                  {sortKey === 'prescriptionCount' && (
                    <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('reorderLevel')} className="sortable">
                  Reorder Level
                  {sortKey === 'reorderLevel' && (
                    <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('usage')} className="sortable">
                  Usage/Day
                  {sortKey === 'usage' && (
                    <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('status')} className="sortable">
                  Status
                  {sortKey === 'status' && (
                    <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedDrugs.map((drug) => {
                const statusConfig = getStatusConfig(drug.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <tr key={drug.id}>
                    <td>
                      <div className="medication-info">
                        <div className="medication-icon">
                          <Pill size={20} />
                        </div>
                        <div>
                          <div className="medication-name">{drug.name}</div>
                          <div className="medication-id">ID: MED-{String(drug.id).padStart(4, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">{drug.category}</span>
                    </td>
                    <td>
                      <div className={`stock-badge ${drug.stock <= drug.reorderLevel ? 'warning' : ''}`}>
                        {drug.stock.toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div className="prescription-info">
                        {drug.prescriptionCount > 0 ? (
                          <>
                            <FileText size={14} className="prescription-icon" />
                            <span className="prescription-count">{drug.prescriptionCount}</span>
                            <span className="prescription-quantity">({drug.totalPrescribed} units)</span>
                          </>
                        ) : (
                          <span className="no-prescriptions">None</span>
                        )}
                      </div>
                    </td>
                    <td>{drug.reorderLevel.toLocaleString()}</td>
                    <td>
                      <div className="usage-display">
                        <TrendingUp size={16} />
                        <span>{drug.usage}/day</span>
                      </div>
                    </td>
                    <td>
                      <div className={`status-badge ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon size={16} />
                        <span>{statusConfig.label}</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        {drug.prescriptionCount > 0 && (
                          <button
                            className="action-menu-btn prescription-action"
                            onClick={() => setShowPrescriptions(true)}
                            title="View prescriptions"
                          >
                            <FileText size={16} />
                          </button>
                        )}
                        <button className="action-menu-btn" aria-label="More options">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="pagination-btn"
              aria-label="Previous page"
            >
              ←
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
                  aria-label={`Page ${pageNum}`}
                  aria-current={page === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="pagination-btn"
              aria-label="Next page"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Alerts Section */}
      <div className="alerts-grid">
        <div className="alert-card">
          <div className="alert-header">
            <Clock size={20} />
            <h4>Expiring Soon (≤30 days)</h4>
            <span className="alert-count">{stats.expiringSoon}</span>
          </div>
          
          <div className="alert-list">
            {inventory
              .filter(drug => {
                const expiryDate = new Date(drug.expiry);
                const today = new Date();
                const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                return diffDays <= 30 && diffDays > 0;
              })
              .slice(0, 4)
              .map(drug => (
                <div key={drug.id} className="alert-item">
                  <div className="alert-item-header">
                    <span className="alert-medication">{drug.name}</span>
                    <span className="alert-date">{drug.expiry}</span>
                  </div>
                  <div className="alert-item-details">
                    <span>Stock: {drug.stock} units</span>
                    <span className="alert-tag">Expiring</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="alert-card">
          <div className="alert-header">
            <ShoppingCart size={20} />
            <h4>Pending Reorders</h4>
            <span className="alert-count">{stats.reorderNeeded}</span>
          </div>
          
          <div className="alert-list">
            {inventory
              .filter(drug => drug.stock <= drug.reorderLevel)
              .slice(0, 4)
              .map(drug => (
                <div key={drug.id} className="alert-item">
                  <div className="alert-item-header">
                    <span className="alert-medication">{drug.name}</span>
                    <span className="alert-supplier">{drug.supplier}</span>
                  </div>
                  <div className="alert-item-details">
                    <span>Current: {drug.stock} units</span>
                    <span className="alert-tag warning">
                      Need: {Math.max(0, drug.reorderLevel - drug.stock)} units
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="inventory-management">
      <TopBar />
      <main className="inventory-content">
        {error && <div className="alert alert-error">{error}</div>}
        {showPrescriptions ? <PrescriptionsView /> : <InventoryView />}
      </main>
      {/* Add Medication Modal (not implemented in backend) */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => !loading && setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Medication</h2>
              <button 
                type="button" 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
                disabled={loading}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="add-medication-form">
              {/* ...existing code for form fields... */}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}