const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

module.exports = (connection) => {
    console.log('LoginRoute module loaded');

    router.post('/login', async (req, res) => {
        console.log('Login route accessed');
        const { username, password, userType } = req.body;

        try {
            let query, params;

            if (userType === 'admin') {
                query = 'SELECT id, username, password FROM admins WHERE username = ?';
                params = [username];
            } else if (userType === 'doctor') {
                query = 'SELECT id, name as username, password FROM doctors WHERE name = ?';
                params = [username];
            } else {
                return res.status(400).json({ error: 'Invalid user type' });
            }

            connection.query(query, params, async (error, results) => {
                if (error) {
                    console.error('Database query error:', error);
                    return res.status(500).json({ error: 'An error occurred during login' });
                }

                if (results.length === 0) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                const user = results[0];
                const passwordMatch = await bcrypt.compare(password, user.password);

                if (!passwordMatch) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { userId: user.id, username: user.username, userType },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                // Include userId and doctorId in the response
                const responseData = {
                    token,
                    userType,
                    username: user.username,
                    userId: user.id
                };

                if (userType === 'doctor') {
                    responseData.doctorId = user.id;
                }

                res.json(responseData);
            });
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ error: 'An error occurred during login' });
        }
    });

    return router;
};