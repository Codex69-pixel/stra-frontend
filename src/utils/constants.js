// ================= MOCK PATIENT DATA FOR DEMO =================
export const MOCK_PATIENTS = [
  { id: 'DP001', name: 'John Doe', gender: 'Male', dateOfBirth: '1980-01-01', phoneNumber: '555-1234', emergencyContactName: 'Jane Doe', emergencyContact: '555-5678', address: '123 Main St', county: 'County A', subCounty: 'Sub A', bloodGroup: 'A+', allergies: ['Penicillin'], chronicConditions: ['Hypertension'], symptoms: ['Headache'], chiefComplaint: 'Headache', vitals: { BP: '145/92', Pulse: 78, Temp: '36.8C' }, triageSummary: 'BP elevated, pulse normal.', notes: 'Follow up in 2 weeks.' },
  { id: 'DP002', name: 'Mary Smith', gender: 'Female', dateOfBirth: '1990-02-15', phoneNumber: '555-2345', emergencyContactName: 'Tom Smith', emergencyContact: '555-6789', address: '456 Oak Ave', county: 'County B', subCounty: 'Sub B', bloodGroup: 'B-', allergies: [], chronicConditions: [], symptoms: ['Migraine'], chiefComplaint: 'Migraine', vitals: { BP: '120/80', Pulse: 72, Temp: '36.7C' }, triageSummary: 'Migraine symptoms, no neuro deficit.', notes: '' },
  { id: 'DP003', name: 'Alice Johnson', gender: 'Female', dateOfBirth: '1975-03-10', phoneNumber: '555-3456', emergencyContactName: 'Bob Johnson', emergencyContact: '555-7890', address: '789 Pine Rd', county: 'County C', subCounty: 'Sub C', bloodGroup: 'O+', allergies: ['Latex'], chronicConditions: ['Diabetes'], symptoms: ['Fatigue'], chiefComplaint: 'Fatigue', vitals: { BP: '130/85', Pulse: 80, Temp: '36.9C' }, triageSummary: 'Blood sugar high, needs adjustment.', notes: '' },
  { id: 'DP004', name: 'David Lee', gender: 'Male', dateOfBirth: '1985-04-20', phoneNumber: '555-4567', emergencyContactName: 'Sara Lee', emergencyContact: '555-8901', address: '321 Cedar Blvd', county: 'County D', subCounty: 'Sub D', bloodGroup: 'AB-', allergies: [], chronicConditions: ['Asthma'], symptoms: ['Shortness of breath'], chiefComplaint: 'Shortness of breath', vitals: { BP: '125/82', Pulse: 76, Temp: '36.6C' }, triageSummary: 'Asthma controlled, mild wheeze.', notes: '' },
  { id: 'DP005', name: 'Emma Brown', gender: 'Female', dateOfBirth: '2000-05-25', phoneNumber: '555-5678', emergencyContactName: 'Mike Brown', emergencyContact: '555-9012', address: '654 Maple Ln', county: 'County E', subCounty: 'Sub E', bloodGroup: 'A-', allergies: [], chronicConditions: [], symptoms: ['Back pain'], chiefComplaint: 'Back pain', vitals: { BP: '118/76', Pulse: 70, Temp: '36.5C' }, triageSummary: 'Musculoskeletal pain, no red flags.', notes: '' },
  { id: 'DP006', name: 'Olivia Green', gender: 'Female', dateOfBirth: '1995-06-30', phoneNumber: '555-6789', emergencyContactName: 'Chris Green', emergencyContact: '555-0123', address: '987 Birch Dr', county: 'County F', subCounty: 'Sub F', bloodGroup: 'B+', allergies: ['Pollen'], chronicConditions: [], symptoms: ['Sneezing'], chiefComplaint: 'Sneezing', vitals: { BP: '110/70', Pulse: 74, Temp: '36.7C' }, triageSummary: 'Allergy confirmed, mild symptoms.', notes: '' },
  { id: 'DP007', name: 'Liam White', gender: 'Male', dateOfBirth: '1988-07-12', phoneNumber: '555-7890', emergencyContactName: 'Nina White', emergencyContact: '555-1235', address: '246 Spruce St', county: 'County G', subCounty: 'Sub G', bloodGroup: 'O-', allergies: [], chronicConditions: [], symptoms: ['Swelling'], chiefComplaint: 'Swelling', vitals: { BP: '122/78', Pulse: 75, Temp: '36.8C' }, triageSummary: 'Sprain, mild swelling.', notes: '' },
  { id: 'DP008', name: 'Noah Black', gender: 'Male', dateOfBirth: '1970-08-18', phoneNumber: '555-8901', emergencyContactName: 'Ella Black', emergencyContact: '555-2346', address: '135 Willow Way', county: 'County H', subCounty: 'Sub H', bloodGroup: 'AB+', allergies: [], chronicConditions: [], symptoms: ['Migraine'], chiefComplaint: 'Migraine', vitals: { BP: '119/75', Pulse: 73, Temp: '36.6C' }, triageSummary: 'Migraine, stable.', notes: '' },
  { id: 'DP009', name: 'Sophia Blue', gender: 'Female', dateOfBirth: '1992-09-22', phoneNumber: '555-9012', emergencyContactName: 'Luke Blue', emergencyContact: '555-3457', address: '864 Aspen Ct', county: 'County I', subCounty: 'Sub I', bloodGroup: 'A+', allergies: [], chronicConditions: ['Asthma'], symptoms: ['Wheezing'], chiefComplaint: 'Wheezing', vitals: { BP: '124/80', Pulse: 77, Temp: '36.7C' }, triageSummary: 'Asthma, stable.', notes: '' },
  { id: 'DP010', name: 'Mason Gray', gender: 'Male', dateOfBirth: '1982-10-05', phoneNumber: '555-0123', emergencyContactName: 'Ava Gray', emergencyContact: '555-4568', address: '753 Poplar Pl', county: 'County J', subCounty: 'Sub J', bloodGroup: 'B-', allergies: [], chronicConditions: ['Infection'], symptoms: ['Fever'], chiefComplaint: 'Fever', vitals: { BP: '117/74', Pulse: 71, Temp: '36.5C' }, triageSummary: 'Infection resolved.', notes: '' },
];

export const MOCK_LAB_RESULTS = {
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

export const MOCK_PATIENT_HISTORY = {
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

export const MOCK_TRIAGE_SUMMARY = {
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

export const MOCK_VITALS = {
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
// ================= END MOCK PATIENT DATA =================
/**
 * Application Constants
 * 
 * Centralized constants for the STRA-System application
 * Ensures consistency across components and easy maintenance
 */

// Patient urgency levels for triage
export const URGENCY_LEVELS = {
  CRITICAL: {
    value: 'RED',
    label: 'Critical',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
    priority: 1
  },
  HIGH: {
    value: 'YELLOW',
    label: 'Urgent',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    priority: 2
  },
  MEDIUM: {
    value: 'GREEN',
    label: 'Non-Urgent',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    priority: 3
  }
};

// Patient queue status
export const QUEUE_STATUS = {
  WAITING: {
    value: 'WAITING',
    label: 'Waiting',
    color: 'text-gray-600',
    icon: 'Clock'
  },
  IN_PROGRESS: {
    value: 'IN_PROGRESS',
    label: 'In Progress',
    color: 'text-blue-600',
    icon: 'Activity'
  },
  COMPLETED: {
    value: 'COMPLETED',
    label: 'Completed',
    color: 'text-green-600',
    icon: 'CheckCircle'
  }
};

// User roles and their permissions
export const USER_ROLES = {
  NURSE: {
    value: 'nurse',
    label: 'Nurse',
    icon: '👨‍⚕️',
    permissions: ['triage', 'view_queue']
  },
  DOCTOR: {
    value: 'doctor',
    label: 'Doctor',
    icon: '👩‍⚕️',
    permissions: ['view_queue', 'doctor_portal', 'prescriptions', 'orders']
  },
  PHARMACY: {
    value: 'pharmacy',
    label: 'Pharmacy',
    icon: '💊',
    permissions: ['inventory', 'prescriptions']
  },
  ADMIN: {
    value: 'admin',
    label: 'Admin',
    icon: '💼',
    permissions: ['all'] // Admin has access to everything
  }
};

// Hospital departments
export const DEPARTMENTS = [
  'Emergency',
  'General Medicine',
  'Pediatrics',
  'Surgery',
  'ICU',
  'Cardiology',
  'Orthopedics',
  'Neurology',
  'Obstetrics & Gynecology',
  'Radiology'
];

// Resource status
export const RESOURCE_STATUS = {
  AVAILABLE: {
    value: 'AVAILABLE',
    label: 'Available',
    color: 'text-green-600'
  },
  OCCUPIED: {
    value: 'OCCUPIED',
    label: 'Occupied',
    color: 'text-red-600'
  },
  IN_USE: {
    value: 'IN_USE',
    label: 'In Use',
    color: 'text-blue-600'
  },
  CLEANING: {
    value: 'CLEANING',
    label: 'Cleaning',
    color: 'text-yellow-600'
  },
  MAINTENANCE: {
    value: 'MAINTENANCE',
    label: 'Maintenance',
    color: 'text-orange-600'
  }
};

// Inventory status levels
export const INVENTORY_STATUS = {
  NORMAL: {
    value: 'normal',
    label: 'Normal',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300'
  },
  LOW: {
    value: 'low',
    label: 'Low Stock',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300'
  },
  CRITICAL: {
    value: 'critical',
    label: 'Critical',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-300'
  }
};

// Medication categories
export const MEDICATION_CATEGORIES = [
  'Analgesics',
  'Antibiotics',
  'Antivirals',
  'NSAIDs',
  'Diabetes',
  'Cardiovascular',
  'Respiratory',
  'Psychiatric',
  'Vaccines',
  'Emergency Drugs',
  'Other'
];

// Prescription frequencies
export const PRESCRIPTION_FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
  'Before meals',
  'After meals',
  'At bedtime'
];

// Laboratory tests
export const LAB_TESTS = [
  'Complete Blood Count (CBC)',
  'Blood Glucose',
  'Lipid Panel',
  'Liver Function Test',
  'Kidney Function Test',
  'Thyroid Function Test',
  'Urinalysis',
  'Electrolytes Panel',
  'Coagulation Profile',
  'HIV Test',
  'Hepatitis Panel'
];

// Imaging tests
export const IMAGING_TESTS = [
  'Chest X-Ray',
  'Abdominal X-Ray',
  'CT Scan',
  'MRI',
  'Ultrasound',
  'Echocardiogram',
  'Mammogram',
  'Bone Density Scan'
];

// Form validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  POSTAL_CODE: /^[0-9]{5}(-[0-9]{4})?$/,
  NAME: /^[a-zA-Z\s'-]+$/,
  NUMBER: /^[0-9]+$/
};

// Date/Time formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  DATETIME: 'DD/MM/YYYY HH:mm'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT: 'Request timeout. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
  GENERIC: 'An error occurred. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  PATIENT_REGISTERED: 'Patient registered successfully!',
  DATA_SAVED: 'Data saved successfully!',
  ORDER_SUBMITTED: 'Order submitted successfully!',
  PRESCRIPTION_CREATED: 'Prescription created successfully!',
  STATUS_UPDATED: 'Status updated successfully!',
  INVENTORY_UPDATED: 'Inventory updated successfully!'
};

// Loading messages
export const LOADING_MESSAGES = {
  LOADING_DATA: 'Loading data...',
  SAVING: 'Saving...',
  SUBMITTING: 'Submitting...',
  PROCESSING: 'Processing...',
  PLEASE_WAIT: 'Please wait...'
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// API timeout
export const API_TIMEOUT = 30000; // 30 seconds

// Session timeout
export const SESSION_TIMEOUT = 3600000; // 1 hour in milliseconds

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  LANGUAGE: 'language'
};

const constants = {
  URGENCY_LEVELS,
  QUEUE_STATUS,
  USER_ROLES,
  DEPARTMENTS,
  RESOURCE_STATUS,
  INVENTORY_STATUS,
  MEDICATION_CATEGORIES,
  PRESCRIPTION_FREQUENCIES,
  LAB_TESTS,
  IMAGING_TESTS,
  VALIDATION_PATTERNS,
  DATE_FORMATS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  PAGINATION,
  API_TIMEOUT,
  SESSION_TIMEOUT,
  STORAGE_KEYS
};
export default constants;
