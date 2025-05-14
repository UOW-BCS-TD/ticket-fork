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
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

-- Create customers table
CREATE TABLE customers (
    customer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(20) NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_customer_role CHECK (role IN ('STANDARD', 'PREMIUM', 'VIP'))
);

-- Create engineers table
CREATE TABLE engineers (
    engineer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    category VARCHAR(50) NOT NULL,
    level INT NOT NULL,
    max_tickets INT NOT NULL,
    current_tickets INT NOT NULL DEFAULT 0,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_engineer_level CHECK (level > 0),
    CONSTRAINT chk_engineer_tickets CHECK (current_tickets <= max_tickets)
);

-- Create managers table
CREATE TABLE managers (
    manager_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    department VARCHAR(50) NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create products table
CREATE TABLE products (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create ticket_types table
CREATE TABLE ticket_types (
    ticket_type_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Create sessions table
CREATE TABLE sessions (
    session_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    last_activity TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    history LONGTEXT,
    conversation_file_path VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_session_times CHECK (end_time IS NULL OR end_time > start_time),
    CONSTRAINT chk_session_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'CLOSED'))
);

-- Create tickets table
CREATE TABLE tickets (
    ticket_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    last_response_time TIMESTAMP,
    customer_id BIGINT NOT NULL,
    engineer_id BIGINT,
    product_id BIGINT NOT NULL,
    type_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (engineer_id) REFERENCES engineers(engineer_id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
    FOREIGN KEY (type_id) REFERENCES ticket_types(ticket_type_id) ON DELETE RESTRICT,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    CONSTRAINT chk_ticket_status CHECK (status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED', 'ESCALATED')),
    CONSTRAINT chk_ticket_urgency CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_ticket_times CHECK (
        (resolved_at IS NULL) OR 
        (resolved_at >= created_at AND resolved_at >= updated_at)
    )
);

-- Insert initial data
INSERT INTO users (name, email, password, role, created_at) VALUES
('Admin User', 'admin@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ADMIN', CURRENT_TIMESTAMP),
('Customer User', 'customer@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'CUSTOMER', CURRENT_TIMESTAMP),
('Engineer User', 'engineer@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', CURRENT_TIMESTAMP),
('Manager User', 'manager@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'MANAGER', CURRENT_TIMESTAMP);

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