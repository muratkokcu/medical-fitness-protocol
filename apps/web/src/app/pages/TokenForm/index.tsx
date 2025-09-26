import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AssessmentForm from './AssessmentForm';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './form.css';

interface ClientInfo {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
}

interface FormData {
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
}

const initialFormData: FormData = {
  // Basic Information
  name: '',
  gender: '',
  height: '',
  weight: '',
  age: '',
  date: new Date().toISOString().split('T')[0],
  trainer: '',

  // Cardiovascular
  systolic: '',
  diastolic: '',
  heart_rate: '',

  // Body Composition
  body_fat: '',
  waist: '',
  hip: '',

  // Respiratory
  breathing: '',

  // Gait & Balance
  left_foot: '',
  right_foot: '',
  balance_left: '',
  balance_right: '',

  // Static Posture
  static_posture: [],

  // Dynamic Posture
  dynamic_anterior: [],
  dynamic_lateral: [],
  dynamic_posterior: [],

  // Mobility
  shoulder_left: '',
  shoulder_right: '',
  sit_reach: '',

  // Strength
  plank_minutes: '',
  plank_seconds: '',
  pushup_count: '',
  wallsit_minutes: '',
  wallsit_seconds: ''
};

const ClientAssessmentForm: React.FC = () => {
  const { clientId } = useParams<{ clientId?: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<ClientInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load client data on component mount
  useEffect(() => {
    if (clientId) {
      loadClientData();
    } else {
      setError('Müşteri ID\'si bulunamadı');
      setIsLoading(false);
    }
  }, [clientId]);

  // Pre-fill form with client name when loaded
  useEffect(() => {
    if (client?.fullName) {
      setFormData(prev => ({
        ...prev,
        name: client.fullName
      }));
    }
  }, [client]);

  const loadClientData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading client data for ID:', clientId);

      const response = await fetch(`/api/clients/public/validate/${clientId}`);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ API returned non-JSON response:', contentType);
        throw new Error('Sunucudan geçersiz yanıt alındı. Lütfen daha sonra tekrar deneyin.');
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError);
        throw new Error('Sunucu yanıtı okunamadı. Lütfen daha sonra tekrar deneyin.');
      }

      if (!response.ok) {
        const errorMessage = data?.message || `HTTP ${response.status}: Müşteri bulunamadı`;
        console.error('❌ API error:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.success || !data.data?.client) {
        console.error('❌ Invalid response structure:', data);
        throw new Error('Müşteri bilgileri eksik veya hatalı');
      }

      console.log('✅ Client data loaded successfully:', data.data.client.fullName);
      setClient(data.data.client);

    } catch (error: any) {
      console.error('❌ Client loading error:', error);
      setError(error.message || 'Müşteri bilgileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormDataChange = (newData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleLanguageChange = (newLanguage: 'tr' | 'en') => {
    setLanguage(newLanguage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!client) {
      setSubmitError('Müşteri bilgileri bulunamadı');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      console.log('🚀 Submitting assessment for client:', client.fullName);

      const response = await fetch(`/api/clients/${clientId}/submit-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          language,
          clientId
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Submission API returned non-JSON response:', contentType);
        throw new Error('Sunucudan geçersiz yanıt alındı. Lütfen daha sonra tekrar deneyin.');
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ JSON parsing failed during submission:', parseError);
        throw new Error('Sunucu yanıtı okunamadı. Lütfen daha sonra tekrar deneyin.');
      }

      if (!response.ok) {
        const errorMessage = data?.message || `HTTP ${response.status}: Form gönderimi başarısız`;
        console.error('❌ Submission API error:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.success) {
        console.error('❌ Submission failed:', data);
        throw new Error(data.message || 'Form gönderimi başarısız');
      }

      console.log('✅ Assessment submitted successfully');

      // Redirect to report page
      if (data.reportUrl) {
        window.location.href = data.reportUrl;
      } else {
        navigate(`/report/${data.submissionId}?access=${data.readToken}`);
      }
    } catch (error: any) {
      console.error('❌ Form submission error:', error);
      setSubmitError(error.message || 'Form gönderilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner message="Müşteri bilgileri yükleniyor..." size="large" />
      </div>
    );
  }

  // Error state
  if (error || !client) {
    return (
      <div className="container">
        <div className="error-container">
          <div className="error-card">
            <h1>Hata</h1>
            <p>{error || 'Müşteri bilgileri bulunamadı.'}</p>
            <div className="error-actions">
              <p>Lütfen müşteri detay sayfasından tekrar deneyin.</p>
              <button onClick={() => navigate('/dashboard/clients')} className="btn-secondary">
                Müşteri Listesine Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Assessment form
  return (
    <div className="container">
      <AssessmentForm
        invitation={{
          id: 'client-assessment',
          createdBy: {
            firstName: 'Medical',
            lastName: 'Fitness',
            organization: 'Assessment'
          },
          patientInfo: {
            name: client.fullName,
            email: client.email,
            phone: client.phone
          },
          settings: {
            language: 'tr',
            expiresAt: ''
          }
        }}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        language={language}
        onLanguageChange={handleLanguageChange}
        progress={progress}
        onProgressChange={setProgress}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  );
};

export default ClientAssessmentForm;