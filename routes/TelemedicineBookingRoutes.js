const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config();

const sendEmail = async (to, subject, text) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('Email sending is not configured. Would send email with following details:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  try {
    await transporter.sendMail({ from: process.env.GMAIL_USER, to, subject, text });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw the error so it can be caught in the route handler
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
      let emailSent = false;
      try {
        await sendEmail(
          email,
          'Your Telemedicine Appointment Confirmation',
          `
          Your appointment has been confirmed.
          Patient Name: ${patientName}
          Doctor: ${doctor.name} (${doctor.specialization})
          Date: ${date}
          Time: ${time}
          Room Code: ${roomCode}
          Price: $${doctor.price}

          Please use this room code to join your video call at the scheduled time.
          `
        );
        emailSent = true;
        console.log('Appointment confirmation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Email sending failed, but we'll still create the appointment
      }

      res.json({ 
        success: true, 
        roomCode, 
        doctorName: doctor.name, 
        price: doctor.price,
        emailSent // Include whether the email was sent successfully in the response
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  return router;
};