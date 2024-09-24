require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configure nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Transporter verification error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

module.exports = (connection, io) => {
  // Get all orders
  router.get('/orders', (req, res) => {
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
      if (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ error: 'An error occurred while fetching orders' });
      }
      res.json(results);
    });
  });

  // Create a new order
  router.post('/orders', (req, res) => {
    const { selectedKits, shippingInfo, paymentMethod, paymentDetails, orderNumber } = req.body;
    
    const orderQuery = 'INSERT INTO orders (order_number, shipping_address, phone, email, payment_method, payment_details) VALUES (?, ?, ?, ?, ?, ?)';
    const orderItemQuery = 'INSERT INTO order_items (order_id, test_kit_id, quantity) VALUES ?';

    connection.beginTransaction((err) => {
      if (err) {
        console.error('Transaction error:', err);
        return res.status(500).json({ error: 'An error occurred while placing the order' });
      }

      connection.query(orderQuery, [orderNumber, shippingInfo.address, shippingInfo.phone, shippingInfo.email, paymentMethod, JSON.stringify(paymentDetails)], (error, result) => {
        if (error) {
          return connection.rollback(() => {
            console.error('Order insertion error:', error);
            res.status(500).json({ error: 'An error occurred while placing the order' });
          });
        }

        const orderId = result.insertId;
        const orderItems = selectedKits.map(kit => [orderId, kit.id, kit.quantity]);

        connection.query(orderItemQuery, [orderItems], (error) => {
          if (error) {
            return connection.rollback(() => {
              console.error('Order items insertion error:', error);
              res.status(500).json({ error: 'An error occurred while placing the order' });
            });
          }

          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                console.error('Commit error:', err);
                res.status(500).json({ error: 'An error occurred while placing the order' });
              });
            }
            
            console.log('Order committed successfully, preparing to send email');

            // Send confirmation email
            const mailOptions = {
              from: process.env.GMAIL_USER,
              to: shippingInfo.email,
              subject: `Order Confirmation - Order #${orderNumber}`,
              html: `
                <h1>Thank you for your order!</h1>
                <p>Order Number: ${orderNumber}</p>
                <p>Shipping Address: ${shippingInfo.address}</p>
                <p>Phone: ${shippingInfo.phone}</p>
                <h2>Order Details:</h2>
                <ul>
                  ${selectedKits.map(kit => `<li>${kit.name} - Quantity: ${kit.quantity}</li>`).join('')}
                </ul>
                <p>Payment Method: ${paymentMethod}</p>
              `
            };

            console.log('Attempting to send email to:', shippingInfo.email);

            transporter.sendMail(mailOptions)
              .then(info => {
                console.log('Email sent successfully:', info.response);
                res.json({ orderId, orderNumber, message: 'Order placed successfully and confirmation email sent' });
              })
              .catch(error => {
                console.error('Error sending email:', error);
                res.json({ orderId, orderNumber, message: 'Order placed successfully but there was an error sending the confirmation email' });
              })
              .finally(() => {
                // Emit new order event
                io.emit('newOrder', { orderId, orderNumber });
              });
          });
        });
      });
    });
  });

  // Update order status
  router.put('/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const query = 'UPDATE orders SET status = ? WHERE id = ?';

    connection.query(query, [status, id], (error, result) => {
      if (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ error: 'An error occurred while updating the order status' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json({ message: 'Order status updated successfully' });
      // Emit event to all connected clients about the order update
      io.emit('orderUpdated', { id, status });
    });
  });

  return router;
};