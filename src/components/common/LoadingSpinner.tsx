import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Yükleniyor...', 
  size = 'medium',
  className = ''
}) => {
  return (
    <div className={`loading-spinner-container ${size} ${className}`}>
      <div className="loading-spinner-icon"></div>
      <span className="loading-spinner-text">{message}</span>
    </div>
  );
};

export default LoadingSpinner;