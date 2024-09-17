const express = require('express');
const router = express.Router();

module.exports = (connection) => {
  // Get telemedicine pricing
  router.get('/telemedicine-pricing', (req, res) => {
    const query = 'SELECT * FROM telemedicine_pricing LIMIT 1';
    connection.query(query, (error, results) => {
      if (error) throw error;
      res.json(results[0] || {});
    });
  });

  // Update telemedicine pricing
  router.put('/telemedicine-pricing', (req, res) => {
    const { base_fee, additional_fee } = req.body;
    const query = 'UPDATE telemedicine_pricing SET base_fee = ?, additional_fee = ?';
    connection.query(query, [base_fee, additional_fee], (error, result) => {
      if (error) throw error;
      res.json({ message: 'Telemedicine pricing updated successfully' });
    });
  });

  return router;
};