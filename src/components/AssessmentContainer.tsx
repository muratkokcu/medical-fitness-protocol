import React, { useState, useEffect } from 'react';
import ProgressHeader from './ProgressHeader';
import AssessmentCard from './AssessmentCard';
import NavigationFooter from './NavigationFooter';
import WelcomeStep from './steps/WelcomeStep';
import FormStep from './steps/FormStep';
import AssessmentCompletion from './AssessmentCompletion';
import SinglePageAssessment from './SinglePageAssessment';
import { ASSESSMENT_STEPS, TOTAL_STEPS } from '../utils/constants';
import type { AssessmentData, ValidationErrors } from '../types/assessment';
// import { performAllCalculations } from '../utils/calculations'; // Removed - not needed in new flow

interface AssessmentContainerProps {
  initialData?: AssessmentData;
  onComplete?: (data: AssessmentData) => void;
  onSave?: (data: AssessmentData, isCompleted?: boolean) => Promise<any>;
  onExit?: () => void;
  isReadOnly?: boolean;
  useSinglePage?: boolean;
  mode?: 'create' | 'edit' | 'view';
}

const AssessmentContainer: React.FC<AssessmentContainerProps> = ({
  initialData = {},
  onComplete,
  onSave,
  onExit,
  isReadOnly = false,
  useSinglePage = true,
  mode = 'create'
}) => {
  // All hooks must be called before any conditional returns
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>(initialData);
  // const [testResults, setTestResults] = useState<TestResults>({}); // Not needed in new flow
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const currentStepData = ASSESSMENT_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  // Initialize with provided data or load from localStorage
  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setAssessmentData(initialData);
    } else {
      const savedData = localStorage.getItem('medicalFitnessAssessment');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setAssessmentData(parsed);
        } catch (error) {
          console.error('Error loading saved data:', error);
        }
      }
    }
  }, [initialData]);

  // Save data - use API if available, otherwise localStorage
  // Only enable autosave for edit mode to prevent multiple assessment creation
  useEffect(() => {
    const saveData = async () => {
      if (onSave && Object.keys(assessmentData).length > 1) {
        // Only autosave for edit mode - prevents multiple assessment creation
        if (mode === 'edit') {
          try {
            setIsSaving(true);
            await onSave(assessmentData, false);
          } catch (error) {
            console.error('Auto-save error:', error);
          } finally {
            setIsSaving(false);
          }
        }
      } else {
        // Fallback to localStorage for legacy mode
        localStorage.setItem('medicalFitnessAssessment', JSON.stringify(assessmentData));
      }
    };

    // Debounce auto-save - only runs for edit mode
    if (mode === 'edit') {
      const timeoutId = setTimeout(saveData, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [assessmentData, onSave, mode]);

  // If using single page mode, render the new component (after all hooks)
  if (useSinglePage) {
    return (
      <SinglePageAssessment
        initialData={initialData}
        onComplete={onComplete}
        onSave={onSave}
        onExit={onExit}
        isReadOnly={isReadOnly}
        mode={mode}
      />
    );
  }

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
    // Handle completion on last step
    if (currentStep === TOTAL_STEPS - 1) {
      if (onComplete) {
        onComplete(assessmentData);
      }
      return;
    }
    
    if (currentStepData.type === 'form' || currentStepData.type === 'assessment') {
      if (!validateCurrentStep()) return;
    }
    
    // If moving to summary step, we just complete the assessment now
    // No need for calculations since we removed the summary report
    
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
          <AssessmentCompletion 
            assessmentData={assessmentData}
            onClose={onExit}
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
        onExit={onExit}
        isReadOnly={isReadOnly}
        isSaving={isSaving}
      />
    </div>
  );
};

export default AssessmentContainer;