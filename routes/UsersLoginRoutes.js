const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function UsersLoginRoutes(connection) {
  const router = express.Router();

  // User Signup route
  router.post('/user/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
      // Check if user already exists
      const [existingUsers] = await connection.promise().query('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const [result] = await connection.promise().query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );

      res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // User Login route
  router.post('/user/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      // Find user by email
      const [users] = await connection.promise().query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const user = users[0];

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create and send token
      const token = jwt.sign({ id: user.id, type: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, type: 'user', id: user.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
}

module.exports = UsersLoginRoutes;