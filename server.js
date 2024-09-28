const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const orderRoutes = require('./routes/orderRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const healthIssueRoutes = require('./routes/healthIssueRoutes');
const telemedicineRoutes = require('./routes/telemedicineRoutes');
const testKitRoutes = require('./routes/testKitRoutes');
const appointmentRoutes = require('./routes/TelemedicineBookingRoutes');
const adminRoutes = require('./routes/adminRoute');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Updated to match your frontend port
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const port = 3001;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Updated to match your frontend port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'healthtrackingsystem'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// JWT secret (should be in an environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Login route
app.post('/api/login', async (req, res) => {
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
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, canManageAdmins: user.can_manage_admins === 1 });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Use routes
app.use('/api', orderRoutes(connection, io));
app.use('/api', doctorRoutes(connection));
app.use('/api', healthIssueRoutes(connection));
app.use('/api', telemedicineRoutes(connection));
app.use('/api', testKitRoutes(connection));
app.use('/api', appointmentRoutes(connection));
app.use('/api/admin', verifyToken, adminRoutes);

// WebSocket connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});