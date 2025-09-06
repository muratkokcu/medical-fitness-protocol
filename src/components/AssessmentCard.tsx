import React from 'react';
import './AssessmentCard.css';

interface AssessmentCardProps {
  children: React.ReactNode;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({ children }) => {
  return (
    <div className="assessment-card">
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default AssessmentCard;