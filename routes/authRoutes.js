const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware'); // Adjust the path as needed

module.exports = (connection) => {
  const router = express.Router();
// Login route
router.post('/login', async (req, res) => {
  // ... (rest of the login route code remains the same)
  const { username, password } = req.body;

    try {
      const [rows] = await connection.promise().query(
        'SELECT * FROM admins WHERE username = ?',
        [username]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = rows[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          canManageAdmins: user.can_manage_admins === 1
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ 
        token, 
        user: {
          id: user.id,
          username: user.username,
          canManageAdmins: user.can_manage_admins === 1
        }
      });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
});
  // Get current user info
  router.get('/me', authMiddleware, (req, res) => {
    res.json({
      user: {
        id: req.user.userId,
        username: req.user.username,
        canManageAdmins: req.user.canManageAdmins
      }
    });
  });

  return router;
};