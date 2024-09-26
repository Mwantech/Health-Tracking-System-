const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a database configuration file

const Admin = sequelize.define('Admin', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensure that usernames are unique
    validate: {
      notEmpty: true, // Username cannot be empty
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true, // Password cannot be empty
    },
  },
  canManageAdmins: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // By default, an admin can't manage other admins unless specified
  },
}, {
  tableName: 'admins', // You can specify the table name if it's different
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = Admin;
