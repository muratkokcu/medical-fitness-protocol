import React, { useState, useEffect } from 'react';
import './form.css';

interface AssessmentFormProps {
  invitation: {
    id: string;
    createdBy: {
      firstName: string;
      lastName: string;
      organization: string;
    };
    patientInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      notes?: string;
    };
    settings: {
      language: 'tr' | 'en';
      expiresAt: string;
    };
  };
  formData: {
    // Basic Information
    name: string;
    gender: 'erkek' | 'kadın' | '';
    height: number | '';
    weight: number | '';
    age: number | '';
    date: string;
    trainer: string;

    // Cardiovascular
    systolic: number | '';
    diastolic: number | '';
    heart_rate: number | '';

    // Body Composition
    body_fat: number | '';
    waist: number | '';
    hip: number | '';

    // Respiratory
    breathing: 'normal' | 'disfonksiyon' | 'zayif_diyafram' | 'apikal' | '';

    // Gait & Balance
    left_foot: 'normal' | 'pronation' | 'supination' | '';
    right_foot: 'normal' | 'pronation' | 'supination' | '';
    balance_left: number | '';
    balance_right: number | '';

    // Static Posture
    static_posture: string[];

    // Dynamic Posture
    dynamic_anterior: string[];
    dynamic_lateral: string[];
    dynamic_posterior: string[];

    // Mobility
    shoulder_left: 'iyi' | 'normal' | 'riskli' | '';
    shoulder_right: 'iyi' | 'normal' | 'riskli' | '';
    sit_reach: number | '';

    // Strength
    plank_minutes: number | '';
    plank_seconds: number | '';
    pushup_count: number | '';
    wallsit_minutes: number | '';
    wallsit_seconds: number | '';
  };
  onFormDataChange: (data: any) => void;
  language: 'tr' | 'en';
  onLanguageChange: (lang: 'tr' | 'en') => void;
  progress: number;
  onProgressChange: (progress: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitError: string;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  invitation,
  formData,
  onFormDataChange,
  language,
  onLanguageChange,
  onProgressChange,
  onSubmit,
  isSubmitting,
  submitError
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 8;

  // Translation object
  const t = {
    tr: {
      title: 'Tıbbi Fitness Değerlendirme Formu',
      loading: 'Form yükleniyor...',
      invalidToken: 'Geçersiz davet bağlantısı',
      expiredToken: 'Davet bağlantısının süresi dolmuş',
      basicInfo: 'Temel Bilgiler',
      cardiovascular: 'Kardiyovasküler',
      bodyComposition: 'Vücut Kompozisyonu',
      respiratory: 'Solunum',
      gaitBalance: 'Yürüyüş & Denge',
      posture: 'Postür',
      mobility: 'Hareket Kabiliyeti',
      strength: 'Güç',
      next: 'İleri',
      previous: 'Geri',
      submit: 'Gönder',
      submitting: 'Gönderiliyor...',
      name: 'Ad Soyad',
      gender: 'Cinsiyet',
      male: 'Erkek',
      female: 'Kadın',
      height: 'Boy (cm)',
      weight: 'Kilo (kg)',
      age: 'Yaş',
      date: 'Tarih',
      trainer: 'Antrenör',
      systolic: 'Sistolik',
      diastolic: 'Diyastolik',
      heartRate: 'Kalp Atış Hızı',
      bodyFat: 'Vücut Yağ Oranı (%)',
      waist: 'Bel Çevresi (cm)',
      hip: 'Kalça Çevresi (cm)',
      breathing: 'Nefes Alma',
      normal: 'Normal',
      abnormal: 'Anormal',
      leftFoot: 'Sol Ayak',
      rightFoot: 'Sağ Ayak',
      balanceLeft: 'Sol Ayak Dengesi (sn)',
      balanceRight: 'Sağ Ayak Dengesi (sn)',
      staticPosture: 'Statik Postür',
      dynamicPosture: 'Dinamik Postür',
      shoulderLeft: 'Sol Omuz',
      shoulderRight: 'Sağ Omuz',
      sitReach: 'Otur-Uzan Testi (cm)',
      plank: 'Plank Süresi',
      pushups: 'Şınav Sayısı',
      wallSit: 'Duvar Oturma Süresi',
      minutes: 'Dakika',
      seconds: 'Saniye',
      required: 'Bu alan zorunludur'
    },
    en: {
      title: 'Medical Fitness Assessment Form',
      loading: 'Loading form...',
      invalidToken: 'Invalid invitation link',
      expiredToken: 'Invitation link has expired',
      basicInfo: 'Basic Information',
      cardiovascular: 'Cardiovascular',
      bodyComposition: 'Body Composition',
      respiratory: 'Respiratory',
      gaitBalance: 'Gait & Balance',
      posture: 'Posture',
      mobility: 'Mobility',
      strength: 'Strength',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      submitting: 'Submitting...',
      name: 'Full Name',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      height: 'Height (cm)',
      weight: 'Weight (kg)',
      age: 'Age',
      date: 'Date',
      trainer: 'Trainer',
      systolic: 'Systolic',
      diastolic: 'Diastolic',
      heartRate: 'Heart Rate',
      bodyFat: 'Body Fat (%)',
      waist: 'Waist Circumference (cm)',
      hip: 'Hip Circumference (cm)',
      breathing: 'Breathing',
      normal: 'Normal',
      abnormal: 'Abnormal',
      leftFoot: 'Left Foot',
      rightFoot: 'Right Foot',
      balanceLeft: 'Left Foot Balance (sec)',
      balanceRight: 'Right Foot Balance (sec)',
      staticPosture: 'Static Posture',
      dynamicPosture: 'Dynamic Posture',
      shoulderLeft: 'Left Shoulder',
      shoulderRight: 'Right Shoulder',
      sitReach: 'Sit-Reach Test (cm)',
      plank: 'Plank Duration',
      pushups: 'Push-ups Count',
      wallSit: 'Wall Sit Duration',
      minutes: 'Minutes',
      seconds: 'Seconds',
      required: 'This field is required'
    }
  };

  const getText = (key: keyof typeof t.tr) => t[language as keyof typeof t][key];

  // Update progress when step changes
  useEffect(() => {
    const newProgress = (currentStep / totalSteps) * 100;
    onProgressChange(newProgress);
  }, [currentStep, onProgressChange]);

  // Set trainer name from invitation
  useEffect(() => {
    if (!formData.trainer && invitation) {
      onFormDataChange({
        trainer: `${invitation.createdBy.firstName} ${invitation.createdBy.lastName}`
      });
    }
  }, [invitation, formData.trainer, onFormDataChange]);

  const handleInputChange = (field: string, value: string | number | string[]) => {
    onFormDataChange({ [field]: value });
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const currentValues = (formData as any)[field] as string[];
    if (checked) {
      onFormDataChange({ [field]: [...currentValues, value] });
    } else {
      onFormDataChange({ [field]: currentValues.filter((v: string) => v !== value) });
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Basic Info
        return !!(formData.name && formData.gender && formData.height && formData.weight && formData.age);
      case 2: // Cardiovascular
        return !!(formData.systolic && formData.diastolic && formData.heart_rate);
      case 3: // Body Composition
        return !!(formData.body_fat && formData.waist && formData.hip);
      case 4: // Respiratory
        return !!formData.breathing;
      case 5: // Gait & Balance
        return !!(formData.left_foot && formData.right_foot && formData.balance_left && formData.balance_right);
      case 6: // Posture
        return true; // Optional fields
      case 7: // Mobility
        return !!(formData.shoulder_left && formData.shoulder_right && formData.sit_reach);
      case 8: // Strength
        return !!(formData.plank_minutes && formData.plank_seconds && formData.pushup_count && formData.wallsit_minutes && formData.wallsit_seconds);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      onSubmit(e);
    }
  };

  const renderProgressBar = () => {
    const progress = (currentStep / totalSteps) * 100;

    return (
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-text">
          {currentStep} / {totalSteps}
        </div>
      </div>
    );
  };

  const renderLanguageSelector = () => (
    <div className="language-selector">
      <div className="lang-toggle">
        <button
          className={`lang-btn ${language === 'tr' ? 'active' : ''}`}
          onClick={() => onLanguageChange('tr')}
        >
          TR
        </button>
        <button
          className={`lang-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => onLanguageChange('en')}
        >
          EN
        </button>
      </div>
    </div>
  );

  const renderFormField = (
    label: string,
    field: string,
    type = 'text',
    options?: { value: string; label: string }[]
  ) => (
    <div className="field-group">
      <label className="field-label">{label}</label>
      {type === 'select' && options ? (
        <select
          className="form-input"
          value={(formData as any)[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
        >
          <option value="">Seçiniz</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className="form-input"
          value={(formData as any)[field] || ''}
          onChange={(e) => handleInputChange(field, type === 'number' ? Number(e.target.value) : e.target.value)}
          placeholder={label}
        />
      )}
    </div>
  );

  const renderCheckboxGroup = (
    label: string,
    field: string,
    options: { value: string; label: string }[]
  ) => (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <div className="checkbox-group">
        {options.map(option => (
          <label key={option.value} className="checkbox-item">
            <input
              type="checkbox"
              checked={((formData as any)[field] as string[]).includes(option.value)}
              onChange={(e) => handleCheckboxChange(field, option.value, e.target.checked)}
            />
            <span className="checkbox-label">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2>{getText('basicInfo')}</h2>
            <div className="form-grid">
              {renderFormField(getText('name'), 'name')}
              {renderFormField(getText('gender'), 'gender', 'select', [
                { value: 'erkek', label: getText('male') },
                { value: 'kadın', label: getText('female') }
              ])}
              {renderFormField(getText('height'), 'height', 'number')}
              {renderFormField(getText('weight'), 'weight', 'number')}
              {renderFormField(getText('age'), 'age', 'number')}
              {renderFormField(getText('date'), 'date', 'date')}
              {renderFormField(getText('trainer'), 'trainer')}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2>{getText('cardiovascular')}</h2>
            <div className="form-grid">
              {renderFormField(getText('systolic'), 'systolic', 'number')}
              {renderFormField(getText('diastolic'), 'diastolic', 'number')}
              {renderFormField(getText('heartRate'), 'heart_rate', 'number')}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2>{getText('bodyComposition')}</h2>
            <div className="form-grid">
              {renderFormField(getText('bodyFat'), 'body_fat', 'number')}
              {renderFormField(getText('waist'), 'waist', 'number')}
              {renderFormField(getText('hip'), 'hip', 'number')}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2>{getText('respiratory')}</h2>
            <div className="form-grid">
              {renderFormField(getText('breathing'), 'breathing', 'select', [
                { value: 'normal', label: getText('normal') },
                { value: 'abnormal', label: getText('abnormal') }
              ])}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h2>{getText('gaitBalance')}</h2>
            <div className="form-grid">
              {renderFormField(getText('leftFoot'), 'left_foot', 'select', [
                { value: 'normal', label: getText('normal') },
                { value: 'abnormal', label: getText('abnormal') }
              ])}
              {renderFormField(getText('rightFoot'), 'right_foot', 'select', [
                { value: 'normal', label: getText('normal') },
                { value: 'abnormal', label: getText('abnormal') }
              ])}
              {renderFormField(getText('balanceLeft'), 'balance_left', 'number')}
              {renderFormField(getText('balanceRight'), 'balance_right', 'number')}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="step-content">
            <h2>{getText('posture')}</h2>
            <div className="form-grid">
              {renderCheckboxGroup(getText('staticPosture'), 'static_posture', [
                { value: 'head_forward', label: 'Baş öne' },
                { value: 'shoulder_elevation', label: 'Omuz yüksekliği' },
                { value: 'kyphosis', label: 'Kifoz' },
                { value: 'lordosis', label: 'Lordoz' },
                { value: 'pelvic_tilt', label: 'Pelvik eğim' }
              ])}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="step-content">
            <h2>{getText('mobility')}</h2>
            <div className="form-grid">
              {renderFormField(getText('shoulderLeft'), 'shoulder_left', 'select', [
                { value: 'normal', label: getText('normal') },
                { value: 'limited', label: 'Kısıtlı' }
              ])}
              {renderFormField(getText('shoulderRight'), 'shoulder_right', 'select', [
                { value: 'normal', label: getText('normal') },
                { value: 'limited', label: 'Kısıtlı' }
              ])}
              {renderFormField(getText('sitReach'), 'sit_reach', 'number')}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="step-content">
            <h2>{getText('strength')}</h2>
            <div className="form-grid">
              <div className="field-group">
                <label className="field-label">{getText('plank')}</label>
                <div className="time-inputs">
                  <input
                    type="number"
                    className="form-input"
                    value={(formData as any).plank_minutes || ''}
                    onChange={(e) => handleInputChange('plank_minutes', Number(e.target.value))}
                    placeholder={getText('minutes')}
                  />
                  <input
                    type="number"
                    className="form-input"
                    value={(formData as any).plank_seconds || ''}
                    onChange={(e) => handleInputChange('plank_seconds', Number(e.target.value))}
                    placeholder={getText('seconds')}
                  />
                </div>
              </div>
              {renderFormField(getText('pushups'), 'pushup_count', 'number')}
              <div className="field-group">
                <label className="field-label">{getText('wallSit')}</label>
                <div className="time-inputs">
                  <input
                    type="number"
                    className="form-input"
                    value={(formData as any).wallsit_minutes || ''}
                    onChange={(e) => handleInputChange('wallsit_minutes', Number(e.target.value))}
                    placeholder={getText('minutes')}
                  />
                  <input
                    type="number"
                    className="form-input"
                    value={(formData as any).wallsit_seconds || ''}
                    onChange={(e) => handleInputChange('wallsit_seconds', Number(e.target.value))}
                    placeholder={getText('seconds')}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="brand">
          <div className="logo">MF</div>
          <div>
            <div className="t1">{getText('title')}</div>
            <div className="t2">{invitation.createdBy.organization}</div>
          </div>
        </div>

        {renderProgressBar()}
        {renderLanguageSelector()}
      </div>

      {/* Form Content */}
      <form onSubmit={submitForm} className="form-container">
        {renderStepContent()}

        {/* Submit Error */}
        {submitError && (
          <div className="error-message">
            <p>{submitError}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn secondary"
              onClick={prevStep}
            >
              {getText('previous')}
            </button>
          )}

          <div className="nav-spacer"></div>

          {currentStep < totalSteps ? (
            <button
              type="button"
              className="btn primary"
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
            >
              {getText('next')}
            </button>
          ) : (
            <button
              type="submit"
              className="btn primary"
              disabled={!validateStep(currentStep) || isSubmitting}
            >
              {isSubmitting ? getText('submitting') : getText('submit')}
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default AssessmentForm;