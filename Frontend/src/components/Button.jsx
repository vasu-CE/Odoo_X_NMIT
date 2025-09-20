import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = "" }) => {
  const baseClasses = "px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 border-0",
    outline: "bg-white/80 text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 backdrop-blur-sm",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-0"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
