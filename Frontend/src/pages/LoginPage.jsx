import React, { useState } from 'react';
import { toast } from 'sonner';
import AuthForm from '../components/AuthForm';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { findUserByCredentials } from '../utils/database';

const LoginPage = ({ onNavigate, onLogin }) => {
  const [formData, setFormData] = useState({
    loginId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = () => {
    setIsLoading(true);

    // Validate required fields
    if (!formData.loginId || !formData.password) {
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      const user = findUserByCredentials(formData.loginId, formData.password);
      
      if (user) {
        toast.success('Login successful!', {
          description: `Welcome back, ${user.loginId}!`,
        });
        console.log('User logged in:', user);
        onLogin(); // Call the onLogin function to update app state
      } else {
        toast.error('Invalid Login ID or Password', {
          description: 'Please check your credentials and try again.',
        });
      }
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <AuthForm title="Login Page">
      <div>
        <InputField
          label="Login Id"
          value={formData.loginId}
          onChange={handleInputChange('loginId')}
          placeholder="Enter your login ID"
          onKeyPress={handleKeyPress}
        />
        
        <InputField
          label="Password"
          value={formData.password}
          onChange={handleInputChange('password')}
          placeholder="Enter your password"
          showPasswordToggle={true}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          onKeyPress={handleKeyPress}
        />
        
        <div className="mb-6">
          <Button 
            onClick={handleSubmit}
            variant="primary"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
          </Button>
        </div>
        
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-4">
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              Forgot Password?
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </AuthForm>
  );
};

export default LoginPage;
