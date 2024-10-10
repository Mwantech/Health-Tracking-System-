import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DoctorsPanel.css';

const DoctorsPanelPage = ({ doctorId: propDoctorId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: urlDoctorId } = useParams();
  const navigate = useNavigate();

  const effectiveDoctorId = propDoctorId || urlDoctorId || localStorage.getItem('doctorId');

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!effectiveDoctorId) {
        setError('No doctor ID available. Please log in again.');
        setLoading(false);
        navigate('/admin-login');
        return;
      }

      const url = `http://localhost:3001/api/doctor/${effectiveDoctorId}/appointments`;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAppointments(response.data);
        setLoading(false);
      } catch (err) {
        console.error('DoctorsPanelPage: Fetch error:', err);
        setError('Failed to fetch appointments. Please try again later.');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [effectiveDoctorId, navigate]);

  if (loading) return <div className="doctors-panel">Loading...</div>;
  if (error) return <div className="doctors-panel">Error: {error}</div>;

  return (
    <div className="doctors-panel">
      <h1>Doctors Panel</h1>
      <h2>Your Appointments</h2>
      {appointments.length === 0 ? (
        <p className="no-appointments">No appointments scheduled.</p>
      ) : (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Patient</th>
              <th>Email</th>
              <th>Room Code</th>
              <th>Issues</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment, index) => (
              <tr key={index}>
                <td className="appointment-date">{appointment.date}</td>
                <td className="appointment-time">{appointment.time}</td>
                <td className="patient-name">{appointment.patientName}</td>
                <td className="patient-email">{appointment.userEmail}</td>
                <td className="room-code">{appointment.roomCode}</td>
                <td className="issues">{appointment.issues}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DoctorsPanelPage;