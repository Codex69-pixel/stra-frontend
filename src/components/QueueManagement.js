import React, { useState, useEffect } from 'react';
import { 
  Clock, Users, AlertCircle, CheckCircle, Filter, Search, 
  MoreVertical, Phone, AlertTriangle, 
  Eye, X
} from 'lucide-react';
import './QueueManagement.css';
import LoadingSpinner from './common/LoadingSpinner';
// import Papa from 'papaparse';
// import TablePagination from './common/TablePagination';


import apiService from '../services/api';

const urgencyConfig = {
  RED: {
    icon: AlertCircle,
    badge: 'bg-red-100 text-red-700 border-red-200',
    border: 'border-red-500',
    text: 'text-red-700'
  },
  YELLOW: {
    icon: AlertTriangle,
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    border: 'border-yellow-500',
    text: 'text-yellow-700'
  },
  GREEN: {
    icon: CheckCircle,
    badge: 'bg-green-100 text-green-700 border-green-200',
    border: 'border-green-500',
    text: 'text-green-700'
  }
};


const QueueManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page] = useState(1);
  const [sortKey] = useState('name');
  const [sortOrder] = useState('asc');
  const pageSize = 5;


  // Fetch departments and initial queue
  useEffect(() => {
    async function fetchDepartmentsAndQueue() {
      setLoading(true);

      try {
        // For demo, hardcode departments or fetch from backend if available
        const deptList = [
          { id: 'EMERGENCY', name: 'Emergency Room' },
          { id: 'CARDIOLOGY', name: 'Cardiology' },
          { id: 'NEUROLOGY', name: 'Neurology' },
          { id: 'ORTHOPEDICS', name: 'Orthopedics' },
        ];
        setDepartments(deptList);
        // Fetch queue for all departments (could be improved to fetch per department)
        let allPatients = [];
        for (const dept of deptList) {
          try {
            const queue = await apiService.getDepartmentQueue(dept.id);
            if (Array.isArray(queue)) {
              allPatients = allPatients.concat(queue.map(p => ({ ...p, department: dept.id })));
            }
          } catch (e) {
            // Ignore department fetch error
          }
        }
        setPatients(allPatients);
        setFilteredPatients(allPatients);
      } catch (err) {

      } finally {
        setLoading(false);
      }
    }
    fetchDepartmentsAndQueue();
  }, []);

  const getUrgencyConfig = (urgency) => {
    return urgencyConfig[urgency] || urgencyConfig.GREEN;
  };

  // Filter patients based on selected department, search term, and urgency
  useEffect(() => {
    let filtered = [...patients];
    if (selectedDept !== 'ALL') {
      filtered = filtered.filter(patient => patient.department === selectedDept);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(patient =>
        (patient.name && patient.name.toLowerCase().includes(term)) ||
        (patient.id && patient.id.toLowerCase().includes(term)) ||
        (patient.chief && patient.chief.toLowerCase().includes(term))
      );
    }
    if (urgencyFilter !== 'ALL') {
      filtered = filtered.filter(patient => patient.urgency === urgencyFilter);
    }
    setFilteredPatients(filtered);
  }, [selectedDept, searchTerm, urgencyFilter, patients]);

  const currentQueue = selectedDept === 'ALL'
    ? { patients }
    : { patients: patients.filter(p => p.department === selectedDept) };

  const handleResetFilters = () => {
    setSelectedDept('ALL');
    setSearchTerm('');
    setUrgencyFilter('ALL');
    setShowFilters(false);
  };

  // Example: Simulate loading on refresh
  const handleRefresh = async () => {
    setLoading(true);

    try {
      let allPatients = [];
      for (const dept of departments) {
        try {
          const queue = await apiService.getDepartmentQueue(dept.id);
          if (Array.isArray(queue)) {
            allPatients = allPatients.concat(queue.map(p => ({ ...p, department: dept.id })));
          }
        } catch (e) {}
      }
      setPatients(allPatients);
      setFilteredPatients(allPatients);
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  // const handleExportCSV = () => {
  //   const csv = Papa.unparse(filteredPatients.map(patient => ({
  //     Name: patient.name,
  //     Department: patient.department,
  //     Urgency: patient.urgency,
  //     Status: patient.status,
  //     'Arrival Time': patient.arrivalTime
  //   })));
  //   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.setAttribute('download', 'queue.csv');
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  const pagedPatients = sortedPatients.slice((page-1)*pageSize, page*pageSize);

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-teal-50/30 p-4 md:p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Patient Queue Management</h1>
            <p className="text-gray-600 mt-2">Monitor and manage patient queues in real-time</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              className="md:hidden p-2 bg-white rounded-lg border border-gray-200 shadow-sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              onClick={handleRefresh}
            >
              Refresh Queue
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Department Filter */}
          <div className={`lg:w-1/4 ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Departments
              </h3>
              
              <div className="space-y-2">
                <button
                  className={`w-full text-left p-3 rounded-xl transition-colors ${selectedDept === 'ALL' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent'}`}
                  onClick={() => setSelectedDept('ALL')}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">All Departments</span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {patients.length}
                    </span>
                  </div>
                </button>
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    className={`w-full text-left p-3 rounded-xl transition-colors ${selectedDept === dept.id ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent'}`}
                    onClick={() => setSelectedDept(dept.id)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{dept.name}</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {patients.filter(p => p.department === dept.id).length}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-medium text-gray-700">Critical</span>
                  </div>
                  <span className="text-red-700 font-bold">
                    {patients.filter(p => p.urgency === 'RED').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-gray-700">Moderate</span>
                  </div>
                  <span className="text-yellow-700 font-bold">
                    {patients.filter(p => p.urgency === 'YELLOW').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-gray-700">Stable</span>
                  </div>
                  <span className="text-green-700 font-bold">
                    {patients.filter(p => p.urgency === 'GREEN').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search patients by name, ID, or chief complaint..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button 
                    className="flex items-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                  </button>
                  
                  {(searchTerm || urgencyFilter !== 'ALL') && (
                    <button 
                      className="px-4 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                      onClick={handleResetFilters}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              
              {/* Additional Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3">Filter by Urgency</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-4 py-2 rounded-lg ${urgencyFilter === 'ALL' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      onClick={() => setUrgencyFilter('ALL')}
                    >
                      All
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg flex items-center ${urgencyFilter === 'RED' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      onClick={() => setUrgencyFilter('RED')}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Critical
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg flex items-center ${urgencyFilter === 'YELLOW' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      onClick={() => setUrgencyFilter('YELLOW')}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Moderate
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg flex items-center ${urgencyFilter === 'GREEN' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      onClick={() => setUrgencyFilter('GREEN')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Stable
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Queue Cards - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
              {pagedPatients && pagedPatients.length > 0 ? (
                pagedPatients.map((patient, idx) => {
                  const config = getUrgencyConfig(patient.urgency);
                  const Icon = config.icon;
                  return (
                    <div
                      key={patient.id}
                      className={`queue-card bg-white rounded-2xl border-l-4 ${config.border} shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden animate-fadeIn`}
                      style={{animationDelay: `${idx * 50}ms`}}
                    >
                      <div className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Position & Status */}
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl font-bold text-2xl shadow-md">
                              {patient.position}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900">{patient.name}</h3>
                              <p className="text-sm text-gray-600">{patient.id}</p>
                              <div className="flex items-center space-x-2 mt-2 text-xs text-gray-600">
                                <span>{patient.age} years</span>
                                <span>•</span>
                                <span>{patient.chief}</span>
                              </div>
                            </div>
                          </div>
                          {/* Urgency Badge */}
                          <div className={`${config.badge} px-4 py-2 rounded-full font-bold text-sm flex items-center space-x-2 shadow-md`}>
                            <Icon className="w-4 h-4" />
                            <span>{patient.urgency}</span>
                          </div>
                        </div>
                        {/* Status and Wait Time */}
                        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="font-semibold text-gray-900">Wait Time: {patient.waitTime} min</span>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            patient.status === 'IN_PROGRESS'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {patient.status === 'IN_PROGRESS' ? '🟢 Being Served' : '⏳ Waiting'}
                          </div>
                          {/* Action Buttons */}
                          <div className="ml-auto flex items-center space-x-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600 border border-blue-200" title="Call Patient">
                              <Phone className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-200">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No patients found</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search term</p>
                  <button 
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={handleResetFilters}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* Queue Statistics */}
            {currentQueue && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Queue Statistics - {selectedDept === 'ALL' ? 'All Departments' : departments.find(d => d.id === selectedDept)?.name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Waiting', value: currentQueue.patients.length, color: 'text-blue-600' },
                    { label: 'Critical Cases', value: currentQueue.patients.filter(p => p.urgency === 'RED').length, color: 'text-red-600' },
                    { label: 'Being Served', value: currentQueue.patients.filter(p => p.status === 'IN_PROGRESS').length, color: 'text-green-600' },
                    { label: 'Avg Wait (min)', value: currentQueue.patients.length > 0 ? Math.round(currentQueue.patients.reduce((sum, p) => sum + p.waitTime, 0) / currentQueue.patients.length) : 0, color: 'text-orange-600' }
                  ].map((stat, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading Spinner Example */}
        {loading && <LoadingSpinner text="Refreshing queue..." fullScreen />}
      </div>
    </div>
  );
};

export default QueueManagement;