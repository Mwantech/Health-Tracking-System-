const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password, userType } = req.body;
  console.log('Login attempt:', { username, userType });

  try {
    let query;

    // Adjust query to match the fields from your database schema
    if (userType === 'admin') {
      query = 'SELECT id AS userId, username, password FROM admins WHERE username = $1';
    } else if (userType === 'doctor') {
      query = 'SELECT id AS userId, name, specialization, password FROM doctors WHERE name = $1';
    } else {
      console.log('Invalid user type:', userType);
      return res.status(400).json({ message: 'Invalid user type' });
    }

    console.log('Executing query:', query);
    const result = await db.query(query, [username]);
    console.log('Query result:', result.rows);

    const user = result.rows[0];

    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', { id: user.userId, username, userType });

    // Use bcrypt to compare passwords for both admin and doctor
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log('Password mismatch for user:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Prepare the response data
    const responseData = {
      token,
      userType,
      username: userType === 'admin' ? user.username : user.name, // Use 'name' for doctors
      userId: user.userId,
    };

    if (userType === 'doctor') {
      responseData.specialization = user.specialization; // Include doctor's specialization if needed
    }

    console.log('Login successful. Response data:', responseData);

    // Send the response back
    res.json(responseData);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
