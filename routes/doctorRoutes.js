const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

module.exports = (connection) => {
  // Get all doctors
  router.get('/doctors', (req, res) => {
    const query = 'SELECT id, name, specialization, contact, availability, price FROM doctors';
    connection.query(query, (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  });

  // Add a new doctor
  router.post('/doctors', async (req, res) => {
    const { name, specialization, contact, availability, price, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = 'INSERT INTO doctors (name, specialization, contact, availability, price, password) VALUES (?, ?, ?, ?, ?, ?)';
      connection.query(query, [name, specialization, contact, availability, price, hashedPassword], (error, result) => {
        if (error) throw error;
        res.status(201).json({ id: result.insertId, message: 'Doctor added successfully' });
      });
    } catch (error) {
      console.error('Error adding doctor:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update a doctor
  router.put('/doctors/:id', async (req, res) => {
    const { id } = req.params;
    const { name, specialization, contact, availability, price, password } = req.body;
    try {
      let query, params;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query = 'UPDATE doctors SET name = ?, specialization = ?, contact = ?, availability = ?, price = ?, password = ? WHERE id = ?';
        params = [name, specialization, contact, availability, price, hashedPassword, id];
      } else {
        query = 'UPDATE doctors SET name = ?, specialization = ?, contact = ?, availability = ?, price = ? WHERE id = ?';
        params = [name, specialization, contact, availability, price, id];
      }
      connection.query(query, params, (error, result) => {
        if (error) throw error;
        if (result.affectedRows === 0) {
          res.status(404).json({ message: 'Doctor not found' });
        } else {
          res.json({ message: 'Doctor updated successfully' });
        }
      });
    } catch (error) {
      console.error('Error updating doctor:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
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