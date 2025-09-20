export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasValidLength = password.length >= 8;
  
  return hasUppercase && hasLowercase && hasNumber && hasSpecialChar && hasValidLength;
};

export const validateLoginId = (loginId) => {
  return loginId.length >= 6 && loginId.length <= 12;
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};
