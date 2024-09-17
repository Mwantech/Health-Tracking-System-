const express = require('express');
const router = express.Router();

module.exports = (connection) => {
  // Get all health issues
  router.get('/health-issues', (req, res) => {
    const query = 'SELECT * FROM health_issues';
    connection.query(query, (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  });

  // Add a new health issue
  router.post('/health-issues', (req, res) => {
    const { name, description, symptoms } = req.body;
    const query = 'INSERT INTO health_issues (name, description, symptoms) VALUES (?, ?, ?)';
    connection.query(query, [name, description, symptoms], (error, result) => {
      if (error) throw error;
      res.status(201).json({ id: result.insertId, message: 'Health issue added successfully' });
    });
  });

  // Update a health issue
  router.put('/health-issues/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, symptoms } = req.body;
    const query = 'UPDATE health_issues SET name = ?, description = ?, symptoms = ? WHERE id = ?';
    connection.query(query, [name, description, symptoms, id], (error, result) => {
      if (error) throw error;
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Health issue not found' });
      } else {
        res.json({ message: 'Health issue updated successfully' });
      }
    });
  });

  // Delete a health issue
  router.delete('/health-issues/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM health_issues WHERE id = ?';
    connection.query(query, [id], (error, result) => {
      if (error) throw error;
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Health issue not found' });
      } else {
        res.json({ message: 'Health issue deleted successfully' });
      }
    });
  });

  return router;
};
