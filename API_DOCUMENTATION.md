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
- **Request Body**: User details to update
- **Response**: Updated user details
- **Access**: Any authenticated user

## Ticket Management

### Get All Tickets
- **URL**: `/api/tickets`
- **Method**: `GET`
- **Description**: Get all tickets
- **Response**: List of tickets
- **Access**:
  - ADMIN and MANAGER can view all tickets
  - CUSTOMERS can view their own tickets
  - ENGINEERS can view tickets they are assigned to

### Get Ticket by ID
- **URL**: `/api/tickets/{id}`
- **Method**: `GET`
- **Description**: Get ticket by ID
- **Response**: Ticket details
- **Access**: ADMIN, ENGINEER, MANAGER, CUSTOMER

### Create Ticket
- **URL**: `/api/tickets`
- **Method**: `POST`
- **Description**: Create a new ticket
- **Request Body**: Ticket details
- **Response**: Created ticket details
- **Access**: ADMIN, ENGINEER, MANAGER, CUSTOMER

### Update Ticket
- **URL**: `/api/tickets/{id}`
- **Method**: `PUT`
- **Description**: Update ticket details
- **Request Body**: Ticket details to update
- **Response**: Updated ticket details
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
- **Request Body**: New role
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

### Get Engineers by Category
- **URL**: `/api/engineers/category/{categoryId}`
- **Method**: `GET`
- **Description**: Get engineers by category
- **Response**: List of engineers
- **Access**: ADMIN, MANAGER

### Get Available Engineers
- **URL**: `/api/engineers/available`
- **Method**: `GET`
- **Description**: Get available engineers
- **Response**: List of engineers
- **Access**: ADMIN, MANAGER

### Create Engineer
- **URL**: `/api/engineers/create`
- **Method**: `POST`
- **Description**: Create a new engineer
- **Request Body**:
  ```json
  {
    "name": "John Engineer",
    "email": "engineer@example.com",
    "password": "password123",
    "category": "SOFTWARE",
    "level": 2,
    "maxTickets": 5
  }
  ```
- **Response**: Created engineer details
- **Access**: ADMIN, MANAGER

## Session Management

### Get All Sessions
- **URL**: `/api/sessions`
- **Method**: `GET`
- **Description**: Get all sessions
- **Response**: List of sessions
- **Access**: ADMIN, MANAGER

### Get Session by ID
- **URL**: `/api/sessions/{id}`
- **Method**: `GET`
- **Description**: Get session by ID
- **Response**: Session details
- **Access**: ADMIN, MANAGER

### Get Session by Session ID
- **URL**: `/api/sessions/session/{sessionId}`
- **Method**: `GET`
- **Description**: Get session by session ID
- **Response**: Session details
- **Access**: ADMIN, MANAGER

### Get Sessions by User
- **URL**: `/api/sessions/user/{userId}`
- **Method**: `GET`
- **Description**: Get sessions by user ID
- **Response**: List of sessions
- **Access**: ADMIN, MANAGER

### Get Inactive Sessions
- **URL**: `/api/sessions/inactive`
- **Method**: `GET`
- **Description**: Get inactive sessions
- **Response**: List of sessions
- **Access**: ADMIN only

### Get Session History
- **URL**: `/api/sessions/{id}/history`
- **Method**: `GET`
- **Description**: Get the chat history for a session
- **Response**:
  ```json
  {
    "history": [
      { "role": "user", "content": "First message", "timestamp": "2024-06-01T12:00:00Z" },
      { "role": "assistant", "content": "Hello! How can I help you?", "timestamp": "2024-06-01T12:00:01Z" }
    ]
  }
  ```
- **Access**: ADMIN, MANAGER, session owner (CUSTOMER)

### End Session
- **URL**: `/api/sessions/{id}/end`
- **Method**: `PUT`
- **Description**: End a session. Can be called by ADMIN, MANAGER, or the session owner (CUSTOMER).
- **Response**: Updated session details
- **Access**: ADMIN, MANAGER, session owner (CUSTOMER)

### Update Session Activity
- **URL**: `/api/sessions/{id}/activity`
- **Method**: `PUT`
- **Description**: Update session activity
- **Response**: Updated session details
- **Access**: ADMIN, MANAGER

### Create Session
- **URL**: `/api/sessions`
- **Method**: `POST`
- **Description**: Create a new session. The session title is set from the first user message.
- **Request Body**:
  ```json
  { "title": "First user message" }
  ```
- **Response**: Created session details (includes `title` field)
- **Access**: CUSTOMER only

## Error Responses

### 400 Bad Request
```json
{
    "timestamp": "2024-03-20T10:00:00Z",
    "status": 400,
    "error": "Bad Request",
    "message": "Invalid input data",
    "path": "/api/tickets"
}
```

### 401 Unauthorized
```json
{
    "timestamp": "2024-03-20T10:00:00Z",
    "status": 401,
    "error": "Unauthorized",
    "message": "Full authentication is required to access this resource",
    "path": "/api/tickets"
}
```

### 403 Forbidden
```json
{
    "timestamp": "2024-03-20T10:00:00Z",
    "status": 403,
    "error": "Forbidden",
    "message": "Access denied",
    "path": "/api/tickets"
}
```

### 404 Not Found
```json
{
    "timestamp": "2024-03-20T10:00:00Z",
    "status": 404,
    "error": "Not Found",
    "message": "Resource not found",
    "path": "/api/tickets/999"
}
```

## Notes

1. All endpoints require authentication except `/api/auth/login`
2. Replace `<token>` with the JWT token received from login
3. Timestamps are in ISO 8601 format
4. IDs are numeric and auto-generated
5. All endpoints return JSON responses
6. Error responses include detailed messages and timestamps 