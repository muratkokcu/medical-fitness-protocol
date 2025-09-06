import React from 'react';
import './NavigationFooter.css';

interface NavigationFooterProps {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  onExit?: () => void;
  isReadOnly?: boolean;
  isSaving?: boolean;
}

const NavigationFooter: React.FC<NavigationFooterProps> = ({
  currentStep,
  onPrevious,
  onNext,
  isFirstStep,
  isLastStep,
  onExit,
  isReadOnly = false,
  isSaving = false
}) => {
  const getNextButtonText = () => {
    if (isReadOnly) return 'Kapat';
    if (currentStep === 0) return 'Başla';
    if (isLastStep) return 'Raporu Tamamla';
    return 'Devam';
  };

  const handleNextClick = () => {
    if (isReadOnly && onExit) {
      onExit();
    } else {
      onNext();
    }
  };

  return (
    <div className="navigation-footer">
      <div className="nav-left">
        {onExit && (
          <button 
            className="nav-btn secondary" 
            onClick={onExit}
          >
            {isReadOnly ? 'Kapat' : 'Çıkış'}
          </button>
        )}
        {!isReadOnly && (
          <button 
            className="nav-btn secondary" 
            onClick={onPrevious}
            disabled={isFirstStep}
          >
            Önceki
          </button>
        )}
        {isSaving && (
          <span className="save-indicator">
            💾 Kaydediliyor...
          </span>
        )}
      </div>
      
      <div className="nav-right">
        {!isReadOnly && (
          <button 
            className="nav-btn primary" 
            onClick={handleNextClick}
          >
            {getNextButtonText()}
          </button>
        )}
      </div>
    </div>
  );
};

export default NavigationFooter;