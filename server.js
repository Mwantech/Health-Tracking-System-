const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT"]
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

// Get all test kits
app.get('/api/testkits', (req, res) => {
  connection.query('SELECT * FROM test_kits', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

// Create a new order
app.post('/api/orders', (req, res) => {
  const { selectedKits, shippingInfo, paymentMethod, paymentDetails, orderNumber } = req.body;
  
  const orderQuery = 'INSERT INTO orders (order_number, shipping_address, phone, email, payment_method, payment_details) VALUES (?, ?, ?, ?, ?, ?)';
  const orderItemQuery = 'INSERT INTO order_items (order_id, test_kit_id, quantity) VALUES ?';

  connection.beginTransaction((err) => {
    if (err) throw err;

    connection.query(orderQuery, [orderNumber, shippingInfo.address, shippingInfo.phone, shippingInfo.email, paymentMethod, JSON.stringify(paymentDetails)], (error, result) => {
      if (error) {
        return connection.rollback(() => {
          throw error;
        });
      }

      const orderId = result.insertId;
      const orderItems = selectedKits.map(kit => [orderId, kit.id, kit.quantity]);

      connection.query(orderItemQuery, [orderItems], (error) => {
        if (error) {
          return connection.rollback(() => {
            throw error;
          });
        }

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              throw err;
            });
          }
          res.json({ orderId, orderNumber, message: 'Order placed successfully' });
          // Emit new order event
          io.emit('newOrder', { orderId, orderNumber });
        });
      });
    });
  });
});

// Get all orders
app.get('/api/orders', (req, res) => {
  const query = `
    SELECT o.id, o.order_number, o.shipping_address, o.phone, o.email, o.payment_method, o.created_at, o.status,
           GROUP_CONCAT(CONCAT(tk.name, ' (', oi.quantity, ')') SEPARATOR ', ') AS test_kits
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN test_kits tk ON oi.test_kit_id = tk.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  connection.query(query, (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const query = 'UPDATE orders SET status = ? WHERE id = ?';

  connection.query(query, [status, id], (error, result) => {
    if (error) throw error;
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      res.json({ message: 'Order status updated successfully' });
      // Emit event to all connected clients about the order update
      io.emit('orderUpdated', { id, status });
    }
  });
});

// Get all doctors
app.get('/api/doctors', (req, res) => {
  const query = 'SELECT * FROM doctors';
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

// Add a new doctor
app.post('/api/doctors', (req, res) => {
  const { name, specialization, contact, availability } = req.body;
  const query = 'INSERT INTO doctors (name, specialization, contact, availability) VALUES (?, ?, ?, ?)';
  connection.query(query, [name, specialization, contact, availability], (error, result) => {
    if (error) throw error;
    res.status(201).json({ id: result.insertId, message: 'Doctor added successfully' });
  });
});

// Update a doctor
app.put('/api/doctors/:id', (req, res) => {
  const { id } = req.params;
  const { name, specialization, contact, availability } = req.body;
  const query = 'UPDATE doctors SET name = ?, specialization = ?, contact = ?, availability = ? WHERE id = ?';
  connection.query(query, [name, specialization, contact, availability, id], (error, result) => {
    if (error) throw error;
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Doctor not found' });
    } else {
      res.json({ message: 'Doctor updated successfully' });
    }
  });
});

// Get all health issues
app.get('/api/health-issues', (req, res) => {
  const query = 'SELECT * FROM health_issues';
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

// Add a new health issue
app.post('/api/health-issues', (req, res) => {
  const { name, description, symptoms } = req.body;
  const query = 'INSERT INTO health_issues (name, description, symptoms) VALUES (?, ?, ?)';
  connection.query(query, [name, description, symptoms], (error, result) => {
    if (error) throw error;
    res.status(201).json({ id: result.insertId, message: 'Health issue added successfully' });
  });
});

// Update a health issue
app.put('/api/health-issues/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, symptoms } = req.body;
  const query = 'UPDATE health_issues SET name = ?, description = ?, symptoms = ? WHERE id = ?';
  connection.query(query, [name, description, symptoms, id], (error, result) => {
    if (error) throw error;
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Health issue not found' });
    } else {
      res.json({ message: 'Health issue updated successfully' });
    }
  });
});

// Get telemedicine pricing
app.get('/api/telemedicine-pricing', (req, res) => {
  const query = 'SELECT * FROM telemedicine_pricing LIMIT 1';
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.json(results[0] || {});
  });
});

// Update telemedicine pricing
app.put('/api/telemedicine-pricing', (req, res) => {
  const { base_fee, additional_fee } = req.body;
  const query = 'UPDATE telemedicine_pricing SET base_fee = ?, additional_fee = ?';
  connection.query(query, [base_fee, additional_fee], (error, result) => {
    if (error) throw error;
    res.json({ message: 'Telemedicine pricing updated successfully' });
  });
});

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