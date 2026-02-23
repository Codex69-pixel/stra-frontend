import React, { useEffect, useState } from "react";
import apiService from "../services/api";

export default function AppointmentPatientManagement() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const apptData = await apiService.getAppointments();
        setAppointments(apptData);
        const patientData = await apiService.getPatients();
        setPatients(patientData);
      } catch (err) {
        setError("Failed to load appointments or patients");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading appointments and patients...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Appointment Management</h1>
        <table className="min-w-full bg-white rounded-xl shadow overflow-hidden mb-8">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Patient</th>
              <th className="px-4 py-2 text-left">Doctor</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id} className="border-t">
                <td className="px-4 py-2">{appt.date}</td>
                <td className="px-4 py-2">{appt.patientName}</td>
                <td className="px-4 py-2">{appt.doctorName}</td>
                <td className="px-4 py-2">{appt.status}</td>
                <td className="px-4 py-2 flex flex-wrap gap-2">
                  <button className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Check-in ' + appt.id)}>Check-in</button>
                  <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Check-out ' + appt.id)}>Check-out</button>
                  <button className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Mark no-show ' + appt.id)}>No-show</button>
                  <button className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Cancel ' + appt.id)}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-4">Patient Management</h1>
        <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-t">
                <td className="px-4 py-2">{patient.name}</td>
                <td className="px-4 py-2">{patient.status}</td>
                <td className="px-4 py-2 flex flex-wrap gap-2">
                  <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Update status for ' + patient.id)}>Update Status</button>
                  <button className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('View history for ' + patient.id)}>History</button>
                  <button className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Delete patient ' + patient.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
