import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AssessmentForm from '../components/assessment/AssessmentForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface AssessmentData {
  name: string;
  gender: 'erkek' | 'kadın' | '';
  trainer: string;
  height: number | '';
  weight: number | '';
  age: number | '';
  date: string;
  systolic: number | '';
  diastolic: number | '';
  heart_rate: number | '';
  body_fat: number | '';
  waist: number | '';
  hip: number | '';
  breathing: 'normal' | 'disfonksiyon' | 'zayif_diyafram' | 'apikal' | '';
  left_foot: 'normal' | 'pronation' | 'supination' | '';
  right_foot: 'normal' | 'pronation' | 'supination' | '';
  balance_left: number | '';
  balance_right: number | '';
  shoulder_left: 'iyi' | 'normal' | 'riskli' | '';
  shoulder_right: 'iyi' | 'normal' | 'riskli' | '';
  sit_reach: number | '';
}

const AssessmentFormPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (data: AssessmentData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Assessment submission failed');
      }

      if (result.success) {
        // Store assessment result for report page
        localStorage.setItem('assessmentResult', JSON.stringify({
          submissionId: result.submissionId,
          reportId: result.reportId,
          reportCode: result.reportCode,
          readToken: result.readToken,
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          timestamp: new Date().toISOString()
        }));

        // Navigate to report page
        navigate(`/report/${result.reportId}?token=${result.readToken}`);
      }

    } catch (err) {
      console.error('Assessment submission error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <LoadingSpinner />
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          Değerlendirme işleniyor...
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div style={{
          background: 'var(--risk)',
          color: 'white',
          padding: '16px',
          borderRadius: '8px',
          margin: '20px',
          textAlign: 'center'
        }}>
          <strong>Hata:</strong> {error}
          <button
            onClick={() => setError(null)}
            style={{
              background: 'transparent',
              border: '1px solid white',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              marginLeft: '12px',
              cursor: 'pointer'
            }}
          >
            Kapat
          </button>
        </div>
      )}

      <AssessmentForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AssessmentFormPage;