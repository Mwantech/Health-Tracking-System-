import React, { useState } from 'react';
import './telemedicine.css'; // Ensure this file is in the same directory or adjust the path as needed
import VideoCall from './videoroom';

const TelemedicineAppointment = () => {
  const [step, setStep] = useState(1);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [showVideoCall, setShowVideoCall] = useState(false);

  const healthIssues = ['Common Cold', 'Allergies', 'Skin Conditions', 'Mental Health', 'Chronic Disease Management'];
  
  const doctors = [
    { id: 1, name: 'Dr. Smith', speciality: 'General Practice', experience: '10 years', fee: 100 },
    { id: 2, name: 'Dr. Johnson', speciality: 'Dermatology', experience: '15 years', fee: 150 },
    { id: 3, name: 'Dr. Williams', speciality: 'Psychiatry', experience: '12 years', fee: 200 },
  ];

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
  };

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus(true);
      const generatedRoomCode = Math.random().toString(36).substring(7).toUpperCase();
      setRoomCode(generatedRoomCode);
      setStep(5);
    }, 2000);
  };

  const calculateTotalFee = () => {
    const baseFee = selectedDoctor ? selectedDoctor.fee : 0;
    const additionalCharges = 20; // Example additional charge
    return baseFee + additionalCharges;
  };

  const startVideoCall = () => {
    setShowVideoCall(true);
  };

  const renderStep = () => {
    if (showVideoCall) {
      return <VideoCall roomCode={roomCode} />;
    }

    switch(step) {
      case 1:
        return (
          <div className="card">
            <div className="card-header">
              <h2 className="text-2xl font-bold">Select Health Issues</h2>
            </div>
            <div className="card-content">
              {healthIssues.map(issue => (
                <button id="health-issues"
                  key={issue} 
                  onClick={() => handleIssueSelection(issue)}
                  className={`button ${selectedIssues.includes(issue) ? 'default' : 'outline'}`}
                >
                  {issue}
                </button>
              ))}
            </div>
            <div className="card-footer">
              <button id='next'
                onClick={() => setStep(2)} 
                disabled={selectedIssues.length === 0}
                className="button"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="card">
            <div className="card-header">
              <h2 className="text-2xl font-bold">Select a Doctor</h2>
            </div>
            <div className="card-content">
              {doctors.map(doctor => (
                <div key={doctor.id} className="card mb-4">
                  <div className="card-header">
                    <h3 className="text-xl font-semibold">{doctor.name}</h3>
                  </div>
                  <div className="card-content">
                    <p>Speciality: {doctor.speciality}</p>
                    <p>Experience: {doctor.experience}</p>
                    <p>Fee: ${doctor.fee}</p>
                  </div>
                  <div className="card-footer">
                    <button id='selection' onClick={() => handleDoctorSelection(doctor)} className="button">
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="card-footer">
              <button id='next'
                onClick={() => setStep(3)} 
                disabled={!selectedDoctor}
                className="button"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="card">
            <div className="card-header">
              <h2 className="text-2xl font-bold">Schedule Appointment</h2>
            </div>
            <div className="card-content">
              <div className="mb-4">
                <label htmlFor="date" className="label">Select Date</label>
                <input 
                  id="date" 
                  type="date" 
                  onChange={(e) => handleDateSelection(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="time" className="label">Select Time</label>
                <input 
                  id="time" 
                  type="time" 
                  onChange={(e) => handleTimeSelection(e.target.value)}
                  className="input"
                />
              </div>
            </div>
            <div className="card-footer">
              <button id='next'
                onClick={() => setStep(4)} 
                disabled={!appointmentDate || !appointmentTime}
                className="button"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="card">
            <div className="card-header">
              <h2 className="text-2xl font-bold">Payment</h2>
            </div>
            <div className="card-content">
              <p>Doctor's Fee: ${selectedDoctor.fee}</p>
              <p>Additional Charges: $20</p>
              <p className="font-bold">Total: ${calculateTotalFee()}</p>
              
              <div className="mt-4">
                <label className="label">Select Payment Method</label>
                <div className="radio-group" onChange={(e) => handlePaymentMethodSelection(e.target.value)}>
                  <div className="flex items-center space-x-2">
                    <input type="radio" value="paypal" id="paypal" name="payment-method" className="radio-group-item" />
                    <label htmlFor="paypal" className="label">PayPal</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" value="card" id="card" name="payment-method" className="radio-group-item" />
                    <label htmlFor="card" className="label">Credit/Debit Card</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" value="mpesa" id="mpesa" name="payment-method" className="radio-group-item" />
                    <label htmlFor="mpesa" className="label">M-Pesa</label>
                  </div>
                </div>
              </div>
              
              {paymentMethod && (
                <div className="mt-4">
                  {paymentMethod === 'paypal' && (
                    <>
                    <input placeholder="PayPal Email" className="input mb-2" />
                    <button id='paymentbtn' onClick={handlePayment} className="button w-full">
                      Pay with PayPal
                    </button>
                    </>
                  )}
                  {paymentMethod === 'card' && (
                    <>
                      <input placeholder="Card Number" className="input mb-2" />
                      <div className="flex space-x-2 mb-2">
                        <input placeholder="MM/YY" className="input w-1/2" />
                        <input placeholder="CVV" className="input w-1/2" />
                      </div>
                      <button id='paymentbtn' onClick={handlePayment} className="button w-full">
                        Pay with Card
                      </button>
                    </>
                  )}
                  {paymentMethod === 'mpesa' && (
                    <>
                      <input placeholder="M-Pesa Phone Number" className="input mb-2" />
                      <button id='paymentbtn' onClick={handlePayment} className="button w-full">
                        Pay with M-Pesa
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="card">
            <div className="card-header">
              <h2 className="text-2xl font-bold">Payment Successful!</h2>
            </div>
            <div className="card-content">
              <p>Your appointment is confirmed with Dr. {selectedDoctor.name}.</p>
              <p>Date: {appointmentDate}</p>
              <p>Time: {appointmentTime}</p>
              <p>Room Code: {roomCode}</p>
            </div>
            <div className="card-footer">
              <button id='vdcall' onClick={startVideoCall} className="button">
                Start Video Call
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="telemedicine-appointment">
      <h1 className="text-3xl font-bold">Telemedicine Appointment</h1>
      {renderStep()}
    </div>
  );
};

export default TelemedicineAppointment;
