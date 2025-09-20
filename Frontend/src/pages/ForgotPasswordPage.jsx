import React, { useState } from 'react';
import { toast } from 'sonner';
import AuthForm from '../components/AuthForm';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { validateEmail } from '../utils/validation';

const ForgotPasswordPage = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    if (!validateEmail(email)) {
      toast.error('Invalid Email', {
        description: 'Please enter a valid email address',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      toast.success('Password reset link sent!', {
        description: 'Please check your email for reset instructions',
      });
      setEmail('');
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <AuthForm title="Forgot Password">
      <div>
        <InputField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          onKeyPress={handleKeyPress}
        />
        
        <div className="mb-6">
          <Button 
            onClick={handleSubmit} 
            variant="primary"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
          </Button>
        </div>
        
        <div className="text-center">
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </AuthForm>
  );
};

export default ForgotPasswordPage;
