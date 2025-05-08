// Configuration constants
const API_CONFIG = {
  BASE_URL: 'http://localhost:8082/api',
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Helper function for making fetch requests
const fetchWithAuth = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = { ...API_CONFIG.HEADERS };
  
  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  // Merge options
  const fetchOptions = {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Handle unauthorized access
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized access');
    }
    
    // Check if response is ok (status in the range 200-299)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Generic service factory
const createService = (basePath) => ({
  getAll: () => fetchWithAuth(basePath, { method: 'GET' }),
  getById: (id) => fetchWithAuth(`${basePath}/${id}`, { method: 'GET' }),
  create: (data) => fetchWithAuth(basePath, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id, data) => fetchWithAuth(`${basePath}/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id) => fetchWithAuth(`${basePath}/${id}`, { method: 'DELETE' }),
  customRequest: (method, path, data = null) => {
    const options = { method };
    if (data) {
      options.body = JSON.stringify(data);
    }
    return fetchWithAuth(`${basePath}${path}`, options);
  }
});

// User service
const userService = {
  ...createService('/users'),
  getCurrentProfile: () => fetchWithAuth('/users/profile', { method: 'GET' }),
  updatePassword: (id, passwordData) => fetchWithAuth(`/users/${id}/password`, { 
    method: 'PUT', 
    body: JSON.stringify(passwordData) 
  }),
  updateCurrentProfile: (userData) => fetchWithAuth('/users/profile', { 
    method: 'PUT', 
    body: JSON.stringify(userData) 
  }),
};

// Ticket service
const ticketService = {
  ...createService('/tickets'),
  getByCustomer: (customerId) => fetchWithAuth(`/tickets/customer/${customerId}`, { method: 'GET' }),
  getByEngineer: (engineerId) => fetchWithAuth(`/tickets/engineer/${engineerId}`, { method: 'GET' }),
  updateStatus: (id, statusData) => fetchWithAuth(`/tickets/status/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(statusData) 
  }),
  updateUrgency: (id, urgencyData) => fetchWithAuth(`/tickets/urgency/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(urgencyData) 
  }),
  updateProduct: (id, productData) => fetchWithAuth(`/tickets/product/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(productData) 
  }),
  updateType: (id, typeData) => fetchWithAuth(`/tickets/type/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(typeData) 
  }),
  escalate: (id) => fetchWithAuth(`/tickets/${id}/escalate`, { method: 'PUT' }),
};

// Customer service
const customerService = {
  ...createService('/customers'),
  getByEmail: (email) => fetchWithAuth(`/customers/email/${email}`, { method: 'GET' }),
  updateRole: (id, roleData) => fetchWithAuth(`/customers/${id}/role`, { 
    method: 'PUT', 
    body: JSON.stringify(roleData) 
  }),
};

// Engineer service
const engineerService = {
  ...createService('/engineers'),
  getByEmail: (email) => fetchWithAuth(`/engineers/email/${email}`, { method: 'GET' }),
  getByCategory: (categoryId) => fetchWithAuth(`/engineers/category/${categoryId}`, { method: 'GET' }),
  getAvailable: () => fetchWithAuth('/engineers/available', { method: 'GET' }),
  create: (engineerData) => fetchWithAuth('/engineers/create', { 
    method: 'POST', 
    body: JSON.stringify(engineerData) 
  }),
};

// Session service
const sessionService = {
  ...createService('/sessions'),
  getBySessionId: (sessionId) => fetchWithAuth(`/sessions/session/${sessionId}`, { method: 'GET' }),
  getByUser: (userId) => fetchWithAuth(`/sessions/user/${userId}`, { method: 'GET' }),
  getInactive: () => fetchWithAuth('/sessions/inactive', { method: 'GET' }),
  end: (id) => fetchWithAuth(`/sessions/${id}/end`, { method: 'PUT' }),
  updateActivity: (id) => fetchWithAuth(`/sessions/${id}/activity`, { method: 'PUT' }),
};

export {
  fetchWithAuth,
  userService,
  ticketService,
  customerService,
  engineerService,
  sessionService,
};
