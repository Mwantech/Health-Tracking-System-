const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const orderRoutes = require('./routes/orderRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const healthIssueRoutes = require('./routes/healthIssueRoutes');
const telemedicineRoutes = require('./routes/telemedicineRoutes');
const testKitRoutes = require('./routes/testKitRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const port = 3001;

app.use(cors());
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

// Use routes
app.use('/api', orderRoutes(connection, io));
app.use('/api', doctorRoutes(connection));
app.use('/api', healthIssueRoutes(connection));
app.use('/api', telemedicineRoutes(connection));
app.use('/api', testKitRoutes(connection));

// WebSocket connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});