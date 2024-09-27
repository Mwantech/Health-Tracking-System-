import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
  const [authAdmin, setAuthAdmin] = useState({ username: '', password: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [canManageAdmins, setCanManageAdmins] = useState(false);

  useEffect(() => {
    if (isAuthenticated && canManageAdmins) {
      fetchAdmins();
    }
  }, [isAuthenticated, canManageAdmins]);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/admins', {
        headers: { Authorization: token }
      });
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const authenticateAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admins/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authAdmin),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        setIsAuthenticated(true);
        setCanManageAdmins(data.canManageAdmins);
        if (!data.canManageAdmins) {
          alert('You do not have permission to manage admins.');
        }
      } else {
        alert('Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Error authenticating admin:', error);
      alert(`Authentication failed: ${error.message}`);
    }
  };

  const addAdmin = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !canManageAdmins) {
      alert('You do not have permission to add an admin.');
      return;
    }
    try {
      await axios.post('http://localhost:3001/api/admins', newAdmin, {
        headers: { Authorization: token }
      });
      fetchAdmins();
      setNewAdmin({ username: '', password: '' });
    } catch (error) {
      console.error('Error adding admin:', error);
    }
  };

  const deleteAdmin = async (id) => {
    if (!isAuthenticated || !canManageAdmins) {
      alert('You do not have permission to delete an admin.');
      return;
    }
    try {
      await axios.delete(`http://localhost:3001/api/admins/${id}`, {
        headers: { Authorization: token }
      });
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="adminManagement-card">
        <h2>Admin Authentication</h2>
        <form onSubmit={authenticateAdmin}>
          <input
            type="text"
            placeholder="Username"
            value={authAdmin.username}
            onChange={(e) => setAuthAdmin({...authAdmin, username: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            value={authAdmin.password}
            onChange={(e) => setAuthAdmin({...authAdmin, password: e.target.value})}
          />
          <button type="submit">Authenticate</button>
        </form>
      </div>
    );
  }

  if (!canManageAdmins) {
    return <div className="adminManagement-card"><h2>You do not have permission to manage admins.</h2></div>;
  }

  return (
    <div className="adminManagement-card">
      <h2>Admin Management</h2>
      <form onSubmit={addAdmin}>
        <input
          type="text"
          placeholder="Username"
          value={newAdmin.username}
          onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
        />
        <input
          type="password"
          placeholder="Password"
          value={newAdmin.password}
          onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
        />
        <button type="submit">Add Admin</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td>{admin.username}</td>
              <td>
                <button onClick={() => deleteAdmin(admin.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminManagement;