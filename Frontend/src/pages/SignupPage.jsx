import React, { useState } from 'react';
import { toast } from 'sonner';
import AuthForm from '../components/AuthForm';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { 
  validateEmail, 
  validatePassword, 
  validateLoginId 
} from '../utils/validation';
import { 
  findUserByLoginId, 
  findUserByEmail, 
  addUser 
} from '../utils/database';

const SignupPage = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    loginId: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const { loginId, email, password, confirmPassword } = formData;

    // Check required fields
    if (!loginId || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return false;
    }

    // Validate Login ID
    if (!validateLoginId(loginId)) {
      toast.error('Invalid Login ID', {
        description: 'Login ID must be between 6-12 characters',
      });
      return false;
    }

    // Check if Login ID is unique
    if (findUserByLoginId(loginId)) {
      toast.error('Login ID already exists', {
        description: 'Please choose a different login ID',
      });
      return false;
    }

    // Validate Email
    if (!validateEmail(email)) {
      toast.error('Invalid Email', {
        description: 'Please enter a valid email address',
      });
      return false;
    }

    // Check if Email is unique
    if (findUserByEmail(email)) {
      toast.error('Email already exists', {
        description: 'This email is already registered',
      });
      return false;
    }

    // Validate Password
    if (!validatePassword(password)) {
      toast.error('Invalid Password', {
        description: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      });
      return false;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please make sure both passwords are identical',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const newUser = {
        loginId: formData.loginId,
        email: formData.email,
        password: formData.password
      };
      
      addUser(newUser);
      toast.success('Account created successfully!', {
        description: 'Please login with your new credentials',
      });
      setIsLoading(false);
      
      // Navigate to login page after successful signup
      setTimeout(() => {
        onNavigate('login');
      }, 1500);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <AuthForm title="Sign up Page">
      <div>
        <InputField
          label="Enter Login Id"
          value={formData.loginId}
          onChange={handleInputChange('loginId')}
          placeholder="6-12 characters"
          onKeyPress={handleKeyPress}
        />
        
        <InputField
          label="Enter Email Id"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          placeholder="Enter your email"
          onKeyPress={handleKeyPress}
        />
        
        <InputField
          label="Enter Password"
          value={formData.password}
          onChange={handleInputChange('password')}
          placeholder="Enter your password"
          showPasswordToggle={true}
          showPassword={showPasswords.password}
          onTogglePassword={() => togglePasswordVisibility('password')}
          onKeyPress={handleKeyPress}
        />
        
        <InputField
          label="Re-Enter Password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          placeholder="Re-enter your password"
          showPasswordToggle={true}
          showPassword={showPasswords.confirmPassword}
          onTogglePassword={() => togglePasswordVisibility('confirmPassword')}
          onKeyPress={handleKeyPress}
        />
        
        <div className="mb-6">
          <Button 
            onClick={handleSubmit}
            variant="primary"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </AuthForm>
  );
};

export default SignupPage;
