/**
 * Utility Helper Functions
 * 
 * Common utility functions used across the application
 * Includes validation, formatting, and data manipulation helpers
 */

import { VALIDATION_PATTERNS, DATE_FORMATS } from './constants';

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function validateEmail(email) {
  return VALIDATION_PATTERNS.EMAIL.test(email);
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export function validatePhone(phone) {
  return VALIDATION_PATTERNS.PHONE.test(phone);
}

/**
 * Validate name (letters, spaces, hyphens, apostrophes only)
 * @param {string} name - Name to validate
 * @returns {boolean}
 */
export function validateName(name) {
  return VALIDATION_PATTERNS.NAME.test(name) && name.trim().length > 0;
}

/**
 * Format date to display format (DD/MM/YYYY)
 * @param {Date|string} date - Date to format
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format time to HH:mm format
 * @param {Date|string} time - Time to format
 * @returns {string}
 */
export function formatTime(time) {
  if (!time) return '';
  
  const d = new Date(time);
  if (isNaN(d.getTime())) return '';
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

/**
 * Format datetime to DD/MM/YYYY HH:mm
 * @param {Date|string} datetime - Datetime to format
 * @returns {string}
 */
export function formatDateTime(datetime) {
  if (!datetime) return '';
  return `${formatDate(datetime)} ${formatTime(datetime)}`;
}

/**
 * Format currency (Kenyan Shillings)
 * @param {number} amount - Amount to format
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (isNaN(amount)) return 'KSh 0.00';
  return `KSh ${Number(amount).toLocaleString('en-KE', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Calculate age from date of birth
 * @param {string|Date} dob - Date of birth
 * @returns {number}
 */
export function calculateAge(dob) {
  if (!dob) return 0;
  
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return 0;
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Calculate BMI (Body Mass Index)
 * @param {number} weightKg - Weight in kilograms
 * @param {number} heightCm - Height in centimeters
 * @returns {number}
 */
export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm === 0) return 0;
  
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  
  return Math.round(bmi * 10) / 10; // Round to 1 decimal place
}

/**
 * Get BMI category
 * @param {number} bmi - BMI value
 * @returns {string}
 */
export function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Generate unique STRA patient ID
 * @returns {string}
 */
export function generatePatientId() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `STRA-${timestamp}${random}`;
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object}
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Sort array of objects by property
 * @param {Array} array - Array to sort
 * @param {string} property - Property to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array}
 */
export function sortByProperty(array, property, order = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
}

/**
 * Filter array by search term (searches multiple properties)
 * @param {Array} array - Array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} properties - Properties to search in
 * @returns {Array}
 */
export function filterBySearch(array, searchTerm, properties) {
  if (!searchTerm || searchTerm.trim() === '') return array;
  
  const term = searchTerm.toLowerCase();
  
  return array.filter(item => {
    return properties.some(prop => {
      const value = item[prop];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(term);
    });
  });
}

/**
 * Calculate wait time in minutes from timestamp
 * @param {Date|string} timestamp - Start timestamp
 * @returns {number}
 */
export function calculateWaitTime(timestamp) {
  if (!timestamp) return 0;
  
  const start = new Date(timestamp);
  if (isNaN(start.getTime())) return 0;
  
  const now = new Date();
  const diffMs = now - start;
  const diffMins = Math.floor(diffMs / 60000);
  
  return diffMins;
}

/**
 * Format wait time for display
 * @param {number} minutes - Wait time in minutes
 * @returns {string}
 */
export function formatWaitTime(minutes) {
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours}h ${mins}m`;
}

/**
 * Get urgency color classes based on urgency level
 * @param {string} urgency - Urgency level (RED, YELLOW, GREEN)
 * @returns {object}
 */
export function getUrgencyStyles(urgency) {
  const styles = {
    RED: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      badge: 'bg-red-500'
    },
    YELLOW: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300',
      badge: 'bg-yellow-500'
    },
    GREEN: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
      badge: 'bg-green-500'
    }
  };
  
  return styles[urgency] || styles.GREEN;
}

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Output filename
 */
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Build CSV content
  let csv = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csv += values.join(',') + '\n';
  });
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Handle API errors and return user-friendly message
 * @param {Error} error - Error object
 * @returns {string}
 */
export function handleAPIError(error) {
  if (!error) return 'An unknown error occurred';
  
  if (error.message) {
    // Check for specific error types
    if (error.message.includes('timeout')) {
      return 'Request timeout. Please check your connection and try again.';
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your internet connection.';
    }
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return 'Unauthorized. Please log in again.';
    }
    if (error.message.includes('403') || error.message.includes('forbidden')) {
      return 'You do not have permission to perform this action.';
    }
    if (error.message.includes('404')) {
      return 'Resource not found.';
    }
    if (error.message.includes('500')) {
      return 'Server error. Please try again later.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Check if user has permission for an action
 * @param {object} user - User object with role
 * @param {string} permission - Required permission
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user || !user.role) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Map roles to permissions
  const rolePermissions = {
    nurse: ['triage', 'view_queue'],
    doctor: ['view_queue', 'doctor_portal', 'prescriptions', 'orders'],
    pharmacy: ['inventory', 'prescriptions']
  };
  
  const userPermissions = rolePermissions[user.role] || [];
  return userPermissions.includes(permission);
}

export default {
  validateEmail,
  validatePhone,
  validateName,
  formatDate,
  formatTime,
  formatDateTime,
  formatCurrency,
  calculateAge,
  calculateBMI,
  getBMICategory,
  generatePatientId,
  truncateText,
  debounce,
  deepClone,
  isEmpty,
  sortByProperty,
  filterBySearch,
  calculateWaitTime,
  formatWaitTime,
  getUrgencyStyles,
  exportToCSV,
  handleAPIError,
  sanitizeInput,
  hasPermission
};
