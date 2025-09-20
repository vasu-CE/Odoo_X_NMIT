// Mock database - in production this would be a real API
let mockDatabase = [
  {
    loginId: 'admin123',
    email: 'admin@example.com',
    password: 'Admin@123'
  },
  {
    loginId: 'testuser',
    email: 'test@example.com',
    password: 'Test@123'
  }
];

export const findUserByCredentials = (loginId, password) => {
  return mockDatabase.find(user => 
    user.loginId === loginId && user.password === password
  );
};

export const findUserByLoginId = (loginId) => {
  return mockDatabase.find(user => user.loginId === loginId);
};

export const findUserByEmail = (email) => {
  return mockDatabase.find(user => user.email === email);
};

export const addUser = (userData) => {
  mockDatabase.push(userData);
  return userData;
};

export const getAllUsers = () => {
  return mockDatabase;
};
