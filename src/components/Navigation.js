/**
 * Navigation Component
 * 
 * Main navigation bar with role-based menu access
 * - Displays only menu items accessible to the current user's role
 * - Responsive design with mobile menu
 * - Shows user information and logout option
 * 
 * @param {string} currentScreen - Currently active screen
 * @param {Function} onNavigate - Navigation handler function
 * @param {object} user - Current user object with name and role
 * @param {Function} onLogout - Logout handler function
 */

import React, { useState } from 'react';
import NotificationButton from './common/NotificationButton';
import { Activity, Stethoscope, Users, LayoutDashboard, Package, BarChart3, LogOut, Menu, X } from 'lucide-react';

export function Navigation({ currentScreen, onNavigate, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define menu items with their access control
  // Admin has access to all modules, other roles have specific access
  const menuItems = [
    { 
      id: 'nurse', 
      label: 'Nurse Triage', 
      icon: Stethoscope, 
      roles: ['nurse', 'admin'],
      description: 'Patient registration and triage' 
    },
    { 
      id: 'queue', 
      label: 'Queue Management', 
      icon: Users, 
      roles: ['doctor', 'nurse', 'admin'],
      description: 'View patient queues' 
    },
    { 
      id: 'doctor', 
      label: 'Doctor Portal', 
      icon: Activity, 
      roles: ['doctor', 'admin'],
      description: 'Patient care and prescriptions' 
    },
    { 
      id: 'resources', 
      label: 'Resources', 
      icon: LayoutDashboard, 
      roles: ['admin'],
      description: 'Hospital resource management' 
    },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: Package, 
      roles: ['pharmacy', 'admin'],
      description: 'Medication inventory' 
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      roles: ['admin'],
      description: 'Performance metrics' 
    }
  ];

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <nav className="bg-gradient-to-r from-teal-600 to-teal-700 shadow-lg fixed w-full top-0 z-50 border-b border-teal-800">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 border border-white/30 rounded-xl flex items-center justify-center shadow-md">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white leading-tight">STRA-Health</span>
              <p className="text-xs text-teal-100 font-medium">Medical System</p>
            </div>
          </div>

          {/* Desktop Menu - Horizontal */}
          <div className="hidden lg:flex items-center gap-2">
            {visibleMenuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-white/60 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-md scale-105'
                      : 'text-teal-100 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.description}
                >
                  <IconComponent className="w-5 h-5 mr-1" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Notification Button & User Info (Desktop) */}
          <div className="hidden lg:flex items-center space-x-4">
            <NotificationButton onClick={() => alert('Notifications will appear here. (Backend integration pending)')} />
            <div className="flex items-center space-x-3 pl-3 border-l border-teal-300">
              <div className="w-8 h-8 bg-white/20 border border-white/30 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-white">{user?.name || 'User'}</span>
                <span className="text-xs text-teal-100 capitalize">{user?.role || 'Role'}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 text-red-100 hover:bg-red-50/10 rounded-lg transition-colors border-2 border-red-200 hover:border-red-300 font-medium"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-teal-200 pt-4 animate-slideDown">
            <div className="flex flex-col gap-2 mb-4">
              {visibleMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors text-base focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-md scale-105'
                        : 'text-teal-100 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    title={item.description}
                  >
                    <IconComponent className="w-5 h-5 mr-1" />
                    {item.label}
                  </button>
                );
              })}
            </div>
            {/* Mobile user info and logout */}
            <div className="border-t border-teal-200 pt-4 space-y-3">
              <div className="flex items-center space-x-3 px-4">
                <div className="w-8 h-8 bg-white/20 border border-white/30 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-white">{user?.name || 'User'}</span>
                  <span className="text-xs text-teal-100 capitalize">{user?.role || 'Role'}</span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-2 px-4 py-3 text-red-100 hover:bg-red-50/10 rounded-lg transition-colors border-2 border-red-200 font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Add animation styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
}