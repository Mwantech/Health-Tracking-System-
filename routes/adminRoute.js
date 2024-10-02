const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

module.exports = (connection) => {
  const router = express.Router();

  // Middleware to check if the admin has permission to manage other admins
  const canManageAdmins = (req, res, next) => {
    if (!req.user.canManageAdmins) {
      return res.status(403).json({ error: 'You do not have permission to manage admins' });
    }
    next();
  };

  // Authenticate admin
  router.post('/authenticate', async (req, res) => {
    try {
      const { username, password } = req.body;
      const [rows] = await connection.promise().execute('SELECT * FROM admins WHERE username = ?', [username]);

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const admin = rows[0];
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: admin.id, canManageAdmins: admin.canManageAdmins === 1 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ token, canManageAdmins: admin.canManageAdmins === 1 });
    } catch (error) {
      console.error('Error authenticating admin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all admins
  router.get('/', authMiddleware, canManageAdmins, async (req, res) => {
    try {
      const [rows] = await connection.promise().execute('SELECT id, username, can_manage_admins FROM admins');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching admins:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Add a new admin
  router.post('/', authMiddleware, canManageAdmins, async (req, res) => {
    try {
      const { username, password } = req.body;
      const [existingAdmin] = await connection.promise().execute('SELECT id FROM admins WHERE username = ?', [username]);

      if (existingAdmin.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.promise().execute(
        'INSERT INTO admins (username, password, can_manage_admins) VALUES (?, ?, ?)',
        [username, hashedPassword, false]
      );

      res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
      console.error('Error adding admin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete an admin
  router.delete('/:id', authMiddleware, canManageAdmins, async (req, res) => {
    try {
      const adminId = req.params.id;
      const [result] = await connection.promise().execute('DELETE FROM admins WHERE id = ?', [adminId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
      console.error('Error deleting admin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};