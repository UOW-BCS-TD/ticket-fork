import auth from './auth';

// Base API URL - replace with your actual backend URL
const API_BASE_URL = '/api';

/**
 * Generic API request function with authentication
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} data - Request body data
 * @returns {Promise} - Promise that resolves with response data
 */
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization header if user is logged in
  const token = auth.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
    credentials: 'include', // Include cookies for cross-origin requests if needed
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    
    // Check if the connection is working
    if (!response.ok) {
      // Handle specific error status codes
      if (response.status === 401) {
        // Unauthorized - token might be expired
        auth.logout();
        throw new Error('Your session has expired. Please login again.');
      }
      
      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      }
      
      if (response.status === 404) {
        throw new Error('The requested resource was not found.');
      }
      
      // Try to get error details from response
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 
        `Request failed with status ${response.status}`
      );
    }
    
    // For DELETE requests that don't return content
    if (method === 'DELETE' && response.status === 204) {
      return { success: true };
    }
    
    // Parse JSON response
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Simple connection check
 * @returns {Promise<boolean>} - Promise that resolves with connection status
 */
const checkConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'HEAD',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch (error) {
    console.error('API connection check failed:', error);
    return false;
  }
};

/**
 * Log API data to console based on API documentation
 */
/**
 * Log API data to console based on API documentation
 */
const logApiData = async () => {
  console.log('%c🔍 API Data Explorer - Live Data', 'color: blue; font-weight: bold; font-size: 16px');
  
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      console.log('%c❌ API Connection Failed', 'color: red; font-weight: bold');
      return;
    }
    
    console.log('%c✅ API Connected', 'color: green; font-weight: bold');
    
    // Only proceed with actual API calls if user is authenticated
    if (!auth.isLoggedIn()) {
      console.log('%c⚠️ Not authenticated - login to see actual data', 'color: orange; font-weight: bold');
      return;
    }
    
    // Authentication data
    console.log('%c🔐 Authentication', 'color: #0066cc; font-weight: bold; font-size: 14px');
    console.log('%c(Authentication data not shown for security reasons)', 'color: #666');
    
    // User data
    console.log('%c👤 User Data', 'color: #0066cc; font-weight: bold; font-size: 14px');
    
    try {
      const currentUser = await apiRequest('/users/profile');
      console.log('%c/api/users/profile (Current User):', 'color: #666; font-weight: bold');
      console.log(currentUser);
    } catch (error) {
      console.log('%c⚠️ Could not fetch current user profile', 'color: orange');
      console.error(error);
    }
    
    if (auth.isAdmin() || auth.isManager()) {
      try {
        const allUsers = await apiRequest('/users');
        console.log('%c/api/users (All Users):', 'color: #666; font-weight: bold');
        console.log(allUsers);
      } catch (error) {
        console.log('%c⚠️ Could not fetch all users', 'color: orange');
        console.error(error);
      }
      
      // Sample user by ID (using first user ID if available)
      try {
        const allUsers = await apiRequest('/users');
        if (allUsers && allUsers.length > 0) {
          const sampleUserId = allUsers[0].id;
          const userById = await apiRequest(`/users/${sampleUserId}`);
          console.log(`%c/api/users/${sampleUserId} (User by ID):`, 'color: #666; font-weight: bold');
          console.log(userById);
        }
      } catch (error) {
        console.log('%c⚠️ Could not fetch user by ID', 'color: orange');
        console.error(error);
      }
    }
    
    // Ticket data
    // console.log('%c🎫 Ticket Data', 'color: #0066cc; font-weight: bold; font-size: 14px');
    
    // try {
    //   const allTickets = await apiRequest('/tickets');
    //   console.log('%c/api/tickets (All Tickets):', 'color: #666; font-weight: bold');
    //   console.log(allTickets);
      
    //   // Sample ticket by ID (using first ticket ID if available)
    //   if (allTickets && allTickets.length > 0) {
    //     const sampleTicketId = allTickets[0].id;
    //     try {
    //       const ticketById = await apiRequest(`/tickets/${sampleTicketId}`);
    //       console.log(`%c/api/tickets/${sampleTicketId} (Ticket by ID):`, 'color: #666; font-weight: bold');
    //       console.log(ticketById);
    //     } catch (error) {
    //       console.log('%c⚠️ Could not fetch ticket by ID', 'color: orange');
    //       console.error(error);
    //     }
    //   }
      
    //   // Get tickets by status
    //   try {
    //     const openTickets = await apiRequest('/tickets/status/OPEN');
    //     console.log('%c/api/tickets/status/OPEN (Open Tickets):', 'color: #666; font-weight: bold');
    //     console.log(openTickets);
    //   } catch (error) {
    //     console.log('%c⚠️ Could not fetch tickets by status', 'color: orange');
    //     console.error(error);
    //   }
      
    //   // Get tickets by urgency
    //   try {
    //     const priorityTickets = await apiRequest('/tickets/urgency/PRIORITY');
    //     console.log('%c/api/tickets/urgency/PRIORITY (Priority Tickets):', 'color: #666; font-weight: bold');
    //     console.log(priorityTickets);
    //   } catch (error) {
    //     console.log('%c⚠️ Could not fetch tickets by urgency', 'color: orange');
    //     console.error(error);
    //   }
      
    //   // Get tickets by customer
    //   const currentUserData = await apiRequest('/users/profile');
    //   if (currentUserData && currentUserData.id) {
    //     try {
    //       const customerTickets = await apiRequest(`/tickets/customer/${currentUserData.id}`);
    //       console.log(`%c/api/tickets/customer/${currentUserData.id} (Current User's Tickets):`, 'color: #666; font-weight: bold');
    //       console.log(customerTickets);
    //     } catch (error) {
    //       console.log('%c⚠️ Could not fetch tickets by customer', 'color: orange');
    //       console.error(error);
    //     }
    //   }
    // } catch (error) {
    //   console.log('%c⚠️ Could not fetch tickets', 'color: orange');
    //   console.error(error);
    // }
    
    // Customer data
    if (auth.isAdmin() || auth.isManager()) {
      console.log('%c🧑‍💼 Customer Data', 'color: #0066cc; font-weight: bold; font-size: 14px');
      
      try {
        const allCustomers = await apiRequest('/customers');
        console.log('%c/api/customers (All Customers):', 'color: #666; font-weight: bold');
        console.log(allCustomers);
        
        // Sample customer by ID (using first customer ID if available)
        if (allCustomers && allCustomers.length > 0) {
          const sampleCustomerId = allCustomers[0].id;
          try {
            const customerById = await apiRequest(`/customers/${sampleCustomerId}`);
            console.log(`%c/api/customers/${sampleCustomerId} (Customer by ID):`, 'color: #666; font-weight: bold');
            console.log(customerById);
          } catch (error) {
            console.log('%c⚠️ Could not fetch customer by ID', 'color: orange');
            console.error(error);
          }
          
          // Sample customer by email
          if (allCustomers[0].email) {
            try {
              const customerByEmail = await apiRequest(`/customers/email/${encodeURIComponent(allCustomers[0].email)}`);
              console.log(`%c/api/customers/email/${allCustomers[0].email} (Customer by Email):`, 'color: #666; font-weight: bold');
              console.log(customerByEmail);
            } catch (error) {
              console.log('%c⚠️ Could not fetch customer by email', 'color: orange');
              console.error(error);
            }
          }
        }
      } catch (error) {
        console.log('%c⚠️ Could not fetch customers', 'color: orange');
        console.error(error);
      }
    }
    
    // Engineer data
    if (auth.isAdmin() || auth.isManager()) {
      console.log('%c👨‍🔧 Engineer Data', 'color: #0066cc; font-weight: bold; font-size: 14px');
      
      try {
        const allEngineers = await apiRequest('/engineers');
        console.log('%c/api/engineers (All Engineers):', 'color: #666; font-weight: bold');
        console.log(allEngineers);
        
        // Sample engineer by ID (using first engineer ID if available)
        if (allEngineers && allEngineers.length > 0) {
          const sampleEngineerId = allEngineers[0].id;
          try {
            const engineerById = await apiRequest(`/engineers/${sampleEngineerId}`);
            console.log(`%c/api/engineers/${sampleEngineerId} (Engineer by ID):`, 'color: #666; font-weight: bold');
            console.log(engineerById);
          } catch (error) {
            console.log('%c⚠️ Could not fetch engineer by ID', 'color: orange');
            console.error(error);
          }
          
          // Sample engineer by email
          if (allEngineers[0].email) {
            try {
              const engineerByEmail = await apiRequest(`/engineers/email/${encodeURIComponent(allEngineers[0].email)}`);
              console.log(`%c/api/engineers/email/${allEngineers[0].email} (Engineer by Email):`, 'color: #666; font-weight: bold');
              console.log(engineerByEmail);
            } catch (error) {
              console.log('%c⚠️ Could not fetch engineer by email', 'color: orange');
              console.error(error);
            }
          }
        }
        
        // Get available engineers
        try {
          const availableEngineers = await apiRequest('/engineers/available');
          console.log('%c/api/engineers/available (Available Engineers):', 'color: #666; font-weight: bold');
          console.log(availableEngineers);
        } catch (error) {
          console.log('%c⚠️ Could not fetch available engineers', 'color: orange');
          console.error(error);
        }
        
        // Get engineers by category
        try {
          const softwareEngineers = await apiRequest('/engineers/category/SOFTWARE');
          console.log('%c/api/engineers/category/SOFTWARE (Software Engineers):', 'color: #666; font-weight: bold');
          console.log(softwareEngineers);
        } catch (error) {
          console.log('%c⚠️ Could not fetch engineers by category', 'color: orange');
          console.error(error);
        }
      } catch (error) {
        console.log('%c⚠️ Could not fetch engineers', 'color: orange');
        console.error(error);
      }
    }
    
    // Session data
    if (auth.isAdmin() || auth.isManager()) {
      console.log('%c🔄 Session Data', 'color: #0066cc; font-weight: bold; font-size: 14px');
      
      try {
        const allSessions = await apiRequest('/sessions');
        console.log('%c/api/sessions (All Sessions):', 'color: #666; font-weight: bold');
        console.log(allSessions);
        
        // Sample session by ID (using first session ID if available)
        if (allSessions && allSessions.length > 0) {
          const sampleSessionId = allSessions[0].id;
          try {
            const sessionById = await apiRequest(`/sessions/${sampleSessionId}`);
            console.log(`%c/api/sessions/${sampleSessionId} (Session by ID):`, 'color: #666; font-weight: bold');
            console.log(sessionById);
          } catch (error) {
            console.log('%c⚠️ Could not fetch session by ID', 'color: orange');
            console.error(error);
          }
          
          // Sample session by session ID
          if (allSessions[0].sessionId) {
            try {
              const sessionBySessionId = await apiRequest(`/sessions/session/${allSessions[0].sessionId}`);
              console.log(`%c/api/sessions/session/${allSessions[0].sessionId} (Session by Session ID):`, 'color: #666; font-weight: bold');
              console.log(sessionBySessionId);
            } catch (error) {
              console.log('%c⚠️ Could not fetch session by session ID', 'color: orange');
              console.error(error);
            }
          }
        }
        
        // Get inactive sessions
        try {
          const inactiveSessions = await apiRequest('/sessions/inactive');
          console.log('%c/api/sessions/inactive (Inactive Sessions):', 'color: #666; font-weight: bold');
          console.log(inactiveSessions);
        } catch (error) {
          console.log('%c⚠️ Could not fetch inactive sessions', 'color: orange');
          console.error(error);
        }
        
        // Get sessions by user
        const currentUserData = await apiRequest('/users/profile');
        if (currentUserData && currentUserData.id) {
          try {
            const userSessions = await apiRequest(`/sessions/user/${currentUserData.id}`);
            console.log(`%c/api/sessions/user/${currentUserData.id} (Current User's Sessions):`, 'color: #666; font-weight: bold');
            console.log(userSessions);
          } catch (error) {
            console.log('%c⚠️ Could not fetch sessions by user', 'color: orange');
            console.error(error);
          }
        }
      } catch (error) {
        console.log('%c⚠️ Could not fetch sessions', 'color: orange');
        console.error(error);
      }
    }
    
    console.log('%c✅ API Data Explorer Complete', 'color: green; font-weight: bold; font-size: 14px');
    
  } catch (error) {
    console.error('Error exploring API data:', error);
  }
};


// Authentication API
const authAPI = {
  login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
  register: (userData) => apiRequest('/auth/register', 'POST', userData),
};

// User API
const userAPI = {
  getAllUsers: () => apiRequest('/users'),
  getUserById: (id) => apiRequest(`/users/${id}`),
  getCurrentUserProfile: () => apiRequest('/users/profile'),
  createUser: (userData) => apiRequest('/users', 'POST', userData),
  updateUser: (id, userData) => apiRequest(`/users/${id}`, 'PUT', userData),
  updatePassword: (id, passwordData) => apiRequest(`/users/${id}/password`, 'PUT', passwordData),
  deleteUser: (id) => apiRequest(`/users/${id}`, 'DELETE'),
  updateCurrentUserProfile: (userData) => apiRequest('/users/profile', 'PUT', userData),
};

// Ticket API
const ticketAPI = {
  getAllTickets: () => apiRequest('/tickets'),
  getTicketById: (id) => apiRequest(`/tickets/${id}`),
  createTicket: (ticketData) => apiRequest('/tickets', 'POST', ticketData),
  updateTicket: (id, ticketData) => apiRequest(`/tickets/${id}`, 'PUT', ticketData),
  deleteTicket: (id) => apiRequest(`/tickets/${id}`, 'DELETE'),
  getTicketsByCustomer: (customerId) => apiRequest(`/tickets/customer/${customerId}`),
  getTicketsByEngineer: (engineerId) => apiRequest(`/tickets/engineer/${engineerId}`),
  getTicketsByStatus: (status) => apiRequest(`/tickets/status/${status}`),
  getTicketsByUrgency: (urgency) => apiRequest(`/tickets/urgency/${urgency}`),
  getTicketsByProduct: (productId) => apiRequest(`/tickets/product/${productId}`),
  getTicketsByType: (typeId) => apiRequest(`/tickets/type/${typeId}`),
  updateTicketStatus: (id, statusData) => apiRequest(`/tickets/status/${id}`, 'PUT', statusData),
  updateTicketUrgency: (id, urgencyData) => apiRequest(`/tickets/urgency/${id}`, 'PUT', urgencyData),
  updateTicketProduct: (id, productData) => apiRequest(`/tickets/product/${id}`, 'PUT', productData),
  updateTicketType: (id, typeData) => apiRequest(`/tickets/type/${id}`, 'PUT', typeData),
  escalateTicket: (id) => apiRequest(`/tickets/${id}/escalate`, 'PUT'),
};

// Customer API
const customerAPI = {
  getAllCustomers: () => apiRequest('/customers'),
  getCustomerById: (id) => apiRequest(`/customers/${id}`),
  getCustomerByEmail: (email) => apiRequest(`/customers/email/${email}`),
  createCustomer: (customerData) => apiRequest('/customers', 'POST', customerData),
  updateCustomerRole: (id, roleData) => apiRequest(`/customers/${id}/role`, 'PUT', roleData),
  deleteCustomer: (id) => apiRequest(`/customers/${id}`, 'DELETE'),
};

// Engineer API
const engineerAPI = {
  getAllEngineers: () => apiRequest('/engineers'),
  getEngineerById: (id) => apiRequest(`/engineers/${id}`),
  getEngineerByEmail: (email) => apiRequest(`/engineers/email/${email}`),
  getEngineersByCategory: (categoryId) => apiRequest(`/engineers/category/${categoryId}`),
  getAvailableEngineers: () => apiRequest('/engineers/available'),
  createEngineer: (engineerData) => apiRequest('/engineers/create', 'POST', engineerData),
  updateEngineer: (id, engineerData) => apiRequest(`/engineers/${id}`, 'PUT', engineerData),
  deleteEngineer: (id) => apiRequest(`/engineers/${id}`, 'DELETE'),
};

// Session API
const sessionAPI = {
  getAllSessions: () => apiRequest('/sessions'),
  getSessionById: (id) => apiRequest(`/sessions/${id}`),
  getSessionBySessionId: (sessionId) => apiRequest(`/sessions/session/${sessionId}`),
  getSessionsByUser: (userId) => apiRequest(`/sessions/user/${userId}`),
  getInactiveSessions: () => apiRequest('/sessions/inactive'),
  endSession: (id) => apiRequest(`/sessions/${id}/end`, 'PUT'),
  updateSessionActivity: (id) => apiRequest(`/sessions/${id}/activity`, 'PUT'),
  createSession: (sessionData) => apiRequest('/sessions', 'POST', sessionData),
};

/**
 * Initialize API and check connection
 */
const initialize = async () => {
  const isConnected = await checkConnection();
  if (isConnected) {
    console.log('%c✅ API Connected', 'color: green; font-weight: bold');
    // Log actual API data when the page loads
    logApiData();
  } else {
    console.log('%c❌ API Connection Failed', 'color: red; font-weight: bold');
  }
};


// Export all API functions
const api = {
  auth: authAPI,
  users: userAPI,
  tickets: ticketAPI,
  customers: customerAPI,
  engineers: engineerAPI,
  sessions: sessionAPI,
  checkConnection,
  logApiData,
  initialize
};

// Initialize API when the module is loaded
initialize();

export default api;
