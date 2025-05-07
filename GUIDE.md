# Support Ticket System API Guide

This document provides a comprehensive guide to the Support Ticket System API endpoints.

## Base URL
All API endpoints are prefixed with `/api`

## Authentication
All endpoints require authentication. Include your authentication token in the `Authorization` header.

## Endpoints

### Tickets

#### Get All Tickets
- **GET** `/api/tickets`
- Returns a list of all tickets

#### Get Ticket by ID
- **GET** `/api/tickets/{id}`
- Returns a specific ticket by its ID

#### Get Tickets by Customer
- **GET** `/api/tickets/customer/{customerId}`
- Returns all tickets associated with a specific customer

#### Get Tickets by Engineer
- **GET** `/api/tickets/engineer/{engineerId}`
- Returns all tickets assigned to a specific engineer

#### Get Tickets by Status
- **GET** `/api/tickets/status/{status}`
- Returns all tickets with a specific status
- Valid status values: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`

#### Get Tickets by Urgency
- **GET** `/api/tickets/urgency/{urgency}`
- Returns all tickets with a specific urgency level
- Valid urgency values: `STANDARD`, `PRIORITY`, `VIP`

#### Get Tickets by Product
- **GET** `/api/tickets/product/{productId}`
- Returns all tickets related to a specific product

#### Get Tickets by Type
- **GET** `/api/tickets/type/{typeId}`
- Returns all tickets of a specific type

#### Create Ticket
- **POST** `/api/tickets`
- Creates a new ticket
- Request body should include ticket details

#### Update Ticket
- **PUT** `/api/tickets/{id}`
- Updates an existing ticket
- Request body should include updated ticket details

#### Delete Ticket
- **DELETE** `/api/tickets/{id}`
- Deletes a specific ticket

#### Escalate Ticket
- **POST** `/api/tickets/{id}/escalate`
- Escalates a ticket to a higher-level engineer

### Customers

#### Get All Customers
- **GET** `/api/customers`
- Returns a list of all customers

#### Get Customer by ID
- **GET** `/api/customers/{id}`
- Returns a specific customer by their ID

#### Get Customer by Email
- **GET** `/api/customers/email/{email}`
- Returns a customer by their email address

#### Create Customer
- **POST** `/api/customers`
- Creates a new customer
- Request body should include customer details

#### Update Customer Role
- **PUT** `/api/customers/{id}/role`
- Updates a customer's role
- Query parameter: `role` (STANDARD, PRIORITY, VIP)

#### Delete Customer
- **DELETE** `/api/customers/{id}`
- Deletes a specific customer

### Engineers

#### Get All Engineers
- **GET** `/api/engineers`
- Returns a list of all engineers

#### Get Engineer by ID
- **GET** `/api/engineers/{id}`
- Returns a specific engineer by their ID

#### Get Engineer by Email
- **GET** `/api/engineers/email/{email}`
- Returns an engineer by their email address

#### Get Engineers by Category
- **GET** `/api/engineers/category/{category}`
- Returns all engineers in a specific category

#### Get Available Engineers
- **GET** `/api/engineers/available`
- Returns all engineers who are available to take new tickets

#### Create Engineer
- **POST** `/api/engineers`
- Creates a new engineer
- Request body should include engineer details

#### Update Engineer
- **PUT** `/api/engineers/{id}`
- Updates an existing engineer
- Request body should include updated engineer details

#### Delete Engineer
- **DELETE** `/api/engineers/{id}`
- Deletes a specific engineer

### Sessions

#### Get All Sessions
- **GET** `/api/sessions`
- Returns a list of all sessions

#### Get Session by ID
- **GET** `/api/sessions/{id}`
- Returns a specific session by its ID

#### Get Session by Session ID
- **GET** `/api/sessions/session/{sessionId}`
- Returns a session by its session ID

#### Get Sessions by User
- **GET** `/api/sessions/user/{userId}`
- Returns all sessions for a specific user

#### Create Session
- **POST** `/api/sessions`
- Creates a new session
- Request body should include session details

#### Update Session
- **PUT** `/api/sessions/{id}`
- Updates an existing session
- Request body should include updated session details

#### Update Last Activity
- **PUT** `/api/sessions/{id}/activity`
- Updates the last activity timestamp for a session

#### Get Inactive Sessions
- **GET** `/api/sessions/inactive`
- Returns all sessions that have been inactive since the specified threshold
- Query parameter: `threshold` (ISO-8601 datetime)

#### Delete Session
- **DELETE** `/api/sessions/{id}`
- Deletes a specific session

## Response Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Error Response Format
```json
{
    "timestamp": "2023-04-30T12:00:00.000+00:00",
    "status": 400,
    "error": "Bad Request",
    "message": "Detailed error message",
    "path": "/api/endpoint"
}
``` 