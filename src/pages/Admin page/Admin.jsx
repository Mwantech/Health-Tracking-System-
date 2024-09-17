import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './Admin.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [healthIssues, setHealthIssues] = useState([]);
  const [telemedicinePricing, setTelemedicinePricing] = useState({ base_fee: 0, additional_fee: 0 });
  const [testKits, setTestKits] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialization: '', contact: '', availability: '' });
  const [newHealthIssue, setNewHealthIssue] = useState({ name: '', description: '', symptoms: '' });
  const [newTestKit, setNewTestKit] = useState({ name: '', description: '', price: 0 });

  useEffect(() => {
    fetchOrders();
    fetchDoctors();
    fetchHealthIssues();
    fetchTelemedicinePricing();
    fetchTestKits();

    const socket = io('http://localhost:3001');

    socket.on('newOrder', (order) => {
      setNotifications(prev => [...prev, `New order received: ${order.orderNumber}`]);
      fetchOrders();
    });

    socket.on('orderUpdated', ({ id, status }) => {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === id ? { ...order, status } : order
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchHealthIssues = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/health-issues');
      setHealthIssues(response.data);
    } catch (error) {
      console.error('Error fetching health issues:', error);
    }
  };

  const fetchTelemedicinePricing = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/telemedicine-pricing');
      setTelemedicinePricing(response.data);
    } catch (error) {
      console.error('Error fetching telemedicine pricing:', error);
    }
  };

  const fetchTestKits = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/testkits');
      setTestKits(response.data);
    } catch (error) {
      console.error('Error fetching test kits:', error);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:3001/api/orders/${id}/status`, { status });
      // The order will be updated via the socket connection
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const addDoctor = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/doctors', newDoctor);
      fetchDoctors();
      setNewDoctor({ name: '', specialization: '', contact: '', availability: '' });
    } catch (error) {
      console.error('Error adding doctor:', error);
    }
  };

  const deleteDoctor = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/doctors/${id}`);
      fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  };

  const addHealthIssue = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/health-issues', newHealthIssue);
      fetchHealthIssues();
      setNewHealthIssue({ name: '', description: '', symptoms: '' });
    } catch (error) {
      console.error('Error adding health issue:', error);
    }
  };

  const deleteHealthIssue = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/health-issues/${id}`);
      fetchHealthIssues();
    } catch (error) {
      console.error('Error deleting health issue:', error);
    }
  };

  const updateTelemedicinePricing = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:3001/api/telemedicine-pricing', telemedicinePricing);
      fetchTelemedicinePricing();
    } catch (error) {
      console.error('Error updating telemedicine pricing:', error);
    }
  };

  const addTestKit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/testkits', newTestKit);
      fetchTestKits();
      setNewTestKit({ name: '', description: '', price: 0 });
    } catch (error) {
      console.error('Error adding test kit:', error);
    }
  };

  const deleteTestKit = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/testkits/${id}`);
      fetchTestKits();
    } catch (error) {
      console.error('Error deleting test kit:', error);
    }
  };

  const renderOrdersManagement = () => (
    <div className="card">
      <h2>Orders Management</h2>
      <table>
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Customer</th>
            <th>Test Kits</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.order_number}</td>
              <td>{order.email}</td>
              <td>{order.test_kits}</td>
              <td>{order.status}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDoctorManagement = () => (
    <div className="card">
      <h2>Doctor Management</h2>
      <form onSubmit={addDoctor}>
        <input
          type="text"
          placeholder="Name"
          value={newDoctor.name}
          onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
        />
        <input
          type="text"
          placeholder="Specialization"
          value={newDoctor.specialization}
          onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
        />
        <input
          type="text"
          placeholder="Contact"
          value={newDoctor.contact}
          onChange={(e) => setNewDoctor({...newDoctor, contact: e.target.value})}
        />
        <input
          type="text"
          placeholder="Availability"
          value={newDoctor.availability}
          onChange={(e) => setNewDoctor({...newDoctor, availability: e.target.value})}
        />
        <button type="submit">Add Doctor</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialization</th>
            <th>Contact</th>
            <th>Availability</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor.id}>
              <td>{doctor.name}</td>
              <td>{doctor.specialization}</td>
              <td>{doctor.contact}</td>
              <td>{doctor.availability}</td>
              <td>
                <button onClick={() => deleteDoctor(doctor.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderHealthIssueManagement = () => (
    <div className="card">
      <h2>Health Issue Management</h2>
      <form onSubmit={addHealthIssue}>
        <input
          type="text"
          placeholder="Name"
          value={newHealthIssue.name}
          onChange={(e) => setNewHealthIssue({...newHealthIssue, name: e.target.value})}
        />
        <input
          type="text"
          placeholder="Description"
          value={newHealthIssue.description}
          onChange={(e) => setNewHealthIssue({...newHealthIssue, description: e.target.value})}
        />
        <input
          type="text"
          placeholder="Symptoms"
          value={newHealthIssue.symptoms}
          onChange={(e) => setNewHealthIssue({...newHealthIssue, symptoms: e.target.value})}
        />
        <button type="submit">Add Health Issue</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Symptoms</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {healthIssues.map((issue) => (
            <tr key={issue.id}>
              <td>{issue.name}</td>
              <td>{issue.description}</td>
              <td>{issue.symptoms}</td>
              <td>
                <button onClick={() => deleteHealthIssue(issue.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTelemedicinePricing = () => (
    <div className="card">
      <h2>Telemedicine Pricing</h2>
      <form onSubmit={updateTelemedicinePricing}>
        <div>
          <label>Base Fee:</label>
          <input
            type="number"
            value={telemedicinePricing.base_fee}
            onChange={(e) => setTelemedicinePricing({...telemedicinePricing, base_fee: e.target.value})}
          />
        </div>
        <div>
          <label>Additional Fee:</label>
          <input
            type="number"
            value={telemedicinePricing.additional_fee}
            onChange={(e) => setTelemedicinePricing({...telemedicinePricing, additional_fee: e.target.value})}
          />
        </div>
        <button type="submit">Update Pricing</button>
      </form>
    </div>
  );

  const renderTestKitManagement = () => (
    <div className="card">
      <h2>Test Kit Management</h2>
      <form onSubmit={addTestKit}>
        <input
          type="text"
          placeholder="Name"
          value={newTestKit.name}
          onChange={(e) => setNewTestKit({...newTestKit, name: e.target.value})}
        />
        
        <input
          type="number"
          placeholder="Price"
          value={newTestKit.price}
          onChange={(e) => setNewTestKit({...newTestKit, price: e.target.value})}
        />
        <button type="submit">Add Test Kit</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Name</th>
          
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {testKits.map((kit) => (
            <tr key={kit.id}>
              <td>{kit.name}</td>
              
              <td>${kit.price}</td>
              <td>
                <button onClick={() => deleteTestKit(kit.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <div className="notifications">
        {notifications.map((notification, index) => (
          <div key={index} className="notification">{notification}</div>
        ))}
      </div>
      <div className="tabs">
        <button onClick={() => setActiveTab("orders")}>Orders</button>
        <button onClick={() => setActiveTab("doctors")}>Doctors</button>
        <button onClick={() => setActiveTab("healthIssues")}>Health Issues</button>
        <button onClick={() => setActiveTab("telemedicine")}>Telemedicine Pricing</button>
        <button onClick={() => setActiveTab("testKits")}>Test Kits</button>
      </div>
      {activeTab === "orders" && renderOrdersManagement()}
      {activeTab === "doctors" && renderDoctorManagement()}
      {activeTab === "healthIssues" && renderHealthIssueManagement()}
      {activeTab === "telemedicine" && renderTelemedicinePricing()}
      {activeTab === "testKits" && renderTestKitManagement()}
    </div>
  );
};

export default AdminPage;