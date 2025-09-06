import React from 'react';
import './ProgressHeader.css';

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({ currentStep, totalSteps }) => {
  const progressPercentage = (currentStep / (totalSteps - 1)) * 100;

  return (
    <div className="progress-header">
      <div className="progress-info">
        <h2 className="progress-title">Medikal Fitness Değerlendirmesi</h2>
        <div className="step-counter">
          Adım {currentStep} / {totalSteps - 1}
        </div>
      </div>
      <div className="progress-bar-main">
        <div 
          className="progress-fill-main" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressHeader;