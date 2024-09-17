const express = require('express');
const router = express.Router();

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
      if (error) throw error;
      res.json(results);
    });
  });

  // Create a new order
  router.post('/orders', (req, res) => {
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

  // Update order status
  router.put('/orders/:id/status', (req, res) => {
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

  return router;
};