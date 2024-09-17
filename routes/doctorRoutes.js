const express = require('express');
const router = express.Router();

module.exports = (connection) => {
  // Get all doctors
  router.get('/doctors', (req, res) => {
    const query = 'SELECT * FROM doctors';
    connection.query(query, (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  });

  // Add a new doctor
  router.post('/doctors', (req, res) => {
    const { name, specialization, contact, availability } = req.body;
    const query = 'INSERT INTO doctors (name, specialization, contact, availability) VALUES (?, ?, ?, ?)';
    connection.query(query, [name, specialization, contact, availability], (error, result) => {
      if (error) throw error;
      res.status(201).json({ id: result.insertId, message: 'Doctor added successfully' });
    });
  });

  // Update a doctor
  router.put('/doctors/:id', (req, res) => {
    const { id } = req.params;
    const { name, specialization, contact, availability } = req.body;
    const query = 'UPDATE doctors SET name = ?, specialization = ?, contact = ?, availability = ? WHERE id = ?';
    connection.query(query, [name, specialization, contact, availability, id], (error, result) => {
      if (error) throw error;
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Doctor not found' });
      } else {
        res.json({ message: 'Doctor updated successfully' });
      }
    });
  });

  // Delete a doctor
  router.delete('/doctors/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM doctors WHERE id = ?';
    connection.query(query, [id], (error, result) => {
      if (error) throw error;
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Doctor not found' });
      } else {
        res.json({ message: 'Doctor deleted successfully' });
      }
    });
  });

  return router;
};
