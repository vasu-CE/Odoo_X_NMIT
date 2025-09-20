// API service for authentication
import apiService from '../services/api.js';

export const findUserByCredentials = async (email, password) => {
  try {
    const response = await apiService.login(email, password);
    if (response.success) {
      return {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name,
        role: response.data.user.role,
        token: response.data.token
      };
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

export const findUserByLoginId = async (loginId) => {
  // For now, we'll use email as loginId since our backend uses email
  return findUserByEmail(loginId);
};

export const findUserByEmail = async (email) => {
  try {
    // We can't check if user exists without authentication
    // This is mainly for validation purposes
    return null;
  } catch (error) {
    console.error('Find user error:', error);
    return null;
  }
};

export const addUser = async (userData) => {
  try {
    const response = await apiService.register({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'SHOP_FLOOR_OPERATOR' // Default role
    });
    
    if (response.success) {
      return {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name,
        role: response.data.user.role,
        token: response.data.token
      };
    }
    return null;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await apiService.getUsers();
    return response.success ? response.data.users : [];
  } catch (error) {
    console.error('Get users error:', error);
    return [];
  }
};
