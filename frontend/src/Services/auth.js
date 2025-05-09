/**
 * Authentication service for managing user authentication state
 */

// Keys used for storing auth data in localStorage
const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';
const NAME_KEY = 'name';
const USER_ID_KEY = 'userId';
const EMAIL_KEY = 'email';
const CREATED_AT_KEY = 'createdAt';
const PHONE_NUMBER_KEY = 'phoneNumber';

// Base API URL
const API_BASE_URL = 'http://localhost:8082/api';

/**
 * Store user data in localStorage
 * @param {Object} userData - User data object
 * @returns {boolean} - Success status
 */
const storeUserData = (userData) => {
  localStorage.setItem(TOKEN_KEY, userData.token || 'mock-jwt-token-' + Math.random());
  localStorage.setItem(ROLE_KEY, userData.role);
  localStorage.setItem(NAME_KEY, userData.name);
  localStorage.setItem(USER_ID_KEY, userData.id);
  localStorage.setItem(EMAIL_KEY, userData.email);
  
  if (userData.createdAt) {
    localStorage.setItem(CREATED_AT_KEY, userData.createdAt);
  }
  
  if (userData.phoneNumber) {
    localStorage.setItem(PHONE_NUMBER_KEY, userData.phoneNumber);
  }
  
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('authChange'));
  
  return true;
};

/**
 * Clear user data from localStorage
 */
const clearUserData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(CREATED_AT_KEY);
  localStorage.removeItem(PHONE_NUMBER_KEY);
  
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('authChange'));
};

/**
 * Check if a user is currently logged in
 * @returns {boolean} - True if logged in, false otherwise
 */
const isLoggedIn = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

/**
 * Get the current user's authentication token
 * @returns {string|null} - The token or null if not logged in
 */
const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get the current user object from localStorage
 * @returns {Object|null} - User object or null if not logged in
 */
const getCurrentUser = () => {
  if (!isLoggedIn()) {
    return null;
  }
  
  return {
    name: localStorage.getItem(NAME_KEY),
    role: localStorage.getItem(ROLE_KEY),
    userId: localStorage.getItem(USER_ID_KEY),
    email: localStorage.getItem(EMAIL_KEY),
    createdAt: localStorage.getItem(CREATED_AT_KEY),
    phoneNumber: localStorage.getItem(PHONE_NUMBER_KEY)
  };
};

/**
 * Check if the current user has a specific role
 * @param {string} role - The role to check
 * @returns {boolean} - True if user has the role, false otherwise
 */
const hasRole = (role) => {
  return localStorage.getItem(ROLE_KEY) === role;
};

/**
 * Login function that uses the API
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Promise that resolves with user data or rejects with error
 */
const apiLogin = async (email, password) => {
  try {
    // Call the API login endpoint
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Invalid email or password`);
    }

    const userData = await response.json();
    
    // Store user data in localStorage
    storeUserData(userData);
    
    return userData;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * Register a new user
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} role - User's role (defaults to "CUSTOMER")
 * @returns {Promise} - Promise that resolves with user data or rejects with error
 */
const apiRegister = async (name, email, password, role = "CUSTOMER") => {
  try {
    // Call the API register endpoint
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Registration failed`);
    }

    const userData = await response.json();
    
    // Store user data in localStorage
    storeUserData(userData);
    
    return userData;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

/**
 * Logout function
 */
const apiLogout = () => {
  clearUserData();
};

// Export authentication functions
const auth = {
  login: apiLogin,
  register: apiRegister, // Add the register function
  logout: apiLogout,
  isLoggedIn,
  getToken,
  getCurrentUser,
  hasRole,
  isAdmin: () => hasRole('ADMIN'),
  isManager: () => hasRole('MANAGER'),
  isEngineer: () => hasRole('ENGINEER'),
  isCustomer: () => hasRole('CUSTOMER')
};


export default auth;
