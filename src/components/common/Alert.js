/**
 * Alert Component
 * 
 * Display success, error, warning, or info messages
 */

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export function Alert({ 
  type = 'info', 
  title = null, 
  message, 
  onClose = null,
  className = '' 
}) {
  const types = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle,
      iconColor: 'text-red-600'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600'
    },
    info: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-800',
      icon: Info,
      iconColor: 'text-teal-600'
    }
  };
  
  const config = types[type] || types.info;
  const Icon = config.icon;
  
  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <Icon className={`w-6 h-6 ${config.iconColor} mr-3 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${config.text} mb-1`}>{title}</h4>
          )}
          <p className={`${config.text} text-sm`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${config.iconColor} hover:opacity-75 ml-3 flex-shrink-0`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Alert;
