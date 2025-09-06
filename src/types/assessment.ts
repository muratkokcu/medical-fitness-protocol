export interface AssessmentData {
  // Additional fields
  clientId?: string;
  
  // Personal Information
  assessmentDate?: string;
  fullName?: string;
  gender?: 'male' | 'female';
  trainer?: string;
  age?: number;
  height?: number;
  weight?: number;
  occupation?: string;
  
  // Vital Signs
  systolicBP?: number;
  diastolicBP?: number;
  restingHR?: number;
  bodyTemperature?: number;
  
  // Body Composition
  bodyFatPercentage?: number;
  muscleMass?: number;
  visceralFat?: number;
  waistCircumference?: number;
  hipCircumference?: number;
  
  // Respiratory
  respiratoryRate?: number;
  peakFlowRate?: number;
  breathHoldTime?: number;
  chestExpansion?: number;
  respiratoryDysfunction?: 'normal' | 'dysfunction' | 'weak_diaphragm' | 'apical';
  
  // Biomechanical Assessment
  shoulderFlexion?: number;
  shoulderExtension?: number;
  spinalRotation?: number;
  hipFlexibility?: number;
  ankleFlexibility?: number;
  
  // Balance and Coordination
  staticBalance?: number;
  dynamicBalance?: number;
  coordinationTest?: number;
  singleLegBalanceKneeRotation?: boolean;
  singleLegBalanceHipShift?: boolean;
  singleLegBalanceTrunkRotation?: boolean;
  
  // Mobility Tests
  shoulderMobilityLeft?: number;
  shoulderMobilityRight?: number;
  trunkFlexibilityForward?: number;
  trunkFlexibilityBackward?: number;
  sitReachTime?: number;
  
  // Posture Assessment
  staticPosture?: 'excellent' | 'good' | 'fair' | 'poor';
  dynamicPosture?: 'excellent' | 'good' | 'fair' | 'poor';
  staticPostureAnterior?: string;
  staticPostureLateral?: string;
  staticPosturePosterior?: string;
  forwardHeadPosture?: 'none' | 'mild' | 'moderate' | 'severe';
  roundedShoulders?: 'none' | 'mild' | 'moderate' | 'severe';
  kyphosis?: 'none' | 'mild' | 'moderate' | 'severe';
  lordosis?: 'none' | 'mild' | 'moderate' | 'severe';
  scoliosis?: 'none' | 'mild' | 'moderate' | 'severe';
  pelvicTilt?: 'none' | 'mild' | 'moderate' | 'severe';
  upperCrossedSyndrome?: boolean;
  lowerCrossedSyndrome?: boolean;
  xLegsSyndrome?: boolean;
  otherSyndromes?: string;
  
  // Walking & Foot Strike Analysis
  walkingFootStrikeLeft?: number;
  walkingFootStrikeRight?: number;
  footStrikeType?: 'normal' | 'pronation' | 'supination';
  
  // Dynamic Posture (Overhead Squat)
  overheadSquatLeft?: string;
  overheadSquatRight?: string;
  
  // Strength Tests
  // gripStrength?: number;
  pushUps?: number;
  plankTime?: number;
  squats?: number;
  wallSitTime?: number;
  
  
  // Clinical Assessment
  overallRisk?: 'low' | 'moderate' | 'high';
  fitnessLevel?: 'excellent' | 'good' | 'average' | 'poor';
  recommendations?: string;
  clinicalExamination?: boolean;
  rehabilitationArea?: boolean;
  medicalFitnessExpert?: string;
  personalTraining?: boolean;
  fitnessGroupActivities?: boolean;
  instructor?: string;
  overallResult?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'date';
  required?: boolean;
  placeholder?: string;
  step?: string;
  rows?: number;
  options?: Array<{value: string; text: string}>;
}

export interface ValidationErrors {
  [fieldId: string]: string;
}

export interface AssessmentStep {
  id: string;
  title: string;
  subtitle: string;
  type: 'welcome' | 'form' | 'assessment' | 'summary';
  info?: string;
  fields?: FormField[];
}

export interface TestResult {
  value: number | string;
  result: string;
  category?: string;
  bmi?: number;
}

export interface TestResults {
  bmi?: TestResult;
  bloodPressure?: TestResult;
  pulse?: TestResult;
  bodyFat?: TestResult;
  whr?: TestResult;
  respiratory?: TestResult;
  balance?: TestResult;
  shoulderMobility?: TestResult;
  trunkFlexibility?: TestResult;
  staticPosture?: TestResult;
  dynamicPosture?: TestResult;
  posturalSyndromes?: TestResult;
  strengthTests?: TestResult;
  clinicalAssessment?: TestResult;
  walkingFootStrike?: TestResult;
  overheadSquat?: TestResult;
  wallSit?: TestResult;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Client {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
  company?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    notes: string;
  };
  createdBy: string;
  isActive: boolean;
  lastAssessment?: Date;
  totalAssessments: number;
  createdAt: string;
  updatedAt: string;
}

export interface Assessment {
  _id: string;
  client: Client | string;
  practitioner: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  assessmentDate: Date;
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed';
  data: AssessmentData;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationData {
  pages: number;
  page: number;
  limit: number;
  total: number;
}

export interface ClientsResponse {
  data: {
    clients: Client[];
    pagination: PaginationData;
  };
}

export interface AssessmentsResponse {
  data: {
    assessments: Assessment[];
    pagination: PaginationData;
  };
}

export interface StatsData {
  totalClients: number;
  totalAssessments: number;
  completedAssessments: number;
  inProgressAssessments: number;
}

export interface ClientStatsResponse {
  data: {
    stats: StatsData;
    recentClients: Client[];
  };
}

export interface AssessmentStatsResponse {
  data: {
    stats: StatsData;
    recentAssessments: Assessment[];
  };
}