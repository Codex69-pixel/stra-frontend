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

export default {
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
