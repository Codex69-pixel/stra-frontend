/**
 * Sidebar Component
 * 
 * Modern slide-out sidebar menu for navigation
 * - Mobile-responsive design
 * - Shows user information at the top
 * - Role-based menu items
 * - Smooth animations and transitions
 * 
 * @param {boolean} isOpen - Whether sidebar is open
 * @param {Function} onClose - Function to close sidebar
 * @param {string} currentScreen - Currently active screen
 * @param {Function} onNavigate - Navigation handler function
 * @param {object} user - Current user object with name and role
 * @param {Function} onLogout - Logout handler function
 */

import React from 'react';
import { 
  X, 
  Stethoscope, 
  Users, 
  Activity, 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  LogOut,
  Home,
  ChevronRight
} from 'lucide-react';

export function Sidebar({ isOpen, onClose, currentScreen, onNavigate, user, onLogout }) {
  // Define menu items with their access control
  const menuItems = [
    {
      id: 'admin-dashboard',
      label: 'Admin Dashboard',
      icon: LayoutDashboard,
      roles: ['admin'],
      color: 'text-purple-200',
      bgColor: 'bg-white/10'
    },
    { 
      id: 'nurse', 
      label: 'Nurse Triage', 
      icon: Stethoscope, 
      roles: ['nurse', 'admin'],
      color: 'text-teal-200',
      bgColor: 'bg-white/10'
    },
    { 
      id: 'queue', 
      label: 'Queue Management', 
      icon: Users, 
      roles: ['doctor', 'nurse', 'admin'],
      color: 'text-teal-200',
      bgColor: 'bg-white/10'
    },
    { 
      id: 'doctor', 
      label: 'Doctor Portal', 
      icon: Activity, 
      roles: ['doctor', 'admin'],
      color: 'text-purple-200',
      bgColor: 'bg-white/10'
    },
    { 
      id: 'resources', 
      label: 'Resources', 
      icon: LayoutDashboard, 
      roles: ['admin'],
      color: 'text-indigo-200',
      bgColor: 'bg-white/10'
    },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: Package, 
      roles: ['pharmacy', 'admin'],
      color: 'text-green-200',
      bgColor: 'bg-white/10'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      roles: ['admin'],
      color: 'text-orange-200',
      bgColor: 'bg-white/10'
    }
  ];

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  const handleNavigate = (screenId) => {
    onNavigate(screenId);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  // Get user role badge color
  const getRoleBadgeColor = () => {
    switch(user?.role) {
      case 'doctor': return 'bg-teal-700 text-white';
      case 'nurse': return 'bg-teal-700 text-white';
      case 'pharmacy': return 'bg-green-700 text-white';
      case 'admin': return 'bg-purple-700 text-white';
      default: return 'bg-gray-700 text-white';
    }
  };

  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={onClose}
          style={{
            top: '4rem'
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 bg-gradient-to-br from-teal-700 to-teal-900 shadow-2xl z-40 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '280px',
          height: 'calc(100vh - 4rem)',
          top: '4rem'
        }}
      >
        {/* Header Section with User Info */}
        <div className="relative p-6 flex-shrink-0 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-lg transition-colors z-10"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          {/* User Info */}
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-14 h-14 bg-white/20 border border-white/30 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-base truncate">{user?.name || 'User'}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor()}`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-white/90 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Online</span>
            </div>
          </div>
        </div>
        {/* Navigation Menu - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ minHeight: 0 }}>
          <nav className="p-4 space-y-1">
            <div className="text-xs font-semibold text-teal-200 uppercase tracking-wider px-3 py-2">
              Main Menu
            </div>
            {visibleMenuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full group relative flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg scale-105'
                      : 'text-teal-100 hover:bg-white/10 hover:scale-102'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/30' : item.bgColor}`}>
                    <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} strokeWidth={2} />
                  </div>
                  <span className="font-semibold text-sm flex-1 text-left">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
          {/* Quick Stats or Info Section */}
          <div className="mx-4 my-4 p-4 bg-white/10 rounded-xl border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <Home className="w-4 h-4 text-teal-200" />
              <span className="text-xs font-semibold text-white">Today's Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/20 rounded-lg p-2">
                <div className="text-lg font-bold text-white">24</div>
                <div className="text-xs text-teal-100">Patients</div>
              </div>
              <div className="bg-white/20 rounded-lg p-2">
                <div className="text-lg font-bold text-white">12</div>
                <div className="text-xs text-teal-100">Pending</div>
              </div>
            </div>
          </div>
        </div>
        {/* Logout Section - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-white/20 bg-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-red-200 hover:bg-red-50/10 transition-all duration-200 font-semibold border-2 border-red-200 hover:border-red-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
