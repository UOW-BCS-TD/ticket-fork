-- Drop existing tables if they exist
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS engineers;
DROP TABLE IF EXISTS managers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS ticket_types;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

-- Create customers table
CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(20) NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create engineers table
CREATE TABLE engineers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    category VARCHAR(50) NOT NULL,
    level INT NOT NULL,
    max_tickets INT NOT NULL,
    current_tickets INT NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create managers table
CREATE TABLE managers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    department VARCHAR(50) NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create products table
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL
);

-- Create ticket_types table
CREATE TABLE ticket_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Create sessions table
CREATE TABLE sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    last_activity TIMESTAMP NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create tickets table
CREATE TABLE tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    last_response_time TIMESTAMP,
    customer_id BIGINT NOT NULL,
    engineer_id BIGINT,
    product_id BIGINT NOT NULL,
    type_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (engineer_id) REFERENCES engineers(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (type_id) REFERENCES ticket_types(id),
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Insert initial data
INSERT INTO users (name, email, password, role, created_at) VALUES
('Admin User', 'admin@example.com', '$2a$10$rDm0mT.Ec1lN.UxGZjZoTOH2Xd0B3wqAws8xyNwQM3NPlbfKbPAyG', 'ADMIN', CURRENT_TIMESTAMP),
('Customer User', 'customer@example.com', '$2a$10$rDm0mT.Ec1lN.UxGZjZoTOH2Xd0B3wqAws8xyNwQM3NPlbfKbPAyG', 'CUSTOMER', CURRENT_TIMESTAMP),
('Engineer User', 'engineer@example.com', '$2a$10$rDm0mT.Ec1lN.UxGZjZoTOH2Xd0B3wqAws8xyNwQM3NPlbfKbPAyG', 'ENGINEER', CURRENT_TIMESTAMP),
('Manager User', 'manager@example.com', '$2a$10$rDm0mT.Ec1lN.UxGZjZoTOH2Xd0B3wqAws8xyNwQM3NPlbfKbPAyG', 'MANAGER', CURRENT_TIMESTAMP);

INSERT INTO customers (email, user_id, role) VALUES
('customer@example.com', 2, 'STANDARD');

INSERT INTO engineers (email, user_id, category, level, max_tickets, current_tickets) VALUES
('engineer@example.com', 3, 'Software', 1, 5, 0);

INSERT INTO managers (email, user_id, department) VALUES
('manager@example.com', 4, 'IT');

INSERT INTO products (name, description, created_at) VALUES
('Product A', 'Description for Product A', CURRENT_TIMESTAMP),
('Product B', 'Description for Product B', CURRENT_TIMESTAMP);

INSERT INTO ticket_types (name, description) VALUES
('Technical Support', 'Technical support tickets'),
('Feature Request', 'Feature request tickets'); 