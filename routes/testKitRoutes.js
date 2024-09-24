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
    const { name, price } = req.body;
    const query = 'INSERT INTO test_kits (name, price) VALUES (?, ?)';
    connection.query(query, [name, price], (error, result) => {
      if (error) throw error;
      res.status(201).json({ id: result.insertId, message: 'Test kit added successfully' });
    });
  });

  // Update a test kit
  router.put('/testkits/:id', (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    const query = 'UPDATE test_kits SET name = ?, price = ? WHERE id = ?';
    connection.query(query, [name, price, id], (error, result) => {
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
    
    // First, check if the test kit is referenced anywhere
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM (
        SELECT id FROM test_kits WHERE id = ?
        UNION ALL
        SELECT id FROM test_kits WHERE id = ?
        -- Add more UNION ALL clauses for other tables that reference test_kits
      ) as references_check
    `;
    
    connection.query(checkQuery, [id, id], (checkError, checkResults) => {
      if (checkError) {
        console.error('Error checking references:', checkError);
        return res.status(500).json({ message: 'Error checking test kit references' });
      }

      if (checkResults[0].count > 0) {
        // The test kit is referenced, so we can't delete it
        return res.status(409).json({ message: 'Cannot delete test kit as it is referenced by other records' });
      }

      // If no references found, proceed with deletion
      const deleteQuery = 'DELETE FROM test_kits WHERE id = ?';
      connection.query(deleteQuery, [id], (deleteError, deleteResult) => {
        if (deleteError) {
          console.error('Error deleting test kit:', deleteError);
          return res.status(500).json({ message: 'Error deleting test kit' });
        }
        if (deleteResult.affectedRows === 0) {
          return res.status(404).json({ message: 'Test kit not found' });
        }
        res.json({ message: 'Test kit deleted successfully' });
      });
    });
  });

  return router;
};