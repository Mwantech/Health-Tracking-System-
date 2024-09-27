const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ... (admin data and middleware)
// In-memory storage for admins (replace this with your database logic)
const admins = [
  { id: 1, username: 'mwantech', password: '$2b$10$1234567890123456789012', canManageAdmins: true },
  { id: 2, username: 'john smith', password: '$2b$10$0987654321098765432109', canManageAdmins: true }
];

// List of superadmins who can manage other admins
const superadmins = ['mwantech', 'john smith'];

// JWT secret (should be stored in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || '80b4c49e9640788db141db4f101c7caacc61be284f78c0120b0e918936c6d50288323416090bd8bec1a0e6ecc5b32c0aead810b65418d1efd5903c11a76f887e';

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.admin = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check if the admin is a superadmin
const isSuperAdmin = (req, res, next) => {
  if (superadmins.includes(req.admin.username)) {
    next();
  } else {
    res.status(403).json({ error: 'Insufficient permissions' });
  }
};

// Authenticate admin
router.post('/authenticate', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = admins.find(a => a.username === username);
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '1h' });
    const canManageAdmins = superadmins.includes(admin.username);
    res.json({ token, canManageAdmins });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ... (other routes)
// Get all admins
router.get('/', verifyAdminToken, isSuperAdmin, async (req, res) => {
  try {
    const adminList = admins.map(({ id, username, canManageAdmins }) => ({ id, username, canManageAdmins }));
    res.json(adminList);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new admin
router.post('/', verifyAdminToken, isSuperAdmin, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (admins.some(a => a.username === username)) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newAdmin = { 
      id: admins.length + 1,
      username, 
      password: hashedPassword, 
      canManageAdmins: superadmins.includes(username)
    };
    
    admins.push(newAdmin);
    
    res.status(201).json({ 
      id: newAdmin.id, 
      username: newAdmin.username, 
      canManageAdmins: newAdmin.canManageAdmins 
    });
  } catch (error) {
    console.error('Error adding new admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete admin
router.delete('/:id', verifyAdminToken, isSuperAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const adminIndex = admins.findIndex(a => a.id === id);
    
    if (adminIndex === -1) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    if (superadmins.includes(admins[adminIndex].username)) {
      return res.status(403).json({ error: 'Cannot delete a superadmin' });
    }

    admins.splice(adminIndex, 1);
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;