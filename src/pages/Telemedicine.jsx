import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './telemedicine.css';

const TelemedicineAppointment = () => {
  const [step, setStep] = useState(1);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [email, setEmail] = useState('');
  const [patientName, setPatientName] = useState('');
  const [doctors, setDoctors] = useState([]);

  const healthIssues = ['Common Cold', 'Allergies', 'Skin Conditions', 'Mental Health', 'Chronic Disease Management'];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleIssueSelection = (issue) => {
    setSelectedIssues(prev => 
      prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]
    );
  };

  const handleDoctorSelection = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleDateSelection = (date) => {
    setAppointmentDate(date);
  };

  const handleTimeSelection = (time) => {
    setAppointmentTime(time);
  };

  const handlePaymentMethodSelection = (method) => {
    setPaymentMethod(method);
    setPaymentDetails('');
  };

  const handlePaymentDetailsChange = (details) => {
    setPaymentDetails(details);
  };

  const handlePayment = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/appointments', {
        issues: selectedIssues,
        doctorId: selectedDoctor.id,
        date: appointmentDate,
        time: appointmentTime,
        email: email,
        patientName: patientName,
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetails
      });

      if (response.data.success) {
        setPaymentStatus(true);
        setRoomCode(response.data.roomCode);
        setStep(5);
      } else {
        alert('Failed to create appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className='card'>
          <div className='card-content'>
            <div className='card-header'>
            <h2>Select Health Issues</h2>
            </div>
            {healthIssues.map(issue => (
              <button id="health-issues"
                key={issue} 
                onClick={() => handleIssueSelection(issue)}
              >
                {issue}
              </button>
            ))}
            <button id="next"
              onClick={() => setStep(2)} 
              disabled={selectedIssues.length === 0}
            >
              Next
            </button>
          </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>Select a Doctor</h2>
            {doctors.map(doctor => (
              <div key={doctor.id}>
                <h3>{doctor.name}</h3>
                <p>Specialization: {doctor.specialization}</p>
                <p>Contact: {doctor.contact}</p>
                <p>Availability: {doctor.availability}</p>
                <p>Price: ${doctor.price}</p>
                <button id="selection" onClick={() => handleDoctorSelection(doctor)}>
                  Select
                </button>
              </div>
            ))}
            <button id='next'
              onClick={() => setStep(3)} 
              disabled={!selectedDoctor}
            >
              Next
            </button>
          </div>
        );
      case 3:
        return (
          <div>
            <h2>Schedule Appointment</h2>
            <p>Doctor: {selectedDoctor.name}</p>
            <div>
              <label htmlFor="date">Select Date</label>
              <input 
                id="date" 
                type="date" 
                onChange={(e) => handleDateSelection(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="time">Select Time</label>
              <input 
                id="time" 
                type="time" 
                onChange={(e) => handleTimeSelection(e.target.value)}
              />
            </div>
            <button id='next'
              onClick={() => setStep(4)} 
              disabled={!appointmentDate || !appointmentTime}
            >
              Next
            </button>
          </div>
        );
      case 4:
        return (
          <div>
            <h2>Payment</h2>
            <p>Doctor: {selectedDoctor.name}</p>
            <p>Specialization: {selectedDoctor.specialization}</p>
            <p>Date: {appointmentDate}</p>
            <p>Time: {appointmentTime}</p>
            <p>Total: ${selectedDoctor.price}</p>
            
            <div>
              <label htmlFor="patientName">Patient Name</label>
              <input 
                type="text" 
                id="patientName"
                value={patientName} 
                onChange={(e) => setPatientName(e.target.value)} 
                placeholder="Enter patient name"
                required
              />
            </div>

            <div>
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <p>Select Payment Method</p>
              <label>
                <input 
                  type="radio" 
                  value="paypal" 
                  checked={paymentMethod === 'paypal'} 
                  onChange={() => handlePaymentMethodSelection('paypal')} 
                />
                PayPal
              </label>
              <label>
                <input 
                  type="radio" 
                  value="card" 
                  checked={paymentMethod === 'card'} 
                  onChange={() => handlePaymentMethodSelection('card')} 
                />
                Credit/Debit Card
              </label>
              <label>
                <input 
                  type="radio" 
                  value="mpesa" 
                  checked={paymentMethod === 'mpesa'} 
                  onChange={() => handlePaymentMethodSelection('mpesa')} 
                />
                M-Pesa
              </label>
            </div>
            
            {paymentMethod && (
              <div>
                <label htmlFor="paymentDetails">
                  {paymentMethod === 'paypal' ? 'PayPal Email' : 
                   paymentMethod === 'card' ? 'Card Number' : 
                   'M-Pesa Number'}
                </label>
                <input 
                  type="text" 
                  id="paymentDetails"
                  value={paymentDetails}
                  onChange={(e) => handlePaymentDetailsChange(e.target.value)}
                  placeholder={`Enter ${paymentMethod} details`}
                  required
                />
              </div>
            )}
            
            <button id='pay' onClick={handlePayment} disabled={!paymentDetails}>
              Pay ${selectedDoctor.price}
            </button>
          </div>
        );
      case 5:
        return (
          <div>
            <h2>Payment Successful!</h2>
            <p>Your appointment is confirmed with Dr. {selectedDoctor.names}.</p>
            <p>Specialization: {selectedDoctor.specialization}</p>
            <p>Date: {appointmentDate}</p>
            <p>Time: {appointmentTime}</p>
            <p>Room Code: {roomCode}</p>
            <p>A confirmation email has been sent to {email}.</p>
            <Link to={`/videoroom/${roomCode}`}>
              Start Video Call
            </Link>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="telemedicine-appointment">
      <h1>Telemedicine Appointment</h1>
      {renderStep()}
    </div>
  );
};

export default TelemedicineAppointment;