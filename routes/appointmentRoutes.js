const express = require('express');
const router = express.Router();

module.exports = (connection) => {
  // Fetch appointments for a specific doctor
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

      res.json({ 
        success: true, 
        roomCode, 
        doctorName: doctor.name, 
        specialization: doctor.specialization,
        price: doctor.price 
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // Get a specific appointment
  router.get('/appointments/:appointmentId', async (req, res) => {
    const { appointmentId } = req.params;

    try {
      const [rows] = await connection.promise().query(
        'SELECT * FROM appointments WHERE id = ?',
        [appointmentId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update an appointment
  router.put('/appointments/:appointmentId', async (req, res) => {
    const { appointmentId } = req.params;
    const { date, time, status } = req.body;

    try {
      await connection.promise().query(
        'UPDATE appointments SET appointment_date = ?, appointment_time = ?, status = ? WHERE id = ?',
        [date, time, status, appointmentId]
      );

      res.json({ success: true, message: 'Appointment updated successfully' });
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // Delete an appointment
  router.delete('/appointments/:appointmentId', async (req, res) => {
    const { appointmentId } = req.params;

    try {
      await connection.promise().query(
        'DELETE FROM appointments WHERE id = ?',
        [appointmentId]
      );

      res.json({ success: true, message: 'Appointment deleted successfully' });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  return router;
};