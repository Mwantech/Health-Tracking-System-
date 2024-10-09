require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authroutes');
const adminRoute = require('./routes/adminRoute');
const orderRoutes = require('./routes/orderRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const healthIssueRoutes = require('./routes/healthIssueRoutes');
const telemedicineRoutes = require('./routes/telemedicineRoutes');
const testKitRoutes = require('./routes/testKitRoutes');
const appointmentRoutes = require('./routes/TelemedicineBookingRoutes');
const LoginRoutes = require('./routes/loginRoutes');
const UsersLoginRoutes = require('./routes/UsersLoginRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Create MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Use routes
app.use('/api/auth', authRoutes(connection));
app.use('/api/admin', authMiddleware, adminRoute(connection));
app.use('/api', orderRoutes(connection, io));
app.use('/api', doctorRoutes(connection));
app.use('/api', healthIssueRoutes(connection));
app.use('/api', telemedicineRoutes(connection));
app.use('/api', testKitRoutes(connection));
app.use('/api', appointmentRoutes(connection));
app.use('/api', LoginRoutes(connection));
app.use('/api', UsersLoginRoutes(connection));

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