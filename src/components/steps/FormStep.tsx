import React from 'react';
import type { AssessmentStep, AssessmentData, ValidationErrors } from '../../types/assessment';
import FormField from '../FormField';

interface FormStepProps {
  step: AssessmentStep;
  data: AssessmentData;
  onChange: (updates: Partial<AssessmentData>) => void;
  validationErrors?: ValidationErrors;
}

const FormStep: React.FC<FormStepProps> = ({ step, data, onChange, validationErrors = {} }) => {
  const handleFieldChange = (fieldId: string, value: string | number | boolean) => {
    onChange({ [fieldId]: value });
  };

  return (
    <div className="assessment-step">
      <h2 className="card-title">{step.title}</h2>
      <p className="card-subtitle">{step.subtitle}</p>
      
      {step.info && (
        <div className="test-ranges">{step.info}</div>
      )}
      
      <div className="form-row">
        {step.fields?.map(field => (
          <FormField
            key={field.id}
            field={field}
            value={data[field.id as keyof AssessmentData]}
            onChange={handleFieldChange}
            error={validationErrors[field.id]}
          />
        ))}
      </div>
    </div>
  );
};

export default FormStep;