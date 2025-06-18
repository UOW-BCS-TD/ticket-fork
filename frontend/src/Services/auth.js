import { authService, userService } from './api';

// Authentication service functions
const authFunctions = {
  // Login user - aligned with backend JwtResponse structure
  login: async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      
      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);

        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        return {
          success: true,
          ...response
        };
      }
      
      console.error('No token in response:', response);
      return {
        success: false,
        message: 'Authentication failed: No token received'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid email or password.'
      };
    }
  },

  // Register new user - aligned with UserResponseDTO
  register: async (userData) => {
    try {
      if (!userData.email || !userData.password) {
        return {
          success: false,
          message: 'Email and password are required'
        };
      }

      if (userData.password !== userData.confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match'
        };
      }

      if (userData.password.length < 8) {
        return {
          success: false,
          message: 'Password must be at least 8 characters long'
        };
      }

      const { confirmPassword, ...dataToSend } = userData;
    
      const response = await authService.register(dataToSend);
      
      // Auto-login after successful registration (optional)
      if (response && !response.error) {
        try {
          await authFunctions.login(userData.email, userData.password);
        } catch (loginError) {
          console.warn('Auto-login after registration failed:', loginError);
        }
      }

      return {
        success: true,
        ...response
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current authenticated user
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined') {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  },

  // Get current user profile from API
  getCurrentUserProfile: async () => {
    try {
      // Get the user profile from the API using userService instead of authService
      const userProfile = await userService.getCurrentUserProfile();
      
      // // Update the user in localStorage with the latest data
      if (userProfile) {
        const currentUser = authFunctions.getCurrentUser();
        const updatedUser = { ...currentUser, ...userProfile };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return userProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update current user profile from API
  updateCurrentUserProfile: async (userData) => {
    try {
      // Update the user profile using the API
      const updatedProfile = await userService.updateCurrentUserProfile(userData);
      
      // Update the user in localStorage with the latest data
      if (updatedProfile) {
        const currentUser = authFunctions.getCurrentUser();
        const updatedUser = { ...currentUser, ...updatedProfile };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Change current user's password
  updateCurrentUserPassword: async (oldPassword, newPassword) => {
    try {
      // Create password change request object as expected by the backend
      const passwordChangeRequest = {
        oldPassword: oldPassword,
        newPassword: newPassword
      };

      // Call the API to update password
      const response = await userService.updateCurrentUserPassword(passwordChangeRequest);
      
      return {
        success: true,
        message: 'Password changed successfully',
        user: response
      };
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        message: error.message || 'Current password is incorrect.'
      };
    }
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  // Get authentication token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user has specific role
  hasRole: (role) => {
    const user = authFunctions.getCurrentUser();
    if (user && user.role) {
      return user.role === role;
    }
    return false;
  },

  // Check if user is admin
  isAdmin: () => {
    return authFunctions.hasRole('ADMIN');
  },

  // Check if user is manager
  isManager: () => {
    return authFunctions.hasRole('MANAGER');
  },

  // Check if user is engineer
  isEngineer: () => {
    return authFunctions.hasRole('ENGINEER');
  },

  // Check if user is customer
  isCustomer: () => {
    return authFunctions.hasRole('CUSTOMER');
  }
};

// User management functions
export const userManagement = {
  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      return await userService.getAllUsers();
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  // Get user by ID (admin only)
  getUserById: async (id) => {
    try {
      return await userService.getUserById(id);
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new user (admin only)
  createUser: async (userData) => {
    try {
      return await userService.createUser(userData);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user (admin only)
  updateUser: async (id, userData) => {
    try {
      return await userService.updateUser(id, userData);
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  },

  // Update user password (admin only)
  updatePassword: async (id, passwordData) => {
    try {
      return await userService.updatePassword(id, passwordData);
    } catch (error) {
      console.error(`Error updating password with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    try {
      return await userService.deleteUser(id);
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  },
};

export default authFunctions;
