import React, { useState, useEffect } from 'react';
import type { AssessmentData, ValidationErrors } from '../types/assessment';
import './SinglePageAssessment.css';

// Simple chevron icons
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polyline points="6,9 12,15 18,9"></polyline>
  </svg>
);

const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polyline points="18,15 12,9 6,15"></polyline>
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <path d="m9,9 0,0a3,3 0 0,1 6,0c0,2 -3,3 -3,3"/>
    <path d="m9,17 .01,0"/>
  </svg>
);

const ReferenceRangeTooltip: React.FC<{ 
  ranges: ReferenceRange[];
  gender?: string;
}> = ({ ranges, gender }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Filter ranges based on gender if specified
  const filteredRanges = ranges.filter(range => 
    !range.gender || !gender || range.gender === gender
  );

  if (filteredRanges.length === 0) return null;

  return (
    <div className="reference-range-tooltip">
      <button
        type="button"
        className="info-icon-btn"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        <InfoIcon />
      </button>
      {isVisible && (
        <div className="tooltip-content">
          <div className="tooltip-title">Referans Aralıkları</div>
          {filteredRanges.map((range, index) => (
            <div key={index} className={`range-item range-${range.color}`}>
              <span className="range-label">{range.label}:</span>
              <span className="range-value">{range.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ReferenceRange {
  label: string;
  value: string;
  color: 'green' | 'yellow' | 'red' | 'blue';
  gender?: 'male' | 'female';
}

interface Section {
  id: string;
  title: string;
  fields: Array<{
    id: string; 
    label: string; 
    type: string;
    required?: boolean;
    step?: string;
    options?: Array<{value: string; text: string}>;
    rows?: number;
    referenceRanges?: ReferenceRange[];
  }>;
}

interface SinglePageAssessmentProps {
  initialData?: AssessmentData;
  onSave?: (data: AssessmentData, isCompleted?: boolean) => Promise<void>;
  onComplete?: (data: AssessmentData) => void;
  onExit?: () => void;
  isReadOnly?: boolean;
  mode?: 'create' | 'edit' | 'view';
}

const ASSESSMENT_SECTIONS: Section[] = [
  {
    id: 'personal',
    title: 'Değerlendirme Bilgileri',
    fields: [
      { id: 'assessmentDate', label: 'Değerlendirme Tarihi', type: 'date', required: true },
      { id: 'trainer', label: 'Trainer', type: 'text', required: true },
      { id: 'height', label: 'Boy (cm)', type: 'number', required: true },
      { id: 'weight', label: 'Kilo (kg)', type: 'number', required: true }
    ]
  },
  {
    id: 'physical',
    title: 'Fiziksel Ölçümler',
    fields: [
      { 
        id: 'systolicBP', 
        label: 'Sistolik Tansiyon', 
        type: 'number',
        referenceRanges: [
          { label: 'Normal', value: '<120', color: 'green' },
          { label: '1. Seviye', value: '120-139', color: 'yellow' },
          { label: '2. Seviye', value: '140-159', color: 'red' },
          { label: '3. Seviye', value: '≥160', color: 'red' }
        ]
      },
      { 
        id: 'diastolicBP', 
        label: 'Diastolik Tansiyon', 
        type: 'number',
        referenceRanges: [
          { label: 'Normal', value: '<80', color: 'green' },
          { label: '1. Seviye', value: '80-89', color: 'yellow' },
          { label: '2. Seviye', value: '90-99', color: 'red' },
          { label: '3. Seviye', value: '≥100', color: 'red' }
        ]
      },
      { 
        id: 'restingHR', 
        label: 'Dinlenik Nabız', 
        type: 'number',
        referenceRanges: [
          { label: 'Mükemmel', value: '60-70', color: 'green' },
          { label: 'İyi', value: '70-80', color: 'green' },
          { label: 'Normal', value: '80-90', color: 'yellow' },
          { label: 'Yüksek', value: '>90', color: 'red' }
        ]
      },
      { 
        id: 'bodyTemperature', 
        label: 'Vücut Sıcaklığı', 
        type: 'number', 
        step: '0.1',
        referenceRanges: [
          { label: 'Normal', value: '36.5-37.2°C', color: 'green' },
          { label: 'Hafif Ateş', value: '37.3-38.0°C', color: 'yellow' },
          { label: 'Ateş', value: '>38.0°C', color: 'red' }
        ]
      },
      { 
        id: 'bodyFatPercentage', 
        label: 'Vücut Yağ Oranı (%)', 
        type: 'number', 
        step: '0.1',
        referenceRanges: [
          { label: 'Çok İyi', value: '8-12%', color: 'green', gender: 'male' },
          { label: 'Normal', value: '13-20%', color: 'yellow', gender: 'male' },
          { label: 'Riskli', value: '20%+', color: 'red', gender: 'male' },
          { label: 'Çok İyi', value: '14-20%', color: 'green', gender: 'female' },
          { label: 'Normal', value: '21-31%', color: 'yellow', gender: 'female' },
          { label: 'Riskli', value: '31%+', color: 'red', gender: 'female' }
        ]
      },
      { id: 'muscleMass', label: 'Kas Kütlesi (kg)', type: 'number', step: '0.1' },
      { 
        id: 'visceralFat', 
        label: 'Viseral Yağ', 
        type: 'number',
        referenceRanges: [
          { label: 'Sağlıklı', value: '1-12', color: 'green' },
          { label: 'Fazla', value: '13-15', color: 'yellow' },
          { label: 'Yüksek', value: '>15', color: 'red' }
        ]
      },
      { 
        id: 'waistCircumference', 
        label: 'Bel Çevresi (cm)', 
        type: 'number',
        referenceRanges: [
          { label: 'Normal', value: '<94cm', color: 'green', gender: 'male' },
          { label: 'Risk', value: '94-102cm', color: 'yellow', gender: 'male' },
          { label: 'Yüksek Risk', value: '>102cm', color: 'red', gender: 'male' },
          { label: 'Normal', value: '<80cm', color: 'green', gender: 'female' },
          { label: 'Risk', value: '80-88cm', color: 'yellow', gender: 'female' },
          { label: 'Yüksek Risk', value: '>88cm', color: 'red', gender: 'female' }
        ]
      },
      { id: 'hipCircumference', label: 'Kalça Çevresi (cm)', type: 'number' }
    ]
  },
  {
    id: 'movement',
    title: 'Hareket Değerlendirmesi', 
    fields: [
      { id: 'respiratoryRate', label: 'Solunum Hızı', type: 'number' },
      { id: 'peakFlowRate', label: 'Peak Flow', type: 'number' },
      { id: 'breathHoldTime', label: 'Nefes Tutma (sn)', type: 'number' },
      { id: 'shoulderFlexion', label: 'Omuz Fleksiyonu', type: 'number' },
      { id: 'shoulderExtension', label: 'Omuz Ekstansiyonu', type: 'number' },
      { id: 'spinalRotation', label: 'Spinal Rotasyon', type: 'number' },
      { id: 'hipFlexibility', label: 'Kalça Esnekliği', type: 'number' },
      { id: 'ankleFlexibility', label: 'Ayak Bileği Esnekliği', type: 'number' },
      { id: 'staticBalance', label: 'Statik Denge (sn)', type: 'number' },
      { id: 'shoulderMobilityLeft', label: 'Sol Omuz Mobility', type: 'number' },
      { id: 'shoulderMobilityRight', label: 'Sağ Omuz Mobility', type: 'number' },
      { id: 'walkingFootStrikeLeft', label: 'Sol Ayak Basış', type: 'number' },
      { id: 'walkingFootStrikeRight', label: 'Sağ Ayak Basış', type: 'number' }
    ]
  },
  {
    id: 'posture',
    title: 'Postür Analizi',
    fields: [
      { id: 'staticPosture', label: 'Statik Postür', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'excellent', text: 'Mükemmel' }, 
        { value: 'good', text: 'İyi' }, { value: 'fair', text: 'Orta' }, { value: 'poor', text: 'Zayıf' }
      ]},
      { id: 'dynamicPosture', label: 'Dinamik Postür', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'excellent', text: 'Mükemmel' }, 
        { value: 'good', text: 'İyi' }, { value: 'fair', text: 'Orta' }, { value: 'poor', text: 'Zayıf' }
      ]},
      { id: 'forwardHeadPosture', label: 'İleri Baş Postürü', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'none', text: 'Yok' }, { value: 'mild', text: 'Hafif' }, 
        { value: 'moderate', text: 'Orta' }, { value: 'severe', text: 'Şiddetli' }
      ]},
      { id: 'roundedShoulders', label: 'Yuvarlak Omuzlar', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'none', text: 'Yok' }, { value: 'mild', text: 'Hafif' }, 
        { value: 'moderate', text: 'Orta' }, { value: 'severe', text: 'Şiddetli' }
      ]},
      { id: 'kyphosis', label: 'Kifoz', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'none', text: 'Yok' }, { value: 'mild', text: 'Hafif' }, 
        { value: 'moderate', text: 'Orta' }, { value: 'severe', text: 'Şiddetli' }
      ]},
      { id: 'lordosis', label: 'Lordoz', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'none', text: 'Yok' }, { value: 'mild', text: 'Hafif' }, 
        { value: 'moderate', text: 'Orta' }, { value: 'severe', text: 'Şiddetli' }
      ]},
      { id: 'overheadSquatLeft', label: 'Overhead Squat Sol', type: 'textarea', rows: 2 },
      { id: 'overheadSquatRight', label: 'Overhead Squat Sağ', type: 'textarea', rows: 2 }
    ]
  },
  {
    id: 'performance',
    title: 'Performans Testleri',
    fields: [
      { 
        id: 'pushUps', 
        label: 'Şınav Sayısı', 
        type: 'number',
        referenceRanges: [
          { label: 'Mükemmel', value: '≥50', color: 'green', gender: 'male' },
          { label: 'İyi', value: '40-49', color: 'green', gender: 'male' },
          { label: 'Ortalama', value: '30-39', color: 'yellow', gender: 'male' },
          { label: 'Zayıf', value: '<30', color: 'red', gender: 'male' },
          { label: 'Mükemmel', value: '≥35', color: 'green', gender: 'female' },
          { label: 'İyi', value: '25-34', color: 'green', gender: 'female' },
          { label: 'Ortalama', value: '15-24', color: 'yellow', gender: 'female' },
          { label: 'Zayıf', value: '<15', color: 'red', gender: 'female' }
        ]
      },
      { 
        id: 'plankTime', 
        label: 'Plank Süresi (sn)', 
        type: 'number',
        referenceRanges: [
          { label: 'Mükemmel', value: '≥120sn', color: 'green' },
          { label: 'İyi', value: '90-119sn', color: 'green' },
          { label: 'Ortalama', value: '60-89sn', color: 'yellow' },
          { label: 'Zayıf', value: '<60sn', color: 'red' }
        ]
      },
      { 
        id: 'squats', 
        label: 'Squat Sayısı', 
        type: 'number',
        referenceRanges: [
          { label: 'Mükemmel', value: '≥25', color: 'green' },
          { label: 'İyi', value: '20-24', color: 'green' },
          { label: 'Ortalama', value: '15-19', color: 'yellow' },
          { label: 'Zayıf', value: '<15', color: 'red' }
        ]
      },
      { 
        id: 'wallSitTime', 
        label: 'Wall Sit (sn)', 
        type: 'number',
        referenceRanges: [
          { label: 'Mükemmel', value: '≥90sn', color: 'green' },
          { label: 'İyi', value: '60-89sn', color: 'green' },
          { label: 'Ortalama', value: '30-59sn', color: 'yellow' },
          { label: 'Zayıf', value: '<30sn', color: 'red' }
        ]
      }
    ]
  },
  {
    id: 'clinical',
    title: 'Klinik Değerlendirme',
    fields: [
      { id: 'overallRisk', label: 'Risk Seviyesi', type: 'select', required: true, options: [
        { value: '', text: 'Seçiniz' }, { value: 'low', text: 'Düşük' }, 
        { value: 'moderate', text: 'Orta' }, { value: 'high', text: 'Yüksek' }
      ]},
      { id: 'fitnessLevel', label: 'Fitness Seviyesi', type: 'select', required: true, options: [
        { value: '', text: 'Seçiniz' }, { value: 'excellent', text: 'Mükemmel' }, 
        { value: 'good', text: 'İyi' }, { value: 'average', text: 'Ortalama' }, { value: 'poor', text: 'Zayıf' }
      ]},
      { id: 'recommendations', label: 'Öneriler', type: 'textarea', rows: 3 },
      { id: 'medicalFitnessExpert', label: 'Fitness Uzmanı', type: 'text' },
      { id: 'instructor', label: 'Eğitmen', type: 'text' },
      { id: 'overallResult', label: 'Genel Sonuç', type: 'textarea', rows: 3 }
    ]
  }
];

const SinglePageAssessment: React.FC<SinglePageAssessmentProps> = ({
  initialData = {},
  onSave,
  onComplete,
  onExit,
  isReadOnly = false,
  mode = 'create'
}) => {
  const [assessmentData, setAssessmentData] = useState<AssessmentData>(initialData);
  const [expandedSections, setExpandedSections] = useState<string[]>(['personal']);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Mode is used for autosave control in parent AssessmentContainer
  void mode;

  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setAssessmentData(initialData);
    }
  }, [initialData]);

  // Auto-save
  useEffect(() => {
    const saveData = async () => {
      if (onSave && Object.keys(assessmentData).length > 1) {
        try {
          setIsSaving(true);
          await onSave(assessmentData, false);
        } catch (error) {
          console.error('Auto-save error:', error);
        } finally {
          setIsSaving(false);
        }
      }
    };

    const timeoutId = setTimeout(saveData, 2000);
    return () => clearTimeout(timeoutId);
  }, [assessmentData, onSave]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const updateAssessmentData = (updates: Partial<AssessmentData>) => {
    setAssessmentData(prev => ({ ...prev, ...updates }));
    
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

  const handleInputChange = (fieldId: string, value: any) => {
    updateAssessmentData({ [fieldId]: value });
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    ASSESSMENT_SECTIONS.forEach(section => {
      section.fields.forEach(field => {
        if (field.required) {
          const value = assessmentData[field.id as keyof AssessmentData];
          if (!value || value === '') {
            errors[field.id] = `${field.label} alanı zorunludur`;
          }
        }
      });
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleComplete = () => {
    if (validateForm()) {
      if (onComplete) {
        onComplete(assessmentData);
      }
    }
  };

  const renderField = (field: any) => {
    const value = assessmentData[field.id as keyof AssessmentData] || '';
    const hasError = validationErrors[field.id];

    const commonProps = {
      id: field.id,
      value: value as string,
      disabled: isReadOnly,
      className: `form-input ${hasError ? 'error' : ''}`,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => 
        handleInputChange(field.id, e.target.value)
    };

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="form-field">
            <label className="form-label">
              {field.label}
              {field.required && <span className="required">*</span>}
              {field.referenceRanges && (
                <ReferenceRangeTooltip 
                  ranges={field.referenceRanges} 
                  gender={assessmentData.gender}
                />
              )}
            </label>
            <select {...commonProps}>
              {field.options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.text}
                </option>
              ))}
            </select>
            {hasError && <span className="error-text">{validationErrors[field.id]}</span>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="form-field">
            <label className="form-label">
              {field.label}
              {field.required && <span className="required">*</span>}
              {field.referenceRanges && (
                <ReferenceRangeTooltip 
                  ranges={field.referenceRanges} 
                  gender={assessmentData.gender}
                />
              )}
            </label>
            <textarea 
              {...commonProps}
              rows={field.rows || 3}
              placeholder={field.placeholder}
            />
            {hasError && <span className="error-text">{validationErrors[field.id]}</span>}
          </div>
        );

      default:
        return (
          <div key={field.id} className="form-field">
            <label className="form-label">
              {field.label}
              {field.required && <span className="required">*</span>}
              {field.referenceRanges && (
                <ReferenceRangeTooltip 
                  ranges={field.referenceRanges} 
                  gender={assessmentData.gender}
                />
              )}
            </label>
            <input 
              {...commonProps}
              type={field.type || 'text'}
              step={field.step}
              placeholder={field.placeholder}
            />
            {hasError && <span className="error-text">{validationErrors[field.id]}</span>}
          </div>
        );
    }
  };

  return (
    <div className="single-page-assessment">
      <div className="assessment-header">
        <h1>Medikal Fitness Değerlendirmesi</h1>
        <div className="header-actions">
          <span className="save-status">
            {isSaving ? '💾 Kaydediliyor...' : '✅ Kaydedildi'}
          </span>
          <button onClick={onExit} className="btn-secondary">
            Çıkış
          </button>
        </div>
      </div>

      <div className="assessment-content">
        {ASSESSMENT_SECTIONS.map((section) => (
          <div key={section.id} className="assessment-section">
            <div 
              className="section-header"
              onClick={() => toggleSection(section.id)}
            >
              <h2>{section.title}</h2>
              {expandedSections.includes(section.id) ? 
                <ChevronUpIcon className="chevron" /> : 
                <ChevronDownIcon className="chevron" />
              }
            </div>
            
            {expandedSections.includes(section.id) && (
              <div className="section-content">
                <div className="form-grid">
                  {section.fields.map(renderField)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="assessment-footer">
        <button onClick={handleComplete} className="btn-primary btn-large">
          Değerlendirmeyi Tamamla
        </button>
      </div>
    </div>
  );
};

export default SinglePageAssessment;