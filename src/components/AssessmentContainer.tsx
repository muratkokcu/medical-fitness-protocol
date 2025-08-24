import React, { useState, useEffect } from 'react';
import ProgressHeader from './ProgressHeader';
import AssessmentCard from './AssessmentCard';
import NavigationFooter from './NavigationFooter';
import WelcomeStep from './steps/WelcomeStep';
import FormStep from './steps/FormStep';
import SummaryReport from './SummaryReport';
import { ASSESSMENT_STEPS, TOTAL_STEPS } from '../utils/constants';
import type { AssessmentData, TestResults, ValidationErrors } from '../types/assessment';
import { performAllCalculations } from '../utils/calculations';

const AssessmentContainer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({});
  const [testResults, setTestResults] = useState<TestResults>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const currentStepData = ASSESSMENT_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('medicalFitnessAssessment');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setAssessmentData(parsed);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever assessmentData changes
  useEffect(() => {
    localStorage.setItem('medicalFitnessAssessment', JSON.stringify(assessmentData));
  }, [assessmentData]);

  const updateAssessmentData = (updates: Partial<AssessmentData>) => {
    setAssessmentData(prev => ({ ...prev, ...updates }));
    
    // Clear validation errors for updated fields
    const updatedFieldIds = Object.keys(updates);
    if (updatedFieldIds.length > 0) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        updatedFieldIds.forEach(fieldId => {
          delete newErrors[fieldId];
        });
        return newErrors;
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    const step = ASSESSMENT_STEPS[currentStep];
    
    if (!step.fields) return true;
    
    const requiredFields = step.fields.filter(field => field.required);
    const errors: ValidationErrors = {};
    
    for (const field of requiredFields) {
      const value = assessmentData[field.id as keyof AssessmentData];
      if (!value || value === '') {
        errors[field.id] = `Lütfen "${field.label}" alanını doldurunuz.`;
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === TOTAL_STEPS - 1) return;
    
    if (currentStepData.type === 'form' || currentStepData.type === 'assessment') {
      if (!validateCurrentStep()) return;
    }
    
    // If moving to summary step, perform calculations
    if (currentStep === TOTAL_STEPS - 2) {
      const results = performAllCalculations(assessmentData);
      setTestResults(results);
    }
    
    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS - 1));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const renderStepContent = () => {
    switch (currentStepData.type) {
      case 'welcome':
        return <WelcomeStep step={currentStepData} />;
      
      case 'form':
      case 'assessment':
        return (
          <FormStep 
            step={currentStepData}
            data={assessmentData}
            onChange={updateAssessmentData}
            validationErrors={validationErrors}
          />
        );
      
      case 'summary':
        return (
          <SummaryReport 
            assessmentData={assessmentData}
            testResults={testResults}
          />
        );
      
      default:
        return <div>Geçersiz adım türü</div>;
    }
  };

  return (
    <div className="assessment-container">
      <ProgressHeader 
        currentStep={currentStep} 
        totalSteps={TOTAL_STEPS} 
      />
      
      <AssessmentCard>
        {renderStepContent()}
      </AssessmentCard>
      
      <NavigationFooter
        currentStep={currentStep}
        onPrevious={handlePrevious}
        onNext={handleNext}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
      />
    </div>
  );
};

export default AssessmentContainer;