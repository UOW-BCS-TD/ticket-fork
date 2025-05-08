// Configuration constants
const AUTH_CONFIG = {
  BASE_URL: 'http://localhost:8082/api/auth',
  HEADERS: {
    'Content-Type': 'application/json',
  },
  STORAGE_KEYS: {
    TOKEN: 'token',
    USER: 'user'
  },
  ROLES: {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    ENGINEER: 'ENGINEER',
    CUSTOMER: 'CUSTOMER'
  }
};

// Storage utility functions
const storage = {
  get: (key) => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, value),
  remove: (key) => localStorage.removeItem(key),
  getObject: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  setObject: (key, value) => localStorage.setItem(key, JSON.stringify(value))
};

// Helper function for making fetch requests to auth endpoints
const fetchAuth = async (endpoint, options = {}) => {
  const url = `${AUTH_CONFIG.BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = { ...AUTH_CONFIG.HEADERS };
  
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
    
    // Check if response is ok (status in the range 200-299)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Auth request failed with status ${response.status}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Auth request failed:', error);
    throw error;
  }
};

// Authentication service
const authService = {
  // Login user and get JWT token
  login: async (email, password) => {
    try {
      const data = await fetchAuth('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (data) {
        if (data.token) {
          storage.set(AUTH_CONFIG.STORAGE_KEYS.TOKEN, data.token);
        }
        
        if (data.user) {
          storage.setObject(AUTH_CONFIG.STORAGE_KEYS.USER, data.user);
        }
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  // Register a new user
  register: async (userData) => {
    try {
      const data = await fetchAuth('/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  // Logout user
  logout: () => {
    storage.remove(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
    storage.remove(AUTH_CONFIG.STORAGE_KEYS.USER);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));
  },
  
  // Get current user from localStorage
  getCurrentUser: () => storage.getObject(AUTH_CONFIG.STORAGE_KEYS.USER),
  
  // Check if user is logged in
  isLoggedIn: () => !!storage.get(AUTH_CONFIG.STORAGE_KEYS.TOKEN),
  
  // Get token from localStorage
  getToken: () => storage.get(AUTH_CONFIG.STORAGE_KEYS.TOKEN),
  
  // Check if user has specific role
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user && user.role === role;
  },
  
  // Role-specific checkers
  isAdmin: () => authService.hasRole(AUTH_CONFIG.ROLES.ADMIN),
  
  isManager: () => authService.hasRole(AUTH_CONFIG.ROLES.MANAGER),
  
  isEngineer: () => authService.hasRole(AUTH_CONFIG.ROLES.ENGINEER),
  
  isCustomer: () => authService.hasRole(AUTH_CONFIG.ROLES.CUSTOMER),
  
  // Get user role display name
  getUserRoleDisplay: () => {
    const user = authService.getCurrentUser();
    if (!user) return null;
    
    switch(user.role) {
      case AUTH_CONFIG.ROLES.ADMIN:
        return 'Administrator';
      case AUTH_CONFIG.ROLES.MANAGER:
        return 'Support Manager';
      case AUTH_CONFIG.ROLES.ENGINEER:
        return 'Support Engineer';
      case AUTH_CONFIG.ROLES.CUSTOMER:
        return 'Customer';
      default:
        return user.role;
    }
  }
};

export default authService;
