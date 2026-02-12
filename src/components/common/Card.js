/**
 * Card Component
 * 
 * Reusable card container for consistent layout
 */

import React from 'react';

export function Card({
  children,
  title = null,
  subtitle = null,
  headerAction = null,
  footer = null,
  padding = true,
  className = '',
  ...props
}) {
  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${className}`} {...props}>
      {/* Header */}
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {headerAction && (
              <div>{headerAction}</div>
            )}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
      
      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;
