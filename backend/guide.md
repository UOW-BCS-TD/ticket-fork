# Support Ticket System User Guide

## Overview
The Support Ticket System is a comprehensive solution for managing customer support tickets, engineers, and user accounts. This guide will help you understand and use the system effectively.

## Authentication and User Management

### User Registration
- Endpoint: `POST /api/auth/register`
- Request Body:
```json
{
    "name": "User Name",
    "email": "user@example.com",
    "password": "securepassword",
    "phoneNumber": "1234567890"
}
```

### User Login
- Endpoint: `POST /api/auth/login`
- Request Body:
```json
{
    "email": "user@example.com",
    "password": "securepassword"
}
```

### Password Management
- Update Password: `PUT /api/users/{id}/password`
- Request Body:
```json
{
    "newPassword": "newSecurePassword123"
}
```

## User Management

### Get All Users
- Endpoint: `GET /api/users`
- Returns: List of all users

### Get User by ID
- Endpoint: `GET /api/users/{id}`
- Returns: User details

### Update User
- Endpoint: `PUT /api/users/{id}`
- Request Body: User object with updated fields

### Update Current User Profile
- Endpoint: `PUT /api/users/profile`
- Request Body: User object with updated fields
- Allows authenticated users to update their own profile details

### Delete User
- Endpoint: `DELETE /api/users/{id}`

## Ticket Management

### Create Ticket
- Endpoint: `POST /api/tickets`
- Request Body:
```json
{
    "title": "Ticket Title",
    "description": "Ticket Description",
    "customer": {
        "id": 1
    },
    "product": {
        "id": 1
    },
    "type": {
        "id": 1
    }
}
```

### Get Tickets
- All Tickets: `GET /api/tickets`
  - Admin and Manager can view all tickets
  - Customers can view their own tickets
  - Engineers can view tickets they are assigned to
- By ID: `GET /api/tickets/{id}`
- By Customer: `GET /api/tickets/customer/{customerId}`
- By Engineer: `GET /api/tickets/engineer/{engineerId}`
- By Status: `GET /api/tickets/status/{status}`

### Update Ticket
- Endpoint: `PUT /api/tickets/{id}`
- Request Body: Ticket object with updated fields

### Delete Ticket
- Endpoint: `DELETE /api/tickets/{id}`
  - Only Admin and Manager roles can delete tickets

### Escalate Ticket
- Endpoint: `PUT /api/tickets/{id}/escalate`

## Engineer Management

### Get Engineers
- All Engineers: `GET /api/engineers`
- By ID: `GET /api/engineers/{id}`
- Available Engineers: `GET /api/engineers/available`

### Update Engineer
- Endpoint: `PUT /api/engineers/{id}`
- Request Body: Engineer object with updated fields

## Security Features
- Password encryption using BCrypt
- Role-based access control
- Session management
- Secure password updates

## Best Practices
1. Always use strong passwords
2. Keep your login credentials secure
3. Update passwords regularly
4. Use appropriate ticket categories and types
5. Escalate tickets when necessary
6. Maintain clear communication in ticket descriptions

## Error Handling
The system provides appropriate error responses for:
- Invalid credentials
- Missing or invalid data
- Resource not found
- Unauthorized access
- Invalid operations

## Support
For any issues or questions, please contact the system administrator.

## API Testing with Postman

### Setup
1. Download and install [Postman](https://www.postman.com/downloads/)
2. Create a new collection named "Support Ticket System"
3. Set up environment variables:
   - Create a new environment
   - Add variables:
     ```
     baseUrl: http://localhost:8080
     token: {{your_jwt_token}}
     ```

### Authentication
1. **Register a New User**
   - Method: POST
   - URL: `{{baseUrl}}/api/auth/register`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
       "name": "Test User",
       "email": "test@example.com",
       "password": "test123",
       "phoneNumber": "1234567890"
   }
   ```

2. **Login**
   - Method: POST
   - URL: `{{baseUrl}}/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
       "email": "test@example.com",
       "password": "test123"
   }
   ```
   - Save the JWT token from the response to your environment variable

### Testing Protected Endpoints
1. **Set Authorization Header**
   - Add a header to all protected requests:
   ```
   Authorization: Bearer {{token}}
   ```

2. **Example Ticket Creation**
   - Method: POST
   - URL: `{{baseUrl}}/api/tickets`
   - Headers:
     ```
     Content-Type: application/json
     Authorization: Bearer {{token}}
     ```
   - Body (raw JSON):
   ```json
   {
       "title": "Test Ticket",
       "description": "This is a test ticket",
       "customer": {
           "id": 1
       },
       "product": {
           "id": 1
       },
       "type": {
           "id": 1
       }
   }
   ```

### Common Test Cases
1. **Authentication Tests**
   - Test invalid credentials
   - Test missing token
   - Test expired token

2. **Ticket Management Tests**
   - Create ticket
   - Update ticket status
   - Escalate ticket
   - Delete ticket

3. **User Management Tests**
   - Update user details
   - Change password
   - Delete user

### Tips for Testing
1. Use environment variables for dynamic data
2. Create test scripts to automate token management
3. Use Postman's test scripts to validate responses
4. Save successful requests as examples
5. Use Postman's collection runner for batch testing

### Example Test Script
```javascript
// Add this to your request's "Tests" tab
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response time is less than 200ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(200);
});

// Save token from login response
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
}
```

### Troubleshooting
1. **Common Issues**
   - 401 Unauthorized: Check token validity
   - 400 Bad Request: Verify request body format
   - 404 Not Found: Check endpoint URL
   - 500 Server Error: Check server logs

2. **Debugging Tips**
   - Use Postman Console for detailed logs
   - Check request/response headers
   - Verify environment variables
   - Test with different user roles 

## Sample Data for Testing

### Pre-configured Users

1. **Admin User**
   - Email: admin@example.com
   - Password: admin123
   - Role: ADMIN

2. **Engineer Users**
   - Email: engineer1@example.com
   - Password: engineer123
   - Category: NETWORK
   - Level: 2
   - Max Tickets: 5

   - Email: engineer2@example.com
   - Password: engineer123
   - Category: SOFTWARE
   - Level: 1
   - Max Tickets: 3

3. **Customer Users**
   - Email: customer1@example.com
   - Password: customer123
   - Role: PREMIUM

   - Email: customer2@example.com
   - Password: customer123
   - Role: BASIC

### Sample Tickets

1. **Network Issue Ticket**
   - Title: "VPN Connection Problem"
   - Description: "Cannot connect to company VPN"
   - Status: OPEN
   - Urgency: PREMIUM
   - Customer: customer1@example.com
   - Engineer: engineer1@example.com

2. **Software Issue Ticket**
   - Title: "Application Crash"
   - Description: "Application crashes when opening large files"
   - Status: IN_PROGRESS
   - Urgency: BASIC
   - Customer: customer2@example.com
   - Engineer: engineer2@example.com

### Testing Workflow

1. **Login as Different Users**
   ```json
   // Admin Login
   {
       "email": "admin@example.com",
       "password": "admin123"
   }

   // Engineer Login
   {
       "email": "engineer1@example.com",
       "password": "engineer123"
   }

   // Customer Login
   {
       "email": "customer1@example.com",
       "password": "customer123"
   }
   ```

2. **Test Different Scenarios**

   a. **Customer Scenario**
   - Login as customer1@example.com
   - Create a new ticket
   - View your tickets
   - Update ticket status

   b. **Engineer Scenario**
   - Login as engineer1@example.com
   - View assigned tickets
   - Update ticket status
   - Escalate ticket if needed

   c. **Admin Scenario**
   - Login as admin@example.com
   - View all tickets
   - Manage users
   - View system statistics

3. **Sample API Calls**

   a. **Create Ticket (Customer)**
   ```json
   {
       "title": "New Network Issue",
       "description": "Cannot access shared drives",
       "customer": {
           "id": 1
       },
       "product": {
           "id": 1
       },
       "type": {
           "id": 1
       }
   }
   ```

   b. **Update Ticket (Engineer)**
   ```json
   {
       "status": "IN_PROGRESS",
       "description": "Investigating network connectivity issues"
   }
   ```

   c. **Escalate Ticket**
   ```json
   {
       "status": "ESCALATED",
       "description": "Requires senior engineer attention"
   }
   ```

### Testing Tips

1. **Use Different User Types**
   - Test all features as different user roles
   - Verify access control restrictions
   - Check role-specific functionality

2. **Test Error Cases**
   - Invalid credentials
   - Unauthorized access attempts
   - Invalid ticket updates
   - Missing required fields

3. **Verify Data Integrity**
   - Check ticket assignments
   - Verify engineer workload
   - Confirm customer ticket history 

## Admin Login Guide

### Admin Credentials
- Email: admin@example.com
- Password: admin123

### Login Process

1. **Using Postman**
   - Method: POST
   - URL: `http://localhost:8080/api/auth/login`
   - Headers:
     ```
     Content-Type: application/json
     ```
   - Request Body:
   ```json
   {
       "email": "admin@example.com",
       "password": "admin123"
   }
   ```

2. **Expected Response**
   ```json
   {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "type": "Bearer",
       "id": 1,
       "email": "admin@example.com",
       "roles": ["ROLE_ADMIN"]
   }
   ```

3. **Using the Token**
   - Copy the token from the response
   - Add it to subsequent requests as a header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Admin Features Access

After successful login, you can access these admin-only endpoints:

1. **User Management**
   - Get all users: `GET /api/users`
   - Create user: `POST /api/users`
   - Update user: `PUT /api/users/{id}`
   - Delete user: `DELETE /api/users/{id}`

2. **System Management**
   - View all tickets: `GET /api/tickets`
   - View all engineers: `GET /api/engineers`
   - View all customers: `GET /api/customers`
   - View system statistics: `GET /api/admin/stats`

### Example Admin API Calls

1. **View All Users**
   ```
   GET http://localhost:8080/api/users
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Create New User**
   ```
   POST http://localhost:8080/api/users
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json

   {
       "name": "New User",
       "email": "newuser@example.com",
       "password": "newpassword123",
       "phoneNumber": "1234567890"
   }
   ```

3. **View System Statistics**
   ```
   GET http://localhost:8080/api/admin/stats
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Troubleshooting Admin Login

1. **Common Issues**
   - 401 Unauthorized: Check if token is valid and not expired
   - 403 Forbidden: Verify admin role is properly assigned
   - 400 Bad Request: Check request body format

2. **Solutions**
   - If token expired, login again to get a new token
   - Verify admin credentials are correct
   - Check if the admin user exists in the database
   - Ensure proper headers are set

3. **Security Notes**
   - Keep admin credentials secure
   - Don't share admin tokens
   - Use HTTPS in production
   - Log out after completing admin tasks 

## System Initialization

The system automatically initializes with the following data when started:

### Initial Users
1. **Admin User**
   - Email: admin@example.com
   - Password: admin123
   - Role: ADMIN

2. **Engineer Users**
   - Email: engineer1@example.com
   - Password: engineer123
   - Category: NETWORK
   - Level: 2
   - Max Tickets: 5

   - Email: engineer2@example.com
   - Password: engineer123
   - Category: SOFTWARE
   - Level: 1
   - Max Tickets: 3

3. **Customer Users**
   - Email: customer1@example.com
   - Password: customer123
   - Role: PREMIUM

   - Email: customer2@example.com
   - Password: customer123
   - Role: BASIC

### Initial Products
1. Product 1
   - Name: Network Services
   - Description: Network-related services and support

2. Product 2
   - Name: Software Solutions
   - Description: Software-related services and support

### Initial Ticket Types
1. Type 1
   - Name: Technical Support
   - Description: General technical support issues

2. Type 2
   - Name: Bug Report
   - Description: Software bug reports and fixes

## Accessing the System

The system is running on port 8081 (not 8080 as previously mentioned). Update your API calls accordingly:

### Base URL
```
http://localhost:8081
```

### Example Login Request
```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
    "email": "admin@example.com",
    "password": "admin123"
}
```

### Example Admin API Calls
1. **View All Users**
   ```
   GET http://localhost:8081/api/users
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Create New User**
   ```
   POST http://localhost:8081/api/users
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json

   {
       "name": "New User",
       "email": "newuser@example.com",
       "password": "newpassword123",
       "phoneNumber": "1234567890"
   }
   ```

3. **View System Statistics**
   ```
   GET http://localhost:8081/api/admin/stats
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### System Status
- Application started successfully
- JPA EntityManagerFactory initialized
- Security filters configured
- Tomcat running on port 8081
- Database tables created and populated with initial data 