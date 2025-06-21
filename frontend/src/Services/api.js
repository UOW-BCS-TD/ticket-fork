import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',  // Use relative path for production (Nginx will proxy to backend)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  // Login user and get JWT token
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      // Store token in localStorage for future requests
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration API error:', error.response?.data || error);
      throw error.response ? error.response.data : error;
    }
  },
};

// User management services
export const userService = {
  // Get current user profile
  getCurrentUserProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Update current user profile
  updateCurrentUserProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  updateCurrentUserPassword: async (passwordData) => {
    try {  
      const response = await api.put('/users/profile/password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get user by ID (admin only)
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create a new user (admin only)
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update user (admin only)
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update user password (admin only)
  updatePassword: async (id, passwordData) => {
    try {
      const response = await api.put(`/users/${id}/password`, passwordData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Ticket management services
export const ticketAPI = {
  // Get all tickets
  getTickets: async () => {
    try {
      const response = await api.get('/tickets');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  getTicketsOwn: async () => {
    try {
      const response = await api.get('/tickets/own');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get ticket by ID
  getTicketById: async (id) => {
    try {
      const response = await api.get(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    try {
      const response = await api.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update ticket
  updateTicket: async (id, ticketData) => {
    try {
      const response = await api.put(`/tickets/${id}`, ticketData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete ticket
  deleteTicket: async (id) => {
    try {
      const response = await api.delete(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update ticket status
  updateTicketStatus: async (id, status) => {
    try {
      const response = await api.put(`/tickets/${id}/status`, status);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update ticket urgency
  updateTicketUrgency: async (id, urgency) => {
    try {
      // Send as plain string, with Content-Type text/plain to avoid quotes
      const response = await api.put(`/tickets/${id}/urgency`, urgency, {
        headers: { 'Content-Type': 'text/plain' }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Assign engineer to ticket
  assignEngineer: async (id, engineerId) => {
    try {
      const response = await api.put(`/tickets/${id}/assign`, engineerId);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Escalate ticket
  escalateTicket: async (id) => {
    try {
      const response = await api.put(`/tickets/${id}/escalate`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Send a message to ticket history
  sendMessageToTicket: async (id, body) => {
    try {
      const response = await api.post(`/tickets/${id}/message`, body);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get tickets by manager category
  getTicketsByManagerCategory: async () => {
    try {
      const response = await api.get('/tickets/manager/category');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Product management services
export const productAPI = {
  // Get all products
  getProducts: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create new product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Ticket type management services
export const ticketTypeAPI = {
  // Get all ticket types
  getTicketTypes: async () => {
    try {
      const response = await api.get('/ticket-types');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get ticket type by ID
  getTicketTypeById: async (id) => {
    try {
      const response = await api.get(`/ticket-types/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create new ticket type
  createTicketType: async (typeData) => {
    try {
      const response = await api.post('/ticket-types', typeData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update ticket type
  updateTicketType: async (id, typeData) => {
    try {
      const response = await api.put(`/ticket-types/${id}`, typeData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete ticket type
  deleteTicketType: async (id) => {
    try {
      const response = await api.delete(`/ticket-types/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Session management services
export const sessionAPI = {
  // Get all sessions
  getSessions: async () => {
    try {
      const response = await api.get('/sessions');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  getSessionsList: async () => {
    try {
      const response = await api.get('/sessions/list');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get session by ID
  getSessionById: async (id) => {
    try {
      const response = await api.get(`/sessions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create new session
  createSession: async (sessionData) => {
    try {
      const response = await api.post('/sessions', sessionData);
      return response;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // End session
  endSession: async (id) => {
    try {
      const response = await api.put(`/sessions/${id}/end`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get session history (chatbot messages)
  getSessionHistory: async (id) => {
    try {
      const response = await api.get(`/sessions/${id}/history`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Engineer management services
export const engineerAPI = {
  // Get available level 1 engineer for a category
  getAvailableLevel1Engineer: async (category) => {
    try {
      // Get all available engineers for the category
      const response = await api.get(`/engineers/available/category/${category}`);
      // Filter for level 1
      const level1 = response.data.filter(e => e.level === 1);
      if (level1.length > 0) return level1[0];
      // Fallback: get all level 1 engineers and pick the one with the least tickets
      const allLevel1Response = await api.get('/engineers/level/1');
      if (Array.isArray(allLevel1Response.data) && allLevel1Response.data.length > 0) {
        // Find the engineer with the least currentTickets
        let minEngineer = allLevel1Response.data[0];
        for (const eng of allLevel1Response.data) {
          if (eng.currentTickets < minEngineer.currentTickets) minEngineer = eng;
        }
        return minEngineer;
      }
      return null;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Log management services
export const logService = {
  // Get all available log files
  getLogFiles: async () => {
    try {
      const response = await api.get('/logs/files');
      return response.data;
    } catch (error) {
      console.error("Error fetching log files:", error);
      throw error.response ? error.response.data : error;
    }
  },

  // Get logs from a specific file with optional filters
  getLogsFromFile: async (fileName, filters = {}) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.level && filters.level !== 'all') params.append('level', filters.level);
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', filters.limit);
      
      const url = `/logs/file/${encodeURIComponent(fileName)}?${params.toString()}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching logs:", error);
      throw error.response ? error.response.data : error;
    }
  },
};

// Chatbot services
export const chatbotAPI = {
  // Send a query to the chatbot
  sendQuery: async (query) => {
    try {
      // Use the Python backend via Nginx proxy
      const response = await axios.post('/chatapi/query', { query }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get chatbot history for a session
  getHistory: async (sessionId) => {
    try {
      const response = await api.get(`/chatbot/history/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default api;
