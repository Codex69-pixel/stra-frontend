import React, { useState, useEffect } from 'react';
import NotificationButton from './common/NotificationButton';
import { User, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { logout } from '../utils/logout';
import apiService from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';

export function ResourceDashboard({ onNavigate }) {
  const [view, setView] = useState('overview');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const [resources, setResources] = useState({ beds: { units: [] }, staff: { byRole: [] }, equipment: { byType: [] } });
  const [departments, setDepartments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [scheduleAlerts, setScheduleAlerts] = useState([]);


  useEffect(() => {
    async function fetchResourceDashboard() {
      setLoading(true);

      try {
        const data = await apiService.getResourceDashboard();
        setResources(data.resources || { beds: { units: [] }, staff: { byRole: [] }, equipment: { byType: [] } });
        setDepartments(data.departments || []);
        setSchedules(data.schedules || []);
        setScheduleAlerts(data.scheduleAlerts || []);
      } catch (err) {

      } finally {
        setLoading(false);
      }
    }
    fetchResourceDashboard();
  }, []);
  // ...existing code...



  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-teal-50/30 min-h-screen">
      {/* Quick navigation dropdown for modules */}
      {onNavigate && (
        <div style={{ padding: '24px 0 0 24px' }}>
          <select
            style={{ marginLeft: 0, padding: '6px 12px', borderRadius: 8, border: '1px solid #14b8a6', background: '#fff', color: '#0d9488', fontWeight: 600 }}
            onChange={e => onNavigate(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Go to module...</option>
            <option value="nurse">Nurse Triage</option>
            <option value="queue">Queue Management</option>
            <option value="doctor">Doctor Portal</option>
            <option value="inventory">Inventory</option>
            <option value="analytics">Analytics</option>
          </select>
        </div>
      )}
      {/* Top Bar with Responsive Go to Module */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        background: 'linear-gradient(to right, #14b8a6, #0d9488)',
        color: '#fff',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '0 24px',
        flexWrap: 'wrap',
        rowGap: 8
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'}}>
          <h1 style={{fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.01em', margin: 0}}>Hospital Resources</h1>
          {onNavigate && (
            <select
              className="module-select"
              style={{
                marginLeft: 0,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #fff',
                background: '#fff',
                color: '#0d9488',
                fontWeight: 600,
                minWidth: 160,
                fontSize: 15,
                outline: 'none',
                marginTop: 4
              }}
              onChange={e => onNavigate(e.target.value)}
              defaultValue=""
              aria-label="Navigate to module"
            >
              <option value="" disabled>Go to module...</option>
              <option value="nurse">Nurse Triage</option>
              <option value="queue">Queue Management</option>
              <option value="doctor">Doctor Portal</option>
              <option value="inventory">Inventory</option>
              <option value="analytics">Analytics</option>
            </select>
          )}
        </div>
        <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 12}}>
          {/* Notification Button */}
          <NotificationButton onClick={() => alert('Notifications will appear here. (Backend integration pending)')} />
          <button
            style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, marginLeft: 16}}
            onClick={() => setShowDropdown(prev => !prev)}
            aria-label="User menu"
          >
            <User size={28} />
          </button>
          {showDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              background: '#fff',
              color: '#222',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              minWidth: 180,
              zIndex: 100,
              padding: 8
            }}>
              <button
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: '#0d9488',
                  fontWeight: 600,
                  fontSize: 16,
                  padding: '8px 0',
                  cursor: 'pointer',
                  borderRadius: 4,
                  textAlign: 'left'
                }}
                onClick={() => setView('overview')}
              >
                Hospital Resources
              </button>
              <button
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: '#0d9488',
                  fontWeight: 600,
                  fontSize: 16,
                  padding: '8px 0',
                  cursor: 'pointer',
                  borderRadius: 4,
                  textAlign: 'left'
                }}
                onClick={() => logout()}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto" style={{paddingTop: '90px', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '24px'}}>
        {/* Alerts Section */}
        {scheduleAlerts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {scheduleAlerts.map(alert => {
              const severityColors = {
                high: 'bg-gradient-to-r from-red-50 to-red-50/50 border-red-200',
                medium: 'bg-gradient-to-r from-yellow-50 to-yellow-50/50 border-yellow-200',
                low: 'bg-gradient-to-r from-teal-50 to-teal-50/50 border-teal-200'
              };
              const iconColors = {
                high: 'text-red-600',
                medium: 'text-yellow-600',
                low: 'text-blue-600'
              };
              const Icon = alert.severity === 'high' ? AlertTriangle : AlertCircle;
              
              return (
                <div key={alert.id} className={`border-2 ${severityColors[alert.severity]} rounded-xl p-4`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-1 ${iconColors[alert.severity]}`} />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">{alert.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <span className="font-medium">{alert.dept}</span>
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">{alert.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b-2 border-gray-200">
          <div className="flex gap-4">
            {['overview', 'beds', 'staff', 'equipment'].map(tab => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`px-4 py-3 font-bold border-b-4 transition-all capitalize ${
                  view === tab
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {view === 'overview' && (
          <div className="space-y-6">
            {/* Department Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Department Status</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map(dept => (
                  <div key={dept.name} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-gray-900">{dept.name}</h3>
                      {dept.critical > 0 && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg">
                          {dept.critical} Critical
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Bed Occupancy</span>
                          <span className="font-bold text-gray-900">{dept.occupancy}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              dept.occupancy > 85 ? 'bg-red-500' : dept.occupancy > 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{width: `${dept.occupancy}%`}}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Staff On Duty</span>
                        <span className="font-bold text-gray-900">{dept.staff}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's Schedule</h2>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Shift</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Date</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Staff Assigned</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Occupancy Rate</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule, idx) => (
                        <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-lg text-sm font-medium">{schedule.shift}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-700 font-medium">{schedule.date}</td>
                          <td className="px-6 py-4 text-center font-bold text-gray-900">{schedule.staff}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-gray-900 font-bold">{schedule.occupancy}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-bold">
                              <CheckCircle className="w-4 h-4" />
                              Adequate
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Beds Tab */}
        {view === 'beds' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bed Management</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {resources.beds.units.map(unit => (
                <div key={unit.name} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">{unit.name}</h3>
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      unit.status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {unit.status === 'critical' ? 'Critical' : 'Optimal'}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mb-3">{unit.occupied}/{unit.total}</p>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        unit.status === 'critical' ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{width: `${(unit.occupied/unit.total)*100}%`}}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{unit.total - unit.occupied} beds available</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {view === 'staff' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Staff Management</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {resources.staff.byRole.map(role => (
                <div key={role.role} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-4">{role.role}</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Total Available</span>
                        <span className="font-bold">{role.available}/{role.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{width: `${(role.available/role.total)*100}%`}}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">On Duty Now</span>
                      <span className="font-bold text-blue-600">{role.onDuty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment Tab */}
        {view === 'equipment' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Equipment Status</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {resources.equipment.byType.map(equip => (
                <div key={equip.name} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">{equip.name}</h3>
                    <span className="text-lg font-bold text-purple-600">{equip.operational}/{equip.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                    <div 
                      className={`h-2.5 rounded-full transition-all ${
                        equip.maintenance > 0 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{width: `${(equip.operational/equip.total)*100}%`}}
                    ></div>
                  </div>
                  <div className="flex gap-2 text-sm">
                    {equip.maintenance > 0 && (
                      <span className="text-gray-600"><span className="font-bold text-orange-600">{equip.maintenance}</span> maintenance</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading Spinner Example */}
        {loading && <LoadingSpinner text="Updating resources..." fullScreen />}
      </div>
    </div>
  );
}