import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const DoctorsPanelPage = ({ doctorId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`/api/doctor/${doctorId}/appointments`);
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const responseText = await response.text();
        console.log('Response text:', responseText);
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Error parsing JSON:', e);
          throw new Error('Invalid JSON response from server');
        }
    
        setAppointments(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  return (
    <div className="card w-full max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="card-header mb-4">
        <h2 className="card-title text-2xl font-bold">Your Appointments</h2>
      </div>
      <div className="card-content">
        {loading ? (
          <p>Loading appointments...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : appointments.length === 0 ? (
          <p>No appointments scheduled.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Patient Name</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Room Code</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b">
                    <td className="px-4 py-2">{appointment.patient_name}</td>
                    <td className="px-4 py-2">{format(new Date(appointment.appointment_date), 'PP')}</td>
                    <td className="px-4 py-2">{appointment.appointment_time}</td>
                    <td className="px-4 py-2">{appointment.room_code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsPanelPage;
