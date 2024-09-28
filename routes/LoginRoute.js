const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

// Assuming you have a database connection pool or client named 'db'
// const db = require('./your-db-connection');

router.post('/login', async (req, res) => {
  const { username, password, userType } = req.body;

  try {
    let user;
    if (userType === 'admin') {
      // Query admin table
      const query = 'SELECT * FROM admins WHERE username = $1';
      const result = await db.query(query, [username]);
      user = result.rows[0];

      if (user && user.password === password) {
        // Admin authenticated
        res.json({ success: true, userType: 'admin', token: 'admin123' });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else if (userType === 'doctor') {
      // Query doctors table
      const query = 'SELECT * FROM doctors WHERE username = $1';
      const result = await db.query(query, [username]);
      user = result.rows[0];

      if (user) {
        // Compare hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          // Doctor authenticated
          res.json({ success: true, userType: 'doctor', token: 'doctor123' });
        } else {
          res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Invalid user type' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;