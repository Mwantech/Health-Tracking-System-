-- Create the database
CREATE DATABASE IF NOT EXISTS test_kit_orders;

-- Use the newly created database
USE test_kit_orders;

-- Create the test_kits table
CREATE TABLE IF NOT EXISTS test_kits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Create the orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shipping_address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    test_kit_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (test_kit_id) REFERENCES test_kits(id)
);

-- Insert some sample test kits
INSERT INTO test_kits (name, price) VALUES
    ('COVID-19 Test Kit', 30.00),
    ('Blood Test Kit', 25.00),
    ('DNA Test Kit', 50.00);


-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    availability TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create health_issues table
CREATE TABLE IF NOT EXISTS health_issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    symptoms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create telemedicine_pricing table
CREATE TABLE IF NOT EXISTS telemedicine_pricing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    base_fee DECIMAL(10, 2) NOT NULL,
    additional_fee DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial telemedicine pricing (you can adjust these values)
INSERT INTO telemedicine_pricing (base_fee, additional_fee) VALUES (50.00, 1.00);

-- Add status column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending';