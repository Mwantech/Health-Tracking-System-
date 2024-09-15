import React, { useState } from 'react';
import './Admin.css'

// Mock data (replace with API calls in a real application)
const mockOrders = [
  { id: 1, customer: "John Doe", testKit: "COVID-19 Test", status: "Pending" },
  { id: 2, customer: "Jane Smith", testKit: "Allergy Panel", status: "Shipped" },
];

const mockTestKits = [
  { id: 1, name: "COVID-19 Test", description: "Rapid antigen test", price: 25, quantity: 100 },
  { id: 2, name: "Allergy Panel", description: "Comprehensive allergy test", price: 150, quantity: 50 },
];

const mockDoctors = [
  { id: 1, name: "Dr. Alice Johnson", specialization: "General Practice", contact: "alice@example.com", availability: "Mon-Fri" },
  { id: 2, name: "Dr. Bob Smith", specialization: "Cardiology", contact: "bob@example.com", availability: "Tue-Thu" },
];

const mockHealthIssues = [
  { id: 1, name: "Common Cold", description: "Viral upper respiratory tract infection", symptoms: "Runny nose, sore throat, cough" },
  { id: 2, name: "Hypertension", description: "High blood pressure", symptoms: "Headache, shortness of breath, nosebleeds" },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [searchTerm, setSearchTerm] = useState("");

  const renderOrdersManagement = () => (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Orders Management</h2>
        <p className="card-description">Manage and update order statuses</p>
      </div>
      <div className="card-content">
        <table className="table">
          <thead className="table-header">
            <tr className="table-row">
              <th className="table-head">Order ID</th>
              <th className="table-head">Customer</th>
              <th className="table-head">Test Kit</th>
              <th className="table-head">Status</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {mockOrders.map((order) => (
              <tr key={order.id} className="table-row">
                <td className="table-cell">{order.id}</td>
                <td className="table-cell">{order.customer}</td>
                <td className="table-cell">{order.testKit}</td>
                <td className="table-cell">{order.status}</td>
                <td className="table-cell">
                  <button className="button outline">Update Status</button>
                  <button className="button outline ml-2">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTestKitManagement = () => (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Test Kit Management</h2>
        <p className="card-description">Manage available test kits</p>
      </div>
      <div className="card-content">
        <input
          className="input mb-4"
          placeholder="Search test kits..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <table className="table">
          <thead className="table-header">
            <tr className="table-row">
              <th className="table-head">ID</th>
              <th className="table-head">Name</th>
              <th className="table-head">Description</th>
              <th className="table-head">Price</th>
              <th className="table-head">Quantity</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {mockTestKits.map((kit) => (
              <tr key={kit.id} className="table-row">
                <td className="table-cell">{kit.id}</td>
                <td className="table-cell">{kit.name}</td>
                <td className="table-cell">{kit.description}</td>
                <td className="table-cell">${kit.price}</td>
                <td className="table-cell">{kit.quantity}</td>
                <td className="table-cell">
                  <button className="button outline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-footer">
        <button className="button">Add New Test Kit</button>
      </div>
    </div>
  );

  const renderDoctorManagement = () => (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Doctor Management</h2>
        <p className="card-description">Manage registered doctors</p>
      </div>
      <div className="card-content">
        <input
          className="input mb-4"
          placeholder="Search doctors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <table className="table">
          <thead className="table-header">
            <tr className="table-row">
              <th className="table-head">ID</th>
              <th className="table-head">Name</th>
              <th className="table-head">Specialization</th>
              <th className="table-head">Contact</th>
              <th className="table-head">Availability</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {mockDoctors.map((doctor) => (
              <tr key={doctor.id} className="table-row">
                <td className="table-cell">{doctor.id}</td>
                <td className="table-cell">{doctor.name}</td>
                <td className="table-cell">{doctor.specialization}</td>
                <td className="table-cell">{doctor.contact}</td>
                <td className="table-cell">{doctor.availability}</td>
                <td className="table-cell">
                  <button className="button outline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-footer">
        <button className="button">Add New Doctor</button>
      </div>
    </div>
  );

  const renderHealthIssueManagement = () => (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Health Issue Management</h2>
        <p className="card-description">Manage health issues and symptoms</p>
      </div>
      <div className="card-content">
        <input
          className="input mb-4"
          placeholder="Search health issues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <table className="table">
          <thead className="table-header">
            <tr className="table-row">
              <th className="table-head">ID</th>
              <th className="table-head">Name</th>
              <th className="table-head">Description</th>
              <th className="table-head">Symptoms</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {mockHealthIssues.map((issue) => (
              <tr key={issue.id} className="table-row">
                <td className="table-cell">{issue.id}</td>
                <td className="table-cell">{issue.name}</td>
                <td className="table-cell">{issue.description}</td>
                <td className="table-cell">{issue.symptoms}</td>
                <td className="table-cell">
                  <button className="button outline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-footer">
        <button className="button">Add New Health Issue</button>
      </div>
    </div>
  );

  const renderTelemedicinePricing = () => (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Telemedicine Pricing</h2>
        <p className="card-description">Manage telemedicine consultation pricing</p>
      </div>
      <div className="card-content">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Base Fee</label>
            <input type="number" className="input" placeholder="Enter base fee" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Fee</label>
            <input type="number" className="input" placeholder="Enter additional fee per minute" />
          </div>
        </div>
      </div>
      <div className="card-footer">
        <button className="button">Save Pricing</button>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <div className="tabs-list">
        <div
          className={`tabs-trigger ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </div>
        <div
          className={`tabs-trigger ${activeTab === "testkits" ? "active" : ""}`}
          onClick={() => setActiveTab("testkits")}
        >
          Test Kits
        </div>
        <div
          className={`tabs-trigger ${activeTab === "doctors" ? "active" : ""}`}
          onClick={() => setActiveTab("doctors")}
        >
          Doctors
        </div>
        <div
          className={`tabs-trigger ${activeTab === "issues" ? "active" : ""}`}
          onClick={() => setActiveTab("issues")}
        >
          Health Issues
        </div>
        <div
          className={`tabs-trigger ${activeTab === "pricing" ? "active" : ""}`}
          onClick={() => setActiveTab("pricing")}
        >
          Telemedicine Pricing
        </div>
      </div>

      {/* Render Tab Content */}
      {activeTab === "orders" && renderOrdersManagement()}
      {activeTab === "testkits" && renderTestKitManagement()}
      {activeTab === "doctors" && renderDoctorManagement()}
      {activeTab === "issues" && renderHealthIssueManagement()}
      {activeTab === "pricing" && renderTelemedicinePricing()}
    </div>
  );
};

export default AdminPage;
