-- Drop existing tables if they exist
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS engineers;
DROP TABLE IF EXISTS managers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS ticket_types;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS ticket_attachments;

-- Create users table
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    category VARCHAR(20) NOT NULL,
    level INT NOT NULL,
    max_tickets INT NOT NULL,
    current_tickets INT NOT NULL DEFAULT 0,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_engineer_level CHECK (level > 0),
    CONSTRAINT chk_engineer_tickets CHECK (current_tickets <= max_tickets),
    CONSTRAINT chk_engineer_category CHECK (category IN ('MODEL_S', 'MODEL_3', 'MODEL_X', 'MODEL_Y', 'CYBERTRUCK'))
);

-- Create managers table
CREATE TABLE managers (
    manager_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    department VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_manager_category CHECK (category IN ('MODEL_S', 'MODEL_3', 'MODEL_X', 'MODEL_Y', 'CYBERTRUCK'))
);

-- Create products table
CREATE TABLE products (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(20) NOT NULL,
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
    ticket_session BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_session_times CHECK (end_time IS NULL OR end_time > start_time),
    CONSTRAINT chk_session_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'CLOSED'))
);

-- Create tickets table
CREATE TABLE tickets (
    ticket_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    last_response_time TIMESTAMP,
    customer_id BIGINT NOT NULL,
    engineer_id BIGINT,
    category VARCHAR(20) NOT NULL,
    type_id BIGINT NOT NULL,
    history LONGTEXT,
    session_id BIGINT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (engineer_id) REFERENCES engineers(engineer_id) ON DELETE SET NULL,
    FOREIGN KEY (type_id) REFERENCES ticket_types(ticket_type_id) ON DELETE RESTRICT,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    CONSTRAINT chk_ticket_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED')),
    CONSTRAINT chk_ticket_urgency CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_ticket_category CHECK (category IN ('MODEL_S', 'MODEL_3', 'MODEL_X', 'MODEL_Y', 'CYBERTRUCK')),
    CONSTRAINT chk_ticket_times CHECK (
        (resolved_at IS NULL) OR 
        (resolved_at >= created_at AND resolved_at >= updated_at)
    )
);

-- Create ticket_attachments table
CREATE TABLE ticket_attachments (
    attachment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);

-- Insert sample users
INSERT INTO users (name, email, password, role, phone_number) VALUES
-- Admin user
('Admin User', 'admin@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ADMIN', '+1234567890'),
-- Manager users
('Model S Manager', 'ms@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'MANAGER', '+1234567891'),
('Model 3 Manager', 'm3@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'MANAGER', '+1234567892'),
('Model X Manager', 'mx@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'MANAGER', '+1234567893'),
('Model Y Manager', 'my@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'MANAGER', '+1234567894'),
('Cybertruck Manager', 'ct@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'MANAGER', '+1234567895'),
-- Level 1 Engineers
('John Smith', 'l1ms@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', '+1234567896'),
('Sarah Johnson', 'l1m3@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', '+1234567893'),
('Michael Brown', 'l1mx@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', '+1234567894'),
('Emily Davis', 'l1my@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', '+1234567895'),
('David Wilson', 'l1ct@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', '+1234567896'),
-- Level 2 Engineers
('James Taylor', 'l2ms@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', '+1234567897'),
('Lisa Anderson', 'l2m3@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', '+1234567898'),
('Robert Martinez', 'l2mx@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', '+1234567899'),
('Jennifer Garcia', 'l2my@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', '+1234567900'),
('William Lee', 'l2ct@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', '+1234567901'),
-- Level 3 Engineers
('Elizabeth White', 'l3ms@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', '+1234567902'),
('Thomas Clark', 'l3m3@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', '+1234567903'),
('Patricia Lewis', 'l3mx@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', '+1234567904'),
('Daniel Walker', 'l3my@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', '+1234567905'),
('Margaret Hall', 'l3ct@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'ENGINEER', '+1234567906'),
-- Customer users
('Alice Cooper', 'svip@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'CUSTOMER', '+1234567907'),
('Bob Wilson', 'vip@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'CUSTOMER', '+1234567908'),
('Carol White', 'cus@example.com', '$2a$10$RIB/MiJM2T2JeQgd.LBw/u.2.2C5svybend6/gwogpi.abw8UvmOu', 'CUSTOMER', '+1234567909');

-- Insert sample customers
INSERT INTO customers (email, user_id, role) VALUES
('svip@example.com', 8, 'VIP'),
('vip@example.com', 9, 'PREMIUM'),
('cus@example.com', 10, 'STANDARD');

-- Insert sample engineers
INSERT INTO engineers (email, user_id, category, level, max_tickets, current_tickets) VALUES
-- Level 1 Engineers
('l1msj@example.com', 3, 'MODEL_S', 1, 3, 0),
('l1m3s@example.com', 4, 'MODEL_3', 1, 3, 0),
('l1mxm@example.com', 5, 'MODEL_X', 1, 3, 0),
('l1mye@example.com', 6, 'MODEL_Y', 1, 3, 0),
('l1ctd@example.com', 7, 'CYBERTRUCK', 1, 3, 0),
-- Level 2 Engineers
('l2msj@example.com', 8, 'MODEL_S', 2, 4, 0),
('l2m3l@example.com', 9, 'MODEL_3', 2, 4, 0),
('l2mxr@example.com', 10, 'MODEL_X', 2, 4, 0),
('l2myj@example.com', 11, 'MODEL_Y', 2, 4, 0),
('l2ctw@example.com', 12, 'CYBERTRUCK', 2, 4, 0),
-- Level 3 Engineers
('l3mse@example.com', 13, 'MODEL_S', 3, 5, 0),
('l3m3t@example.com', 14, 'MODEL_3', 3, 5, 0),
('l3mxp@example.com', 15, 'MODEL_X', 3, 5, 0),
('l3myd@example.com', 16, 'MODEL_Y', 3, 5, 0),
('l3ctm@example.com', 17, 'CYBERTRUCK', 3, 5, 0);

-- Insert sample managers
INSERT INTO managers (email, user_id, department, category) VALUES
('ms@example.com', 2, 'Model S Support', 'MODEL_S'),
('m3@example.com', 3, 'Model 3 Support', 'MODEL_3'),
('mx@example.com', 4, 'Model X Support', 'MODEL_X'),
('my@example.com', 5, 'Model Y Support', 'MODEL_Y'),
('ct@example.com', 6, 'Cybertruck Support', 'CYBERTRUCK');

-- Insert sample products
INSERT INTO products (name, description, category, created_at) VALUES
('Model S', 'Tesla Model S - Luxury Electric Sedan', 'MODEL_S', CURRENT_TIMESTAMP),
('Model 3', 'Tesla Model 3 - Mid-size Electric Sedan', 'MODEL_3', CURRENT_TIMESTAMP),
('Model X', 'Tesla Model X - Luxury Electric SUV', 'MODEL_X', CURRENT_TIMESTAMP),
('Model Y', 'Tesla Model Y - Compact Electric SUV', 'MODEL_Y', CURRENT_TIMESTAMP),
('Cybertruck', 'Tesla Cybertruck - Electric Pickup Truck', 'CYBERTRUCK', CURRENT_TIMESTAMP);

-- Insert sample ticket types
INSERT INTO ticket_types (name, description) VALUES
('Technical Support', 'Technical support and troubleshooting tickets'),
('General Inquiry', 'General questions and information requests');

-- Insert demo sessions
INSERT INTO sessions (title, status, user_id, last_activity) VALUES
('Model S Battery Issue', 'CLOSED', 8, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Model 3 Software Update', 'ACTIVE', 9, NOW()),
('Cybertruck Delivery Question', 'CLOSED', 10, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Insert demo tickets
INSERT INTO tickets (title, status, urgency, customer_id, engineer_id, category, type_id, history, session_id) VALUES
('Model S Battery Drain Issue', 'OPEN', 'HIGH', 1, 1, 'MODEL_S', 1, '[{"role":"system","content":"Ticket created.","timestamp":"2024-06-01T12:00:00Z"}]', 1),
('Model 3 Software Update Request', 'IN_PROGRESS', 'MEDIUM', 2, 2, 'MODEL_3', 2, '[{"role":"system","content":"Ticket created.","timestamp":"2024-06-01T12:00:00Z"}]', 2),
('Cybertruck Delivery Timeline', 'RESOLVED', 'LOW', 3, 5, 'CYBERTRUCK', 1, '[{"role":"system","content":"Ticket created.","timestamp":"2024-06-01T12:00:00Z"}]', 3); 