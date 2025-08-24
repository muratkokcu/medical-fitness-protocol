import { useState, useCallback } from 'react';
import type { AssessmentData, TestResults } from '../types/assessment';
import { performAllCalculations } from '../utils/calculations';
import useLocalStorage from './useLocalStorage';

const useAssessmentData = () => {
  const [assessmentData, setAssessmentData] = useLocalStorage<AssessmentData>('medicalFitnessAssessment', {});
  const [testResults, setTestResults] = useState<TestResults>({});

  const updateAssessmentData = useCallback((updates: Partial<AssessmentData>) => {
    setAssessmentData(prev => ({ ...prev, ...updates }));
  }, [setAssessmentData]);

  const calculateResults = useCallback(() => {
    const results = performAllCalculations(assessmentData);
    setTestResults(results);
    return results;
  }, [assessmentData]);

  const resetAssessment = useCallback(() => {
    setAssessmentData({});
    setTestResults({});
  }, [setAssessmentData]);

  const saveReport = useCallback(() => {
    const reportData = {
      assessmentData,
      testResults,
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage with timestamp
    const savedReports = localStorage.getItem('savedMedicalReports');
    const reports = savedReports ? JSON.parse(savedReports) : [];
    reports.push(reportData);
    localStorage.setItem('savedMedicalReports', JSON.stringify(reports));
    
    return reportData;
  }, [assessmentData, testResults]);

  const printReport = useCallback(() => {
    window.print();
  }, []);

  return {
    assessmentData,
    testResults,
    updateAssessmentData,
    calculateResults,
    resetAssessment,
    saveReport,
    printReport
  };
};

export default useAssessmentData;