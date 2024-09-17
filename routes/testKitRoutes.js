const express = require('express');
const router = express.Router();

module.exports = (connection) => {
  // Get all test kits
  router.get('/testkits', (req, res) => {
    connection.query('SELECT * FROM test_kits', (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  });

  // Add a new test kit
  router.post('/testkits', (req, res) => {
    const { name, description, price } = req.body;
    const query = 'INSERT INTO test_kits (name,price) VALUES (?, ?)';
    connection.query(query, [name, description, price], (error, result) => {
      if (error) throw error;
      res.status(201).json({ id: result.insertId, message: 'Test kit added successfully' });
    });
  });

  // Update a test kit
  router.put('/testkits/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;
    const query = 'UPDATE test_kits SET name = ?, price = ? WHERE id = ?';
    connection.query(query, [name, description, price, id], (error, result) => {
      if (error) throw error;
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Test kit not found' });
      } else {
        res.json({ message: 'Test kit updated successfully' });
      }
    });
  });

  // Delete a test kit
  router.delete('/testkits/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM test_kits WHERE id = ?';
    connection.query(query, [id], (error, result) => {
      if (error) throw error;
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Test kit not found' });
      } else {
        res.json({ message: 'Test kit deleted successfully' });
      }
    });
  });

  return router;
};
