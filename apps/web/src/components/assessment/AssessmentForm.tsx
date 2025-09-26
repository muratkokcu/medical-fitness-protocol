import React, { useState, useEffect } from 'react';
import PersonalInfoSection from './PersonalInfoSection';
import CardiovascularSection from './CardiovascularSection';
import BodyCompositionSection from './BodyCompositionSection';
import MobilityBalanceSection from './MobilityBalanceSection';
import './AssessmentForm.css';

// Combined data interface
interface AssessmentData {
  // Client reference
  clientId?: string;

  // Personal Info
  name: string;
  gender: 'erkek' | 'kadın' | '';
  trainer: string;
  height: number | '';
  weight: number | '';
  age: number | '';
  date: string;

  // Cardiovascular
  systolic: number | '';
  diastolic: number | '';
  heart_rate: number | '';
  body_fat: number | '';

  // Body Composition
  waist: number | '';
  hip: number | '';
  breathing: 'normal' | 'disfonksiyon' | 'zayif_diyafram' | 'apikal' | '';

  // Mobility & Balance
  left_foot: 'normal' | 'pronation' | 'supination' | '';
  right_foot: 'normal' | 'pronation' | 'supination' | '';
  balance_left: number | '';
  balance_right: number | '';
  shoulder_left: 'iyi' | 'normal' | 'riskli' | '';
  shoulder_right: 'iyi' | 'normal' | 'riskli' | '';
  sit_reach: number | '';
}

interface Client {
  _id: string;
  fullName: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

interface AssessmentFormProps {
  onSubmit: (data: AssessmentData) => void;
  initialData?: Partial<AssessmentData>;
  clientData?: Client;
  isClientAssessment?: boolean;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  onSubmit,
  initialData = {},
  clientData,
  isClientAssessment = false
}) => {
  // Helper function to calculate age from birth date
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Helper function to convert gender
  const convertGender = (gender?: string) => {
    switch (gender) {
      case 'male':
        return 'erkek';
      case 'female':
        return 'kadın';
      default:
        return '';
    }
  };

  // Initialize data with client information if available
  const getInitialData = (): AssessmentData => {
    const baseData: AssessmentData = {
      name: '',
      gender: '',
      trainer: '',
      height: '',
      weight: '',
      age: '',
      date: new Date().toISOString().split('T')[0],
      systolic: '',
      diastolic: '',
      heart_rate: '',
      body_fat: '',
      waist: '',
      hip: '',
      breathing: '',
      left_foot: '',
      right_foot: '',
      balance_left: '',
      balance_right: '',
      shoulder_left: '',
      shoulder_right: '',
      sit_reach: '',
      ...initialData
    };

    // If we have client data, pre-populate the form
    if (isClientAssessment && clientData) {
      baseData.clientId = clientData._id;
      baseData.name = clientData.fullName;
      baseData.gender = convertGender(clientData.gender);

      if (clientData.dateOfBirth) {
        baseData.age = calculateAge(clientData.dateOfBirth);
      }
    }

    return baseData;
  };

  const [data, setData] = useState<AssessmentData>(getInitialData());

  const [errors, setErrors] = useState<Partial<Record<keyof AssessmentData, string>>>({});
  const [progress, setProgress] = useState(0);

  // Required fields for validation
  const requiredFields: (keyof AssessmentData)[] = [
    'name', 'gender', 'height', 'weight', 'age', 'date', 'trainer',
    'systolic', 'diastolic', 'heart_rate', 'body_fat',
    'waist', 'hip', 'breathing', 'left_foot', 'right_foot',
    'balance_left', 'balance_right', 'shoulder_left', 'shoulder_right',
    'sit_reach'
  ];

  // Update progress when data changes
  useEffect(() => {
    const filledFields = requiredFields.filter(field => {
      const value = data[field];
      return value !== '' && value !== null && value !== undefined;
    }).length;

    const newProgress = Math.round((filledFields / requiredFields.length) * 100);
    setProgress(newProgress);
  }, [data]);

  const handleFieldChange = (field: keyof AssessmentData, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AssessmentData, string>> = {};

    // Required field validation
    requiredFields.forEach(field => {
      const value = data[field];
      if (value === '' || value === null || value === undefined) {
        newErrors[field] = 'Bu alan zorunludur';
      }
    });

    // Custom validations
    if (data.height && (data.height < 100 || data.height > 250)) {
      newErrors.height = 'Boy 100-250 cm arasında olmalıdır';
    }

    if (data.weight && (data.weight < 30 || data.weight > 200)) {
      newErrors.weight = 'Kilo 30-200 kg arasında olmalıdır';
    }

    if (data.age && (data.age < 16 || data.age > 100)) {
      newErrors.age = 'Yaş 16-100 arasında olmalıdır';
    }

    if (data.systolic && (data.systolic < 80 || data.systolic > 250)) {
      newErrors.systolic = 'Sistolik basınç 80-250 mmHg arasında olmalıdır';
    }

    if (data.diastolic && (data.diastolic < 40 || data.diastolic > 150)) {
      newErrors.diastolic = 'Diastolik basınç 40-150 mmHg arasında olmalıdır';
    }

    if (data.heart_rate && (data.heart_rate < 40 || data.heart_rate > 200)) {
      newErrors.heart_rate = 'Nabız 40-200 bpm arasında olmalıdır';
    }

    if (data.body_fat && (data.body_fat < 5 || data.body_fat > 50)) {
      newErrors.body_fat = 'Vücut yağ oranı %5-50 arasında olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(data);
    } else {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="assessment-form-container">
      {/* Header with Progress */}
      <div className="assessment-header">
        <div className="brand">
          <div className="logo">MF</div>
          <div>
            <div className="title">Medical Fitness Check‑up</div>
            <div className="subtitle">Değerlendirme Formu</div>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-text">{progress}% tamamlandı</div>
        </div>

        <button
          type="submit"
          form="assessment-form"
          className={`btn primary ${progress < 95 ? 'disabled' : ''}`}
          disabled={progress < 95}
        >
          {progress >= 95 ? 'Rapor Oluştur ✓' : `Rapor Oluştur (${requiredFields.length - Math.round((progress / 100) * requiredFields.length)} eksik)`}
        </button>
      </div>

      {/* Form Content */}
      <form id="assessment-form" className="assessment-form" onSubmit={handleSubmit}>
        <PersonalInfoSection
          data={{
            name: data.name,
            gender: data.gender,
            trainer: data.trainer,
            height: data.height,
            weight: data.weight,
            age: data.age,
            date: data.date
          }}
          onChange={handleFieldChange}
          errors={errors}
          isClientAssessment={isClientAssessment}
          clientName={clientData?.fullName}
        />

        <CardiovascularSection
          data={{
            systolic: data.systolic,
            diastolic: data.diastolic,
            heart_rate: data.heart_rate,
            body_fat: data.body_fat
          }}
          onChange={handleFieldChange}
          errors={errors}
        />

        <BodyCompositionSection
          data={{
            waist: data.waist,
            hip: data.hip,
            breathing: data.breathing
          }}
          onChange={handleFieldChange}
          errors={errors}
        />

        <MobilityBalanceSection
          data={{
            left_foot: data.left_foot,
            right_foot: data.right_foot,
            balance_left: data.balance_left,
            balance_right: data.balance_right,
            shoulder_left: data.shoulder_left,
            shoulder_right: data.shoulder_right,
            sit_reach: data.sit_reach
          }}
          onChange={handleFieldChange}
          errors={errors}
        />
      </form>
    </div>
  );
};

export default AssessmentForm;