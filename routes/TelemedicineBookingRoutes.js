const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config();

const sendEmail = async (to, subject, text) => {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({ from: process.env.GMAIL_USER, to, subject, text });
  } else {
    console.log('Email sending is not configured. Would send email with following details:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
  }
};

module.exports = (connection) => {
  // Fetch all doctors
  router.get('/doctors', async (req, res) => {
    try {
      const [rows] = await connection.promise().query(
        'SELECT id, name, specialization, contact, availability, price, created_at FROM doctors'
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create a new appointment
  router.post('/appointments', async (req, res) => {
    const { issues, doctorId, date, time, email, patientName } = req.body;

    try {
      // Fetch doctor's information
      const [doctorRows] = await connection.promise().query(
        'SELECT name, specialization, price FROM doctors WHERE id = ?',
        [doctorId]
      );

      if (doctorRows.length === 0) {
        return res.status(404).json({ success: false, error: 'Doctor not found' });
      }

      const doctor = doctorRows[0];

      // Insert the appointment into the database
      const [result] = await connection.promise().query(
        'INSERT INTO appointments (issues, doctor_id, appointment_date, appointment_time, user_email, patient_name) VALUES (?, ?, ?, ?, ?, ?)',
        [JSON.stringify(issues), doctorId, date, time, email, patientName]
      );

      const appointmentId = result.insertId;
      const roomCode = Math.random().toString(36).substring(7).toUpperCase();

      // Update the appointment with the room code
      await connection.promise().query(
        'UPDATE appointments SET room_code = ? WHERE id = ?',
        [roomCode, appointmentId]
      );

      // Attempt to send email
      try {
        await sendEmail(
          email,
          'Your Telemedicine Appointment Confirmation',
          `
          Your appointment has been confirmed.
          Patient Name: ${patientName}
          Doctor: ${doctor.names} (${doctor.specialization})
          Date: ${date}
          Time: ${time}
          Room Code: ${roomCode}
          Price: $${doctor.price}

          Please use this room code to join your video call at the scheduled time.
          `
        );
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // We're not failing the request due to email error
      }

      res.json({ success: true, roomCode, doctorName: doctor.names, price: doctor.price });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // Login route
router.post('/api/login', async (req, res) => {
  const { username, password, userType } = req.body;

  try {
    let user;
    if (userType === 'admin') {
      // Admin login logic (assuming you have an admins table)
      [user] = await connection.promise().query(
        'SELECT * FROM admins WHERE username = ? AND password = ?',
        [username, password]
      );
    } else if (userType === 'doctor') {
      // Doctor login logic
      [user] = await connection.promise().query(
        'SELECT id, name, specialization FROM doctors WHERE name = ? AND password = ?',
        [username, password]
      );
    }

    if (user && user.length > 0) {
      const userData = user[0];
      const token = 'generated-token'; // In a real app, generate a proper JWT token here
      
      if (userType === 'doctor') {
        res.json({
          token,
          userType,
          username: userData.name,
          doctorId: userData.id // Ensure this is the numeric ID from the database
        });
      } else {
        res.json({
          token,
          userType,
          username: userData.username
        });
      }
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Updated Doctor Appointments Route
router.get('/doctor/:doctorId/appointments', async (req, res) => {
  console.log('Received request for doctor appointments');
  console.log('Request params:', req.params);

  let { doctorId } = req.params;

  if (!doctorId) {
    console.error('Doctor ID is missing in the request');
    return res.status(400).json({ error: 'Doctor ID is required' });
  }

  try {
    const numericDoctorId = parseInt(doctorId);
    if (isNaN(numericDoctorId)) {
      console.error('Invalid doctor ID provided:', doctorId);
      return res.status(400).json({ error: 'Invalid doctor ID' });
    }

    console.log('Executing database query for doctor ID:', numericDoctorId);
    const [rows] = await connection.promise().query(
      'SELECT doctor_id, patient_name, user_email, appointment_date, appointment_time, room_code, issues FROM appointments WHERE doctor_id = ? ORDER BY appointment_date, appointment_time',
      [numericDoctorId]
    );

    console.log(`Fetched ${rows.length} appointments for doctor ${numericDoctorId}`);
    
    const sanitizedAppointments = rows.map(appointment => ({
      doctorId: appointment.doctor_id,
      patientName: appointment.patient_name,
      userEmail: appointment.user_email,
      date: appointment.appointment_date.toISOString().split('T')[0],
      time: appointment.appointment_time,
      roomCode: appointment.room_code,
      issues: appointment.issues
    }));

    res.json(sanitizedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
  });
  
  return router;
};