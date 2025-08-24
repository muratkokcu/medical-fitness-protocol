import React from 'react';
import type { AssessmentStep } from '../../types/assessment';

interface WelcomeStepProps {
  step: AssessmentStep;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ step }) => {
  return (
    <div className="welcome-screen">
      <h1 className="welcome-title">{step.title}</h1>
      <p className="welcome-subtitle">{step.subtitle}</p>
    </div>
  );
};

export default WelcomeStep;