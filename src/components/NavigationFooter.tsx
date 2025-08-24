import React from 'react';

interface NavigationFooterProps {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const NavigationFooter: React.FC<NavigationFooterProps> = ({
  currentStep,
  onPrevious,
  onNext,
  isFirstStep,
  isLastStep
}) => {
  const getNextButtonText = () => {
    if (currentStep === 0) return 'Başla';
    if (isLastStep) return 'Raporu Tamamla';
    return 'Devam';
  };

  return (
    <div className="navigation-footer">
      <button 
        className="nav-btn secondary" 
        onClick={onPrevious}
        disabled={isFirstStep}
      >
        Önceki
      </button>
      <button 
        className="nav-btn" 
        onClick={onNext}
      >
        {getNextButtonText()}
      </button>
    </div>
  );
};

export default NavigationFooter;