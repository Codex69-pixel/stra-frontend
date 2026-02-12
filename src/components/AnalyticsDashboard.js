
import React, { useState, useEffect } from 'react';
import NotificationButton from './common/NotificationButton';
import { BarChart3, Users, Clock, TrendingUp, Download, Calendar } from 'lucide-react';
import LoadingSpinner from './common/LoadingSpinner';
// import Papa from 'papaparse';
import apiService from '../services/api';





function AnalyticsDashboard({ onNavigate }) {
    // CSV export handler (dummy, since Papa is not used)
    const handleExportCSV = () => {
      // Placeholder: implement CSV export if needed
      alert('CSV export not implemented.');
    };
  const [timeframe, setTimeframe] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    patientVolume: {},
    avgWaitTimes: {},
    departmentStats: [],
    resourceUtilization: {},
    monthlyTrend: []
  });

  // Wait time cards array
  const waitTimeCards = [
    { label: 'Critical (RED)', value: analytics.avgWaitTimes?.red, unit: 'min', color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' },
    { label: 'Urgent (YELLOW)', value: analytics.avgWaitTimes?.yellow, unit: 'min', color: 'text-yellow-600', bg: 'bg-yellow-50', bar: 'bg-yellow-500' },
    { label: 'Non-Urgent (GREEN)', value: analytics.avgWaitTimes?.green, unit: 'min', color: 'text-green-600', bg: 'bg-green-50', bar: 'bg-green-500' },
    { label: 'Overall Average', value: analytics.avgWaitTimes?.overall, unit: 'min', color: 'text-teal-600', bg: 'bg-teal-50', bar: 'bg-teal-500' }
  ];
  // Resource utilization cards array
  const resourceUtilizationCards = [
    { label: 'Bed Occupancy', value: analytics.resourceUtilization?.beds, icon: '🛏️', color: 'from-teal-500 to-teal-600' },
    { label: 'Staff Utilization', value: analytics.resourceUtilization?.staff, icon: '👥', color: 'from-purple-500 to-purple-600' },
    { label: 'Equipment Usage', value: analytics.resourceUtilization?.equipment, icon: '⚙️', color: 'from-green-500 to-green-600' }
  ];

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const data = await apiService.getAnalytics();
        setAnalytics(data || {});
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);
  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-teal-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto h-full">
        {/* Navigation Dropdown */}
        {onNavigate && (
          <div style={{ margin: '24px 0' }}>
            <select
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #14b8a6', background: '#fff', color: '#0d9488', fontWeight: 600 }}
              onChange={e => onNavigate(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Go to module...</option>
              <option value="nurse">Nurse Triage</option>
              <option value="queue">Queue Management</option>
              <option value="doctor">Doctor Portal</option>
              <option value="resources">Resource Dashboard</option>
              <option value="inventory">Inventory</option>
            </select>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fadeIn">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Hospital performance metrics and insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <NotificationButton onClick={() => alert('Notifications will appear here. (Backend integration pending)')} />
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
              <Calendar className="w-4 h-4 text-teal-600" />
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="text-sm font-medium text-gray-700 bg-transparent outline-none"
              >
                <option value="daily">Today</option>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors" onClick={handleExportCSV}>
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Patient Volume Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2 text-teal-600" />
            Patient Volume
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Today', value: analytics.patientVolume?.daily, icon: '📊' },
              { label: 'This Week', value: analytics.patientVolume?.weekly, icon: '📈' },
              { label: 'This Month', value: analytics.patientVolume?.monthly, icon: '📉' },
              { label: 'Growth', value: analytics.patientVolume?.trend, icon: '⬆️' }
            ].map((stat, idx) => (
              <div key={idx} className="stat-card animate-fadeIn" style={{animationDelay: `${idx * 50}ms`}}>
                <p className="text-sm text-gray-600 font-medium mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <span className="text-xs text-green-600 font-semibold mt-2">patients</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wait Times Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-orange-600" />
            Average Wait Times by Urgency
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {waitTimeCards.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl ${item.bg} border border-gray-200`}>
                  <p className="text-xs text-gray-600 font-medium mb-2">{item.label}</p>
                  <p className={`text-3xl font-bold ${item.color} mb-2`}>{item.value}</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.bar}`}
                      style={{width: `${(item.value / 60) * 100}%`}}
                    ></div>
                  </div>
                  <p className="text-gray-600 mt-2">{item.unit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
            Department Performance
          </h2>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Patients</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Avg Wait</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Satisfaction</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(analytics.departmentStats || []).map((dept, idx) => (
                    <tr 
                      key={idx} 
                      className="hover:bg-teal-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{dept.dept}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{dept.patients}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span className="text-gray-700">{dept.avgWait} min</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-400 to-green-600"
                              style={{width: `${dept.satisfaction}%`}}
                            ></div>
                          </div>
                          <span className="font-semibold text-gray-900">{dept.satisfaction}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
                          dept.trend && dept.trend.startsWith('+') 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {dept.trend && dept.trend.startsWith('+') ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                          <span>{dept.trend}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Resource Utilization */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Resource Utilization</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {resourceUtilizationCards.map((resource, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 animate-fadeIn" style={{animationDelay: `${idx * 50}ms`}}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{resource.label}</h3>
                  <span className="text-3xl">{resource.icon}</span>
                </div>
                <div className="mb-4">
                  <div className="text-4xl font-bold text-gray-900">{resource.value}%</div>
                  <p className="text-sm text-gray-600 mt-1">utilization rate</p>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${resource.color}`}
                    style={{width: `${resource.value}%`}}
                  ></div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {resource.value > 80 && (
                    <p className="text-sm text-amber-600 font-semibold">⚠️ High utilization - consider expansion</p>
                  )}
                  {resource.value <= 80 && (
                    <p className="text-sm text-green-600 font-semibold">✅ Optimal utilization levels</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Monthly Trend</h2>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(analytics.monthlyTrend || []).map((month, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-sm font-semibold text-gray-600 mb-4">{month.month}</p>
                  <div className="flex items-end justify-center space-x-2 h-40 mb-4">
                    {[
                      { value: month.patients, color: 'bg-teal-500', label: 'Total' },
                      { value: month.completed, color: 'bg-green-500', label: 'Completed' },
                      { value: month.pending, color: 'bg-orange-500', label: 'Pending' }
                    ].map((bar, barIdx) => (
                      <div key={barIdx} className="flex flex-col items-center">
                        <div 
                          className={`w-8 rounded-t-lg ${bar.color} transition-all hover:opacity-80`}
                          style={{height: `${(bar.value / Math.max(month.patients, month.completed) * 100)}%`}}
                          title={`${bar.label}: ${bar.value}`}
                        ></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center space-x-3 text-xs">
                    <span className="flex items-center"><span className="w-2 h-2 bg-teal-500 rounded-full mr-1"></span>Total</span>
                    <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>Completed</span>
                    <span className="flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-1"></span>Pending</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Spinner Example */}
        {loading && <LoadingSpinner text="Loading analytics..." fullScreen />}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
export { AnalyticsDashboard };
