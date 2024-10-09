import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorsPanelPage = ({ doctorId: propDoctorId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: urlDoctorId } = useParams();
  const navigate = useNavigate();

  const effectiveDoctorId = propDoctorId || urlDoctorId || localStorage.getItem('doctorId');

  useEffect(() => {
    console.log('DoctorsPanelPage: Effective doctorId:', effectiveDoctorId);
    
    const fetchAppointments = async () => {
      if (!effectiveDoctorId) {
        console.error('DoctorsPanelPage: No doctorId available');
        setError('No doctor ID available. Please log in again.');
        setLoading(false);
        navigate('/admin-login');
        return;
      }

      const url = `http://localhost:3001/doctor/${effectiveDoctorId}/appointments`;
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
        console.error('DoctorsPanelPage: Fetch error:', err);
        if (err.response && err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
          navigate('/admin-login');
        } else {
          setError('Failed to fetch appointments. Please try again later.');
        }
        setLoading(false);
      }
    };

    if (effectiveDoctorId) {
      fetchAppointments();
    } else {
      console.log('DoctorsPanelPage: No doctorId available, redirecting to login');
      navigate('/admin-login');
    }
  }, [effectiveDoctorId, navigate]);
  return (
    <div>
      <h1>Doctor's Panel</h1>
      <h2>Appointments</h2>
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