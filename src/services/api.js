/**
 * API Service Module
 * 
 * Centralized API communication layer for connecting to Node.js backend
 * Handles all HTTP requests to the server and SQL database
 * 
 * Usage:
 * import { apiService } from './services/api';
 * const patients = await apiService.getPatients();
 */

// API Base Configuration
const API_CONFIG = {
  BASE_URL: 'https://stra-sys-backend-production.up.railway.app',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

/**
 * Generic HTTP request handler with error handling
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Fetch options (method, body, headers)
 * @returns {Promise} - API response data
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Get auth token from localStorage if available
  const token = localStorage.getItem('authToken');
  
  const config = {
    ...options,
    headers: {
      ...API_CONFIG.HEADERS,
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      ...config,
      credentials: 'include',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Network or timeout errors
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection');
    }
    
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * API Service Object
 * Contains all API methods organized by module
 */
export const apiService = {
  
  // ==================== AUTHENTICATION ====================
  // ==================== AUTHENTICATION ====================
  /**
   * User login
   * @param {object} credentials - { username, password, role }
   * @returns {Promise<{user, token}>}
   */
  /**
   * User login (POST /api/v1/auth/login)
   * @param {object} credentials - { email, password }
   * @returns {Promise<{success, token, refreshToken, user}>}
   */
  async login({ email, password }) {
    const data = await apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) setAuthToken(data.token);
    return data;
  },

  /**
   * User registration
   * @param {object} userData - Registration form data
   * @returns {Promise<object>}
   */
  /**
   * User registration (POST /api/v1/auth/register)
   * @param {object} userData - { email, password, firstName, lastName, role, ... }
   * @returns {Promise<object>}
   */
  async register(userData) {
    return apiRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  /**
   * User logout
   * @returns {Promise<{success}>}
   */
  /**
   * User logout (POST /api/v1/auth/logout)
   * @returns {Promise<{success}>}
   */
  async logout() {
    const result = await apiRequest('/api/v1/auth/logout', { method: 'POST' });
    clearAuthToken();
    return result;
  },

  /**
   * Get user profile (GET /api/v1/auth/profile)
   */
  async getProfile() {
    return apiRequest('/api/v1/auth/profile', { method: 'GET' });
  },

  /**
   * Update user profile (PUT /api/v1/auth/profile)
   */
  async updateProfile(profileData) {
    return apiRequest('/api/v1/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  /**
   * Refresh JWT token (POST /api/v1/auth/refresh-token)
   */
  async refreshToken(refreshToken) {
    return apiRequest('/api/v1/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
  },

  /**
   * Forgot password (POST /api/v1/auth/forgot-password)
   */
  async forgotPassword(email) {
    return apiRequest('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  /**
   * Reset password (POST /api/v1/auth/reset-password)
   */
  async resetPassword(resetToken, newPassword) {
    return apiRequest('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword })
    });
  },

  /**
   * Change password (POST /api/v1/auth/change-password)
   */
  async changePassword(currentPassword, newPassword) {
    return apiRequest('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  /**
   * Verify authentication token
   * @returns {Promise<{valid, user}>}
   */
  // No /auth/verify endpoint in swagger.json

  // ==================== PATIENT MANAGEMENT ====================
  
  /**
   * Get all patients
   * @param {object} filters - Optional filters { department, urgency, status }
   * @returns {Promise<Array>}
   */
  /**
   * Register new patient (POST /api/v1/triage/patients)
   * @param {object} patientData
   * @returns {Promise<object>}
   */
  async registerPatient(patientData) {
    return apiRequest('/api/v1/triage/patients', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
  },

  /**
   * Get patient details (GET /api/v1/triage/patients/{patientId})
   * @param {string} patientId
   * @returns {Promise<object>}
   */
  async getPatientById(patientId) {
    return apiRequest(`/api/v1/triage/patients/${patientId}`, { method: 'GET' });
  },

  /**
   * Perform triage (POST /api/v1/triage/triage)
   */
  async performTriage(triageData) {
    return apiRequest('/api/v1/triage/triage', {
      method: 'POST',
      body: JSON.stringify(triageData)
    });
  },

  async performSmartTriage(triageData) {
    return apiRequest('/api/v1/triage/smart', {
      method: 'POST',
      body: JSON.stringify(triageData)
    });
  },

  /**
   * Get triage statistics (GET /api/v1/triage/statistics)
   */
  async getTriageStatistics() {
    return apiRequest('/api/v1/triage/statistics', { method: 'GET' });
  },

  async getDepartments() {
    return apiRequest('/api/v1/triage/departments', { method: 'GET' });
  },

  async getTriageSession(sessionId) {
    return apiRequest(`/api/v1/triage/session/${sessionId}`, { method: 'GET' });
  },

  async updateInvestigation(investigationId, data) {
    return apiRequest(`/api/v1/triage/investigations/${investigationId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  /**
   * Get single patient by ID
   * @param {string} patientId - STRA patient ID
   * @returns {Promise<object>}
   */

  /**
   * Register new patient (Nurse Triage)
   * @param {object} patientData - Complete patient registration form data
   * @returns {Promise<{patientId, straId}>}
   */
  /**
   * Get patient triage history (GET /api/v1/triage/patient/{patientId}/history)
   * @param {string} patientId
   * @returns {Promise<Array>}
   */
  async getPatientHistory(patientId) {
    return apiRequest(`/api/v1/triage/patient/${patientId}/history`, { method: 'GET' });
  },

  /**
   * Update patient information
   * @param {string} patientId - STRA patient ID
   * @param {object} updates - Fields to update
   * @returns {Promise<object>}
   */
  // No update endpoint for patient in swagger.json

  /**
   * Get patient medical history
   * @param {string} patientId - STRA patient ID
   * @returns {Promise<Array>}
   */
  // Already implemented above

  // ==================== QUEUE MANAGEMENT ====================
  
  /**
   * Get queue for all departments
   * @returns {Promise<Array>}
   */
  /**
   * Get department queue (GET /api/v1/triage/queue/{departmentId})
   * @param {string} departmentId
   * @returns {Promise<Array>}
   */
  async getDepartmentQueue(departmentId) {
    return apiRequest(`/api/v1/triage/queue/${departmentId}`, { method: 'GET' });
  },

  /**
   * Update queue position (PATCH /api/v1/triage/queue/{queueId}/position)
   * @param {string} queueId
   * @param {number} position
   * @returns {Promise<object>}
   */
  async updateQueuePosition(queueId, position) {
    return apiRequest(`/api/v1/triage/queue/${queueId}/position`, {
      method: 'PATCH',
      body: JSON.stringify({ position })
    });
  },

  /**
   * Call next patient (POST /api/v1/triage/queue/{departmentId}/call-next)
   */
  async callNextPatient(departmentId, doctorId) {
    return apiRequest(`/api/v1/triage/queue/${departmentId}/call-next`, {
      method: 'POST',
      body: JSON.stringify({ doctorId })
    });
  },

  /**
   * Complete patient treatment (POST /api/v1/triage/queue/{queueId}/complete)
   */
  async completePatient(queueId) {
    return apiRequest(`/api/v1/triage/queue/${queueId}/complete`, {
      method: 'POST' });
  },

  /**
   * Prioritize critical patients (POST /api/v1/triage/queue/{departmentId}/prioritize)
   */
  async prioritizeQueue(departmentId) {
    return apiRequest(`/api/v1/triage/queue/${departmentId}/prioritize`, {
      method: 'POST' });
  },

  /**
   * Update patient status in queue
   * @param {string} patientId - STRA patient ID
   * @param {string} status - New status (WAITING, IN_PROGRESS, COMPLETED)
   * @returns {Promise<object>}
   */
  // No transfer endpoint in swagger.json

  // ==================== DOCTOR PORTAL ====================
  
  /**
   * Add clinical notes to patient record
   * @param {string} patientId - STRA patient ID
   * @param {string} notes - Clinical observations
   * @returns {Promise<object>}
   */

  /**
   * Get doctor queue (GET /api/v1/doctor/queue)
   */
  async getDoctorQueue() {
    return apiRequest('/api/v1/doctor/queue', { method: 'GET' });
  },

  /**
   * Get patient details (GET /api/v1/doctor/patients/{patientId})
   */
  async getDoctorPatientById(patientId) {
    return apiRequest(`/api/v1/doctor/patients/${patientId}`, { method: 'GET' });
  },

  /**
   * Order lab tests (POST /api/v1/doctor/lab-orders)
   */
  async orderLabTests(labOrder) {
    return apiRequest('/api/v1/doctor/lab-orders', {
      method: 'POST',
      body: JSON.stringify(labOrder)
    });
  },

  /**
   * Order diagnostic imaging (POST /api/v1/doctor/imaging)
   */
  async orderImaging(imagingOrder) {
    return apiRequest('/api/v1/doctor/imaging', {
      method: 'POST',
      body: JSON.stringify(imagingOrder)
    });
  },

  /**
   * Create prescription (POST /api/v1/doctor/prescriptions)
   */
  async createPrescription(prescription) {
    return apiRequest('/api/v1/doctor/prescriptions', {
      method: 'POST',
      body: JSON.stringify(prescription)
    });
  },

  /**
   * Record vital signs (POST /api/v1/doctor/patients/{patientId}/vitals)
   */
  async recordVitals(patientId, vitals) {
    return apiRequest(`/api/v1/doctor/patients/${patientId}/vitals`, {
      method: 'POST',
      body: JSON.stringify(vitals)
    });
  },

  /**
   * Update patient disposition (PUT /api/v1/doctor/patients/{patientId}/disposition)
   */
  async updateDisposition(patientId, dispositionData) {
    return apiRequest(`/api/v1/doctor/patients/${patientId}/disposition`, {
      method: 'PUT',
      body: JSON.stringify(dispositionData)
    });
  },

  /**
   * Get patient lab results (GET /api/v1/doctor/patients/{patientId}/lab-results)
   */
  async getLabResults(patientId) {
    return apiRequest(`/api/v1/doctor/patients/${patientId}/lab-results`, { method: 'GET' });
  },

  /**
   * Get doctor statistics (GET /api/v1/doctor/statistics)
   */
  async getDoctorStatistics() {
    return apiRequest('/api/v1/doctor/statistics', { method: 'GET' });
  },

  /**
   * Create medical orders (lab tests, imaging)
   * @param {string} patientId - STRA patient ID
   * @param {object} orders - { labTests: [], imaging: [] }
   * @returns {Promise<object>}
   */
  // Use orderLabTests and orderImaging above

  /**
   * Create prescription
   * @param {string} patientId - STRA patient ID
   * @param {object} prescription - Medication details
   * @returns {Promise<object>}
   */
  // Use createPrescription above

  /**
   * Get all prescriptions for a patient
   * @param {string} patientId - STRA patient ID
   * @returns {Promise<Array>}
   */
  // Not in swagger.json; implement if backend supports

  /**
   * Discharge patient
   * @param {string} patientId - STRA patient ID
   * @param {object} dischargeInfo - Discharge summary
   * @returns {Promise<object>}
   */
  // Not in swagger.json

  // ==================== RESOURCE MANAGEMENT ====================
  
  /**
   * Get all resources (beds, staff, equipment)
   * @returns {Promise<object>}
   */
  async getResourceDashboard() {
    return apiRequest('/api/v1/resources/dashboard', { method: 'GET' });
  },

  /**
   * Get resource availability (GET /api/v1/resources/availability)
   */
  async getResourceAvailability() {
    return apiRequest('/api/v1/resources/availability', { method: 'GET' });
  },

  /**
   * Predictive resource load (GET /api/v1/resources/predictive-load)
   */
  async getPredictiveResourceLoad() {
    return apiRequest('/api/v1/resources/predictive-load', { method: 'GET' });
  },

  /**
   * Allocate resource (POST /api/v1/resources/{resourceId}/allocate)
   */
  async allocateResource(resourceId, patientId) {
    return apiRequest(`/api/v1/resources/${resourceId}/allocate`, {
      method: 'POST',
      body: JSON.stringify({ patientId })
    });
  },

  /**
   * Release resource (POST /api/v1/resources/{resourceId}/release)
   */
  async releaseResource(resourceId) {
    return apiRequest(`/api/v1/resources/${resourceId}/release`, {
      method: 'POST' });
  },

  /**
   * Set resource maintenance (POST /api/v1/resources/{resourceId}/maintenance)
   */
  async setResourceMaintenance(resourceId, maintenanceData) {
    return apiRequest(`/api/v1/resources/${resourceId}/maintenance`, {
      method: 'POST',
      body: JSON.stringify(maintenanceData)
    });
  },

  /**
   * Get bed availability
   * @returns {Promise<object>}
   */
  // Not in swagger.json

  /**
   * Update bed status
   * @param {string} bedId - Bed identifier
   * @param {string} status - New status (AVAILABLE, OCCUPIED, CLEANING)
   * @returns {Promise<object>}
   */
  // Not in swagger.json

  /**
   * Get staff availability
   * @param {string} role - Optional role filter (doctor, nurse, technician)
   * @returns {Promise<Array>}
   */
  // Not in swagger.json

  /**
   * Get equipment status
   * @returns {Promise<Array>}
   */
  // Not in swagger.json

  /**
   * Update equipment status
   * @param {string} equipmentId - Equipment identifier
   * @param {string} status - New status (AVAILABLE, IN_USE, MAINTENANCE)
   * @returns {Promise<object>}
   */
  // Not in swagger.json

  // ==================== INVENTORY MANAGEMENT ====================
  
  /**
   * Get all inventory items
   * @param {object} filters - Optional filters { category, status }
   * @returns {Promise<Array>}
   */
  async getMedications() {
    return apiRequest('/api/v1/inventory/medications', { method: 'GET' });
  },

  /**
   * Get single inventory item
   * @param {string} itemId - Item identifier
   * @returns {Promise<object>}
   */
  // Not in swagger.json

  /**
   * Add new medication to inventory
   * @param {object} itemData - Medication details
   * @returns {Promise<object>}
   */
  // Not in swagger.json

  /**
   * Update inventory stock levels
   * @param {string} itemId - Item identifier
   * @param {number} quantity - New quantity
   * @returns {Promise<object>}
   */
  async updateMedicationStock(medicationId, stockUpdate) {
    return apiRequest(`/api/v1/inventory/medications/${medicationId}/stock`, {
      method: 'PUT',
      body: JSON.stringify(stockUpdate)
    });
  },

  /**
   * Get low stock alerts
   * @returns {Promise<Array>}
   */
  async getLowStockAlerts() {
    return apiRequest('/api/v1/inventory/alerts/low-stock', { method: 'GET' });
  },

  async getConsumptionAnalytics() {
    return apiRequest('/api/v1/inventory/analytics/consumption', { method: 'GET' });
  },

  /**
   * Generate purchase order
   * @param {Array} items - Array of {itemId, quantity}
   * @returns {Promise<object>}
   */
  // Not in swagger.json

  // ==================== ANALYTICS ====================
  
  /**
   * Get dashboard analytics
   * @param {object} dateRange - { startDate, endDate }
   * @returns {Promise<object>}
   */
  async getPatientVolume() {
    return apiRequest('/api/v1/analytics/patient-volume', { method: 'GET' });
  },

  async getWaitTimes() {
    return apiRequest('/api/v1/analytics/wait-times', { method: 'GET' });
  },

  async detectOutbreaks() {
    return apiRequest('/api/v1/analytics/outbreak-detection', { method: 'GET' });
  },

  async getStaffProductivity() {
    return apiRequest('/api/v1/analytics/staff-productivity', { method: 'GET' });
  },

  async getResourceUtilization() {
    return apiRequest('/api/v1/analytics/resource-utilization', { method: 'GET' });
  },

  async getMedicationAnalytics() {
    return apiRequest('/api/v1/analytics/medication-analytics', { method: 'GET' });
  },

  async getKPIDashboard() {
    return apiRequest('/api/v1/analytics/kpi-dashboard', { method: 'GET' });
  },

  async getFinancialMetrics() {
    return apiRequest('/api/v1/analytics/financial-metrics', { method: 'GET' });
  },

  async exportAnalyticsReport(payload) {
    return apiRequest('/api/v1/analytics/export', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Get patient volume statistics
   * @returns {Promise<object>}
   */
  // Not in swagger.json

  /**
   * Get wait time statistics
   * @returns {Promise<object>}
   */
  // Not in swagger.json

  /**
   * Get department performance metrics
   * @returns {Promise<Array>}
   */
  // Not in swagger.json

  /**
   * Get resource utilization metrics
   * @returns {Promise<object>}
   */
  // Not in swagger.json

  /**
   * Export analytics report
   * @param {string} format - Report format (pdf, csv, excel)
   * @param {object} filters - Report filters
   * @returns {Promise<Blob>}
   */
  // Not in swagger.json

  // ==================== NOTIFICATIONS ====================
  
  /**
   * Get notifications for current user
   * @returns {Promise<Array>}
   */
  // Not in swagger.json

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification identifier
   * @returns {Promise<object>}
   */
  // Not in swagger.json

  // ==================== ADMIN FUNCTIONS ====================
  
  /**
   * Get all users (Admin only)
   * @returns {Promise<Array>}
   */
  async getAllUsers() {
    return apiRequest('/api/v1/auth/users', { method: 'GET' });
  },

  /**
   * Create new user (Admin only)
   * @param {object} userData - User details
   * @returns {Promise<object>}
   */
  // Not in swagger.json

  /**
   * Update user role/permissions (Admin only)
   * @param {string} userId - User identifier
   * @param {object} updates - Updates to apply
   * @returns {Promise<object>}
   */
  // Not in swagger.json

  /**
   * Get system logs (Admin only)
   * @param {object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  // Not in swagger.json

  /**
   * Get system health status (Admin only)
   * @returns {Promise<object>}
   */
  async getHealth() {
    return apiRequest('/api/v1/health', { method: 'GET' });
  },

  async getDbHealth() {
    return apiRequest('/api/v1/health/db', { method: 'GET' });
  }
};

/**
 * Helper function to save auth token
 * @param {string} token - JWT token from login
 */
export function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

/**
 * Helper function to clear auth token
 */
export function clearAuthToken() {
  localStorage.removeItem('authToken');
}

/**
 * Helper function to get current auth token
 * @returns {string|null}
 */
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

export default apiService;
