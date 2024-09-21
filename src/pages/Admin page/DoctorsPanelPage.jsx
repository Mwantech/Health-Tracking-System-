import React, { useState, useEffect } from 'react';
import axios from 'axios';


const DoctorsPanelPage = ({ doctorId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/doctor/${doctorId}/appointments`);
        
        // Check if the response data is an array
        if (Array.isArray(response.data)) {
          setAppointments(response.data);
        } else {
          // If it's not an array, set it to an empty array and log an error
          console.error('API did not return an array:', response.data);
          setAppointments([]);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to fetch appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="doctors-panel">
      <h2>Doctor's Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments scheduled.</p>
      ) : (
        <ul>
          {appointments.map((appointment, index) => (
            <li key={index}>
              <p><strong>Patient:</strong> {appointment.patientName}</p>
              <p><strong>Date:</strong> {appointment.date}</p>
              <p><strong>Time:</strong> {appointment.time}</p>
              <p><strong>Room Code:</strong> {appointment.roomCode}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DoctorsPanelPage;