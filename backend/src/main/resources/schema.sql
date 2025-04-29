-- Create database
CREATE DATABASE IF NOT EXISTS ticket_system;
USE ticket_system;

-- Create User table (base table)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Customer table (extends User)
CREATE TABLE IF NOT EXISTS customers (
    user_id BIGINT PRIMARY KEY,
    role ENUM('NORMAL', 'VIP', 'SVIP') DEFAULT 'NORMAL',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Engineer table (extends User)
CREATE TABLE IF NOT EXISTS engineers (
    user_id BIGINT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    level INT NOT NULL,
    current_ticket_count INT DEFAULT 0,
    max_ticket_count INT DEFAULT 5,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Manager table (extends User)
CREATE TABLE IF NOT EXISTS managers (
    user_id BIGINT PRIMARY KEY,
    department VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Product table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Ticket Type table
CREATE TABLE IF NOT EXISTS ticket_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Create Session table
CREATE TABLE IF NOT EXISTS sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    conversation_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Ticket table
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    engineer_id BIGINT,
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
    type_id BIGINT NOT NULL,
    urgency ENUM('NORMAL', 'VIP', 'SVIP') DEFAULT 'NORMAL',
    last_response_time TIMESTAMP,
    product_id BIGINT,
    resolved_at TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (customer_id) REFERENCES customers(user_id),
    FOREIGN KEY (engineer_id) REFERENCES engineers(user_id),
    FOREIGN KEY (type_id) REFERENCES ticket_types(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample data

-- Insert Users
INSERT INTO users (name, password, email, phone_number) VALUES
('John Doe', 'password123', 'john@example.com', '1234567890'),
('Jane Smith', 'password123', 'jane@example.com', '0987654321'),
('Mike Johnson', 'password123', 'mike@example.com', '1122334455'),
('Sarah Williams', 'password123', 'sarah@example.com', '5566778899'),
('David Brown', 'password123', 'david@example.com', '9988776655');

-- Insert Customers
INSERT INTO customers (user_id, role) VALUES
(1, 'NORMAL'),
(2, 'VIP'),
(3, 'SVIP');

-- Insert Engineers
INSERT INTO engineers (user_id, category, level, current_ticket_count) VALUES
(4, 'Network', 2, 0),
(5, 'Software', 3, 0);

-- Insert Products
INSERT INTO products (name, description) VALUES
('Router 8500', 'High-performance enterprise router'),
('Switch 9400', 'Enterprise-grade network switch');

-- Insert Ticket Types
INSERT INTO ticket_types (name, description) VALUES
('General', 'General support ticket'),
('Product', 'Product-specific issue'),
('Complaint', 'Customer complaint');

-- Insert Sessions
INSERT INTO sessions (user_id, session_id, category, conversation_history) VALUES
(1, 'session123', 'Support', 'Initial conversation started'),
(2, 'session456', 'Technical', 'Product inquiry'),
(3, 'session789', 'Complaint', 'Service issue');

-- Insert Tickets
INSERT INTO tickets (session_id, customer_id, engineer_id, status, type_id, urgency, product_id) VALUES
(1, 1, 4, 'OPEN', 1, 'NORMAL', 1),
(2, 2, 5, 'IN_PROGRESS', 2, 'VIP', 2),
(3, 3, 4, 'OPEN', 3, 'SVIP', 1); 