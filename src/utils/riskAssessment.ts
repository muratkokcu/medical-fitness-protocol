import type { AssessmentData, TestResults } from '../types/assessment';
import type { RiskLevel } from '../components/visual/RiskIndicator';

export interface RiskAssessment {
  overall: RiskLevel;
  cardiovascular: RiskLevel;
  physical: RiskLevel;
  bodyComposition: RiskLevel;
  postural: RiskLevel;
  score: number; // 0-100
}

export const calculateRiskLevel = (value: number, thresholds: { low: number; moderate: number }): RiskLevel => {
  if (value <= thresholds.low) return 'low';
  if (value <= thresholds.moderate) return 'moderate';
  return 'high';
};

export const getBMIRisk = (bmi: number): RiskLevel => {
  if (bmi >= 18.5 && bmi < 25) return 'low';
  if ((bmi >= 17 && bmi < 18.5) || (bmi >= 25 && bmi < 30)) return 'moderate';
  return 'high';
};

export const getBloodPressureRisk = (systolic: number, diastolic: number): RiskLevel => {
  if (systolic <= 120 && diastolic <= 80) return 'low';
  if (systolic <= 140 && diastolic <= 90) return 'moderate';
  return 'high';
};

export const getPulseRisk = (pulse: number): RiskLevel => {
  if (pulse >= 60 && pulse <= 100) return 'low';
  if ((pulse >= 50 && pulse < 60) || (pulse > 100 && pulse <= 120)) return 'moderate';
  return 'high';
};

export const getBodyFatRisk = (bodyFat: number, gender: 'male' | 'female'): RiskLevel => {
  if (gender === 'male') {
    if (bodyFat >= 10 && bodyFat <= 18) return 'low';
    if ((bodyFat >= 8 && bodyFat < 10) || (bodyFat > 18 && bodyFat <= 25)) return 'moderate';
    return 'high';
  } else {
    if (bodyFat >= 16 && bodyFat <= 25) return 'low';
    if ((bodyFat >= 14 && bodyFat < 16) || (bodyFat > 25 && bodyFat <= 32)) return 'moderate';
    return 'high';
  }
};

export const getPostureRisk = (posture: 'excellent' | 'good' | 'fair' | 'poor'): RiskLevel => {
  switch (posture) {
    case 'excellent':
    case 'good':
      return 'low';
    case 'fair':
      return 'moderate';
    case 'poor':
      return 'high';
    default:
      return 'none';
  }
};

export const getBalanceRisk = (balanceTime: number): RiskLevel => {
  if (balanceTime >= 30) return 'low';
  if (balanceTime >= 15) return 'moderate';
  return 'high';
};

export const getFlexibilityRisk = (flexibility: number, type: 'shoulder' | 'trunk'): RiskLevel => {
  if (type === 'shoulder') {
    if (flexibility <= 5) return 'low';
    if (flexibility <= 10) return 'moderate';
    return 'high';
  } else { // trunk
    if (flexibility >= 15) return 'low';
    if (flexibility >= 10) return 'moderate';
    return 'high';
  }
};

export const assessOverallRisk = (assessmentData: AssessmentData, _testResults: TestResults): RiskAssessment => {
  const risks: RiskLevel[] = [];
  
  // Cardiovascular assessment
  let cardiovascularRisk: RiskLevel = 'none';
  if (assessmentData.systolicBP && assessmentData.diastolicBP) {
    cardiovascularRisk = getBloodPressureRisk(assessmentData.systolicBP, assessmentData.diastolicBP);
    risks.push(cardiovascularRisk);
  }
  if (assessmentData.restingHR) {
    const pulseRisk = getPulseRisk(assessmentData.restingHR);
    risks.push(pulseRisk);
    cardiovascularRisk = cardiovascularRisk === 'none' ? pulseRisk : 
      (cardiovascularRisk === 'high' || pulseRisk === 'high') ? 'high' :
      (cardiovascularRisk === 'moderate' || pulseRisk === 'moderate') ? 'moderate' : 'low';
  }

  // Body composition assessment
  let bodyCompositionRisk: RiskLevel = 'none';
  if (assessmentData.height && assessmentData.weight) {
    const bmi = assessmentData.weight / Math.pow(assessmentData.height / 100, 2);
    bodyCompositionRisk = getBMIRisk(bmi);
    risks.push(bodyCompositionRisk);
  }
  if (assessmentData.bodyFatPercentage && assessmentData.gender) {
    const bodyFatRisk = getBodyFatRisk(assessmentData.bodyFatPercentage, assessmentData.gender);
    risks.push(bodyFatRisk);
    bodyCompositionRisk = bodyCompositionRisk === 'none' ? bodyFatRisk :
      (bodyCompositionRisk === 'high' || bodyFatRisk === 'high') ? 'high' :
      (bodyCompositionRisk === 'moderate' || bodyFatRisk === 'moderate') ? 'moderate' : 'low';
  }

  // Physical fitness assessment
  let physicalRisk: RiskLevel = 'none';
  if (assessmentData.staticBalance) {
    physicalRisk = getBalanceRisk(assessmentData.staticBalance);
    risks.push(physicalRisk);
  }

  // Postural assessment
  let posturalRisk: RiskLevel = 'none';
  if (assessmentData.staticPosture) {
    posturalRisk = getPostureRisk(assessmentData.staticPosture);
    risks.push(posturalRisk);
  }
  if (assessmentData.dynamicPosture) {
    const dynamicRisk = getPostureRisk(assessmentData.dynamicPosture);
    risks.push(dynamicRisk);
    posturalRisk = posturalRisk === 'none' ? dynamicRisk :
      (posturalRisk === 'high' || dynamicRisk === 'high') ? 'high' :
      (posturalRisk === 'moderate' || dynamicRisk === 'moderate') ? 'moderate' : 'low';
  }

  // Calculate overall risk
  const highRisks = risks.filter(r => r === 'high').length;
  const moderateRisks = risks.filter(r => r === 'moderate').length;
  const lowRisks = risks.filter(r => r === 'low').length;
  
  let overall: RiskLevel = 'none';
  let score = 0;

  if (risks.length > 0) {
    if (highRisks > 0) {
      overall = 'high';
      score = Math.max(0, 60 - (highRisks * 20));
    } else if (moderateRisks > 0) {
      overall = 'moderate';
      score = Math.min(80, 60 + (lowRisks * 5) - (moderateRisks * 10));
    } else {
      overall = 'low';
      score = Math.min(100, 80 + (lowRisks * 5));
    }
  }

  return {
    overall,
    cardiovascular: cardiovascularRisk,
    physical: physicalRisk,
    bodyComposition: bodyCompositionRisk,
    postural: posturalRisk,
    score: Math.round(score)
  };
};

export const getRiskColor = (level: RiskLevel): string => {
  switch (level) {
    case 'low': return '#34C759';
    case 'moderate': return '#FF9500';
    case 'high': return '#FF3B30';
    default: return '#8E8E93';
  }
};

export const getRiskText = (level: RiskLevel): string => {
  switch (level) {
    case 'low': return 'Düşük Risk';
    case 'moderate': return 'Orta Risk';
    case 'high': return 'Yüksek Risk';
    default: return 'Veri Yok';
  }
};