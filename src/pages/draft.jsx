import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorsPanelPage = ({ doctorId: propDoctorId }) => {
  // ... other code remains the same ...
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: urlDoctorId } = useParams();
  const navigate = useNavigate();

  const effectiveDoctorId = propDoctorId || urlDoctorId || localStorage.getItem('doctorId');


  useEffect(() => {
    // ... other code remains the same ...
    console.log('DoctorsPanelPage: Component mounted');
    console.log('propDoctorId:', propDoctorId);
    console.log('urlDoctorId:', urlDoctorId);
    console.log('localStorage doctorId:', localStorage.getItem('doctorId'));
    console.log('DoctorsPanelPage: Effective doctorId:', effectiveDoctorId);

    const fetchAppointments = async () => {
      if (!effectiveDoctorId) {
        // ... error handling ...
          console.error('DoctorsPanelPage: No doctorId available');
          setError('No doctor ID available. Please log in again.');
          setLoading(false);
          navigate('/admin-login');
          return;
      }

      const url = `http://localhost:3001/api/doctor/${effectiveDoctorId}/appointments`;
      console.log('DoctorsPanelPage: Fetching appointments from:', url);

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
        console.log('DoctorsPanelPage: Response data:', response.data);
        setAppointments(response.data);
        setLoading(false);
      } catch (err) {
        // ... error handling ...
        console.error('DoctorsPanelPage: Fetch error:', err);
        console.error('Error details:', err.response ? err.response.data : 'No response data');
        if (err.response && err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
          navigate('/admin-login');
        } else {
          setError(`Failed to fetch appointments. ${err.message}`);
        }
        setLoading(false);
      }
    };

    // ... rest of the code ...
    if (effectiveDoctorId) {
      fetchAppointments();
    } else {
      console.log('DoctorsPanelPage: No doctorId available, redirecting to login');
      navigate('/admin-login');
    }
  }, [effectiveDoctorId, navigate, propDoctorId, urlDoctorId]);

  // ... rest of the component ...
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Doctors Panel</h1>
      <h2>Appointments for Doctor ID: {effectiveDoctorId}</h2>
      {appointments.length === 0 ? (
        <p>No appointments scheduled.</p>
      ) : (
        <ul>
          {appointments.map((appointment, index) => (
            <li key={index}>
              <p>Patient: {appointment.patientName}</p>
              <p>Email: {appointment.userEmail}</p>
              <p>Date: {appointment.date}</p>
              <p>Time: {appointment.time}</p>
              <p>Room: {appointment.roomCode}</p>
              <p>Issues: {appointment.issues}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DoctorsPanelPage;