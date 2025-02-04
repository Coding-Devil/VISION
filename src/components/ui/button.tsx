import React from 'react';
import { Camera, Mic, Sun, Moon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: 'camera' | 'mic' | 'theme';
  isActive?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon,
  isActive,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = 'rounded-lg font-medium transition-all duration-300 flex items-center gap-2 backdrop-blur-sm';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 shadow-lg shadow-blue-500/20',
    secondary: 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-100 border border-gray-600/50',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-500 shadow-lg shadow-red-500/20'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const getIcon = () => {
    switch (icon) {
      case 'camera':
        return <Camera className="w-5 h-5" />;
      case 'mic':
        return <Mic className="w-5 h-5" />;
      case 'theme':
        return props['aria-label']?.includes('dark') ? 
          <Moon className="w-5 h-5" /> : 
          <Sun className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const disabledStyles = disabled ? 
    'opacity-50 cursor-not-allowed' : 
    'hover:scale-105 active:scale-100';

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${isActive ? 'ring-2 ring-blue-400' : ''}
        ${disabledStyles}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {getIcon()}
      {children}
    </button>
  );
};

export default Button;