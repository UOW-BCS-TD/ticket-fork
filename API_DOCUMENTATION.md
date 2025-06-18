# Ticket Management System API Documentation

## Authentication

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Description**: Authenticate user and get JWT token
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: JWT token
- **Access**: Public

### Register
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "CUSTOMER"
  }
  ```
- **Response**: Created user details
- **Access**: Public

## User Management

### Get All Users
- **URL**: `/api/users`
- **Method**: `GET`
- **Description**: Get all users
- **Response**: List of users
- **Access**: ADMIN only

### Get User by ID
- **URL**: `/api/users/{id}`
- **Method**: `GET`
- **Description**: Get user by ID
- **Response**: User details
- **Access**: ADMIN only

### Get Current User Profile
- **URL**: `/api/users/profile`
- **Method**: `GET`
- **Description**: Get the profile of the currently authenticated user
- **Response**: User details
- **Access**: Any authenticated user

### Create User
- **URL**: `/api/users`
- **Method**: `POST`
- **Description**: Create a new user
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "CUSTOMER"
  }
  ```
- **Response**: Created user details
- **Access**: ADMIN only

### Update User
- **URL**: `/api/users/{id}`
- **Method**: `PUT`
- **Description**: Update user details
- **Request Body**: User details to update
- **Response**: Updated user details
- **Access**: ADMIN only

### Update Password
- **URL**: `/api/users/{id}/password`
- **Method**: `PUT`
- **Description**: Update user password
- **Request Body**: New password
- **Response**: Success status
- **Access**: ADMIN only

### Delete User
- **URL**: `/api/users/{id}`
- **Method**: `DELETE`
- **Description**: Delete a user
- **Response**: Success status
- **Access**: ADMIN only

### Update Current User Profile
- **URL**: `/api/users/profile`
- **Method**: `PUT`
- **Description**: Update the profile of the currently authenticated user
- **Request Headers**:
  - `Authorization: Bearer {token}` (Required)
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "string",        // Optional - New name
    "phoneNumber": "string"  // Optional - New phone number
  }
  ```
- **Response**: Updated user details
- **Access**: Any authenticated user

## Ticket Management

### Ticket Object Fields (Updated)
- `id`: Ticket ID
- `title`: Ticket title
- `status`: Ticket status
- `urgency`: Priority level of the ticket
- `product`: Product object
- `type`: Ticket type object
- `createdAt`: Ticket creation timestamp
- `updatedAt`: Last update timestamp
- `customer`: Customer info
- `engineer`: Engineer info
- `session_id`: Associated session ID
- `history`: Ticket-specific history as a JSON array (e.g., status changes, system notes, or chat logs)

> **Note:** As of vNEXT, the `description` field has been removed from tickets. All details should be included in the ticket history or related session.

### Get All Tickets
- **URL**: `/api/tickets`
- **Method**: `GET`
- **Description**: Get all tickets
- **Response**: List of tickets (each includes the new `history` field)
- **Access**:
  - ADMIN and MANAGER can view all tickets
  - CUSTOMERS can view their own tickets
  - ENGINEERS can view tickets they are assigned to

### Get Ticket by ID
- **URL**: `/api/tickets/{id}`
- **Method**: `GET`
- **Description**: Get ticket by ID
- **Response**: Ticket details (includes the new `history` field)
- **Access**: ADMIN, ENGINEER, MANAGER, CUSTOMER

### Create Ticket
- **URL**: `/api/tickets`
- **Method**: `POST`
- **Description**: Create a new ticket
- **Request Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {token}
  ```
- **Request Body**:
  ```json
  {
    "title": "string",
    "customer": {
      "id": "number"
    },
    "product": {
      "id": "number"
    },
    "type": {
      "id": "number"
    },
    "session": {
      "id": "number"
    },
    "urgency": "LOW | MEDIUM | HIGH | CRITICAL",
    "status": "OPEN | ASSIGNED | IN_PROGRESS | PENDING | RESOLVED | CLOSED | ESCALATED",
    "engineer": {
      "id": "number"
    },
    "history": []
  }
  ```
- **Required Fields**:
  - `title`: Ticket title
  - `customer`: Customer ID (must exist)
  - `product`: Product ID (must exist)
  - `type`: Ticket type ID (must exist)
  - `session`: Session ID (must exist)
  - `urgency`: Priority level of the ticket
- **Optional Fields**:
  - `status`: Defaults to "OPEN" if not provided
  - `engineer`: Engineer ID to assign the ticket to
- **Response**: Created ticket details (includes the new `history` field)
- **Access**: ADMIN, ENGINEER, MANAGER, CUSTOMER
- **Notes**:
  - All referenced IDs (customer, product, type, session, engineer) must exist in the database
  - The session must be active
  - The engineer must be available (current tickets < max tickets)
  - The customer must be authenticated and authorized to create tickets
  - The `description` field has been removed from tickets as of vNEXT. Use the ticket history or session for details.

### Update Ticket
- **URL**: `/api/tickets/{id}`
- **Method**: `PUT`
- **Description**: Update ticket details
- **Request Body**: Ticket details to update (optionally include `history` field)
- **Response**: Updated ticket details (includes the new `history` field)
- **Access**: ADMIN, ENGINEER, MANAGER, CUSTOMER

### Delete Ticket
- **URL**: `/api/tickets/{id}`
- **Method**: `DELETE`
- **Description**: Delete a ticket
- **Response**: Success status
- **Access**: Only ADMIN and MANAGER

### Get Tickets by Customer
- **URL**: `/api/tickets/customer/{customerId}`
- **Method**: `GET`
- **Description**: Get tickets by customer ID
- **Response**: List of tickets
- **Access**: ADMIN, ENGINEER, MANAGER, CUSTOMER

### Get Tickets by Engineer
- **URL**: `/api/tickets/engineer/{engineerId}`
- **Method**: `GET`
- **Description**: Get tickets by engineer ID
- **Response**: List of tickets
- **Access**: ADMIN, ENGINEER, MANAGER

### Get Own Tickets
- **URL**: `/api/tickets/own`
- **Method**: `GET`
- **Description**: Get tickets for the currently authenticated user. Only available to:
  - CUSTOMERS: Returns tickets where the user is the customer (uses `customer_id`)
  - ENGINEERS: Returns tickets assigned to the engineer (uses `engineer_id`)
  - All other roles will receive a 403 Forbidden error
- **Response**: List of tickets
- **Access**: Only CUSTOMER and ENGINEER roles

### Update Ticket Status
- **URL**: `/api/tickets/status/{id}`
- **Method**: `PUT`
- **Description**: Update ticket status
- **Request Body**: New status
- **Response**: Updated ticket details
- **Access**: ADMIN, ENGINEER, MANAGER

### Update Ticket Urgency
- **URL**: `/api/tickets/urgency/{id}`
- **Method**: `PUT`
- **Description**: Update ticket urgency
- **Request Body**: New urgency
- **Response**: Updated ticket details
- **Access**: ADMIN, ENGINEER, MANAGER

### Update Ticket Product
- **URL**: `/api/tickets/product/{id}`
- **Method**: `PUT`
- **Description**: Update ticket product
- **Request Body**: New product ID
- **Response**: Updated ticket details
- **Access**: ADMIN, ENGINEER, MANAGER

### Update Ticket Type
- **URL**: `/api/tickets/type/{id}`
- **Method**: `PUT`
- **Description**: Update ticket type
- **Request Body**: New type ID
- **Response**: Updated ticket details
- **Access**: ADMIN, ENGINEER, MANAGER

### Escalate Ticket
- **URL**: `/api/tickets/{id}/escalate`
- **Method**: `PUT`
- **Description**: Escalate a ticket
- **Response**: Updated ticket details
- **Access**: ADMIN, MANAGER

### Add Message to Ticket History
- **URL**: `/api/tickets/{id}/message`
- **Method**: `POST`
- **Description**: Append a new message from the customer to the ticket's conversation history.
- **Request Headers**:
  - `Authorization: Bearer {token}` (Required)
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "content": "Your message text here"
  }
  ```
- **Response**: Updated ticket details (including the new `history` field)
- **Access**: Only the ticket's customer, ADMIN, or MANAGER
- **Notes**:
  - The message will be appended to the ticket's `history` as a new entry with role `customer`, the user's name, content, and timestamp.
  - Returns 403 if not authorized, 404 if ticket not found, 400 if content is missing.
  - Example response:
  ```json
  {
    "id": 123,
    "title": "Example Ticket",
    "status": "OPEN",
    "urgency": "HIGH",
    "product": { ... },
    "type": { ... },
    "createdAt": "2024-06-01T12:00:00Z",
    "updatedAt": "2024-06-01T12:05:00Z",
    "customer": { ... },
    "engineer": { ... },
    "session_id": 456,
    "history": "[ { \"role\": \"customer\", \"content\": \"Your message text here\", ... } ]"
  }
  ```

## Customer Management

### Get All Customers
- **URL**: `/api/customers`
- **Method**: `GET`
- **Description**: Get all customers
- **Response**: List of customers
- **Access**: ADMIN, MANAGER

### Get Customer by ID
- **URL**: `/api/customers/{id}`
- **Method**: `GET`
- **Description**: Get customer by ID
- **Response**: Customer details
- **Access**: ADMIN, MANAGER

### Get Customer by Email
- **URL**: `/api/customers/email/{email}`
- **Method**: `GET`
- **Description**: Get customer by email
- **Response**: Customer details
- **Access**: ADMIN, MANAGER

### Update Customer Role
- **URL**: `/api/customers/{id}/role`
- **Method**: `PUT`
- **Description**: Update customer role
- **Request Body**: 
  ```json
  {
    "role": "STANDARD | PREMIUM | VIP"
  }
  ```
- **Response**: Updated customer details
- **Access**: ADMIN only

## Engineer Management

### Get All Engineers
- **URL**: `/api/engineers`
- **Method**: `GET`
- **Description**: Get all engineers
- **Response**: List of engineers
- **Access**: ADMIN, MANAGER

### Get Engineer by ID
- **URL**: `/api/engineers/{id}`
- **Method**: `GET`
- **Description**: Get engineer by ID
- **Response**: Engineer details
- **Access**: ADMIN, MANAGER

### Get Engineer by Email
- **URL**: `/api/engineers/email/{email}`
- **Method**: `GET`
- **Description**: Get engineer by email
- **Response**: Engineer details
- **Access**: ADMIN, MANAGER

### Get Engineers by Level
- **URL**: `/api/engineers/level/{level}`
- **Method**: `GET`
- **Description**: Get engineers by level (1, 2, or 3)
- **Response**: List of engineers
- **Access**: ADMIN, MANAGER

### Get Engineers by Category
- **URL**: `/api/engineers/category/{category}`
- **Method**: `GET`
- **Description**: Get engineers by Tesla model category
- **Response**: List of engineers
- **Access**: ADMIN, MANAGER

### Get Available Engineers
- **URL**: `/api/engineers/available`
- **Method**: `GET`
- **Description**: Get engineers with current tickets less than max tickets
- **Response**: List of engineers
- **Access**: ADMIN, MANAGER

### Get Available Engineers by Category
- **URL**: `/api/engineers/available/category/{category}`
- **Method**: `GET`
- **Description**: Get available engineers by Tesla model category
- **Response**: List of engineers
- **Access**: ADMIN, MANAGER

### Create Engineer
- **URL**: `/api/engineers`
- **Method**: `POST`
- **Description**: Create a new engineer
- **Request Body**:
  ```json
  {
    "name": "John Engineer",
    "email": "engineer@example.com",
    "password": "password123",
    "category": "MODEL_S | MODEL_3 | MODEL_X | MODEL_Y | CYBERTRUCK",
    "level": 1 | 2 | 3,
    "maxTickets": "number"
  }
  ```
- **Response**: Created engineer details
- **Access**: ADMIN, MANAGER

### Update Engineer
- **URL**: `/api/engineers/{id}`
- **Method**: `PUT`
- **Description**: Update engineer details
- **Request Body**: Engineer details to update
- **Response**: Updated engineer details
- **Access**: ADMIN, MANAGER

### Increment Engineer's Current Tickets
- **URL**: `/api/engineers/{id}/increment-tickets`