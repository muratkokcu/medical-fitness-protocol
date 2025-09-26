import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientAPI } from '../services/api';
import AssessmentForm from '../components/assessment/AssessmentForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { Client } from '@medical-fitness/shared-types';
import './ClientAssessmentForm.css';

interface AssessmentData {
  clientId?: string;
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

const ClientAssessmentForm: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      setIsLoading(true);
      const response = await clientAPI.getClient(clientId!);
      setClient(response.data.data.client);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Müşteri bilgileri yüklenirken bir hata oluştu.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: AssessmentData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Ensure clientId is included in the data
      const assessmentData = {
        ...data,
        clientId: clientId
      };

      const token = localStorage.getItem('token');
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(assessmentData)
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
          clientId: result.clientId,
          clientName: result.clientName,
          timestamp: new Date().toISOString()
        }));

        // Navigate back to client detail page with success message
        navigate(`/dashboard/clients/${clientId}`, {
          state: {
            message: 'Değerlendirme başarıyla tamamlandı!',
            reportUrl: `/report/${result.reportId}?token=${result.readToken}`
          }
        });
      }

    } catch (err) {
      console.error('Assessment submission error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/clients/${clientId}`);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner message="Müşteri bilgileri yükleniyor..." size="large" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="error-container">
        <h2>Hata</h2>
        <p>{error || 'Müşteri bulunamadı.'}</p>
        <button onClick={() => navigate('/dashboard/clients')} className="btn-secondary">
          Müşteri Listesine Dön
        </button>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="loading-container">
        <LoadingSpinner message="Değerlendirme kaydediliyor..." size="large" />
      </div>
    );
  }

  return (
    <div className="client-assessment-page">
      {/* Navigation Header */}
      <div className="assessment-nav">
        <button onClick={handleCancel} className="back-button">
          ← {client.fullName} - Müşteri Detayına Dön
        </button>
        <h1>Değerlendirme Formu</h1>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <AssessmentForm
        onSubmit={handleSubmit}
        clientData={client}
        isClientAssessment={true}
      />
    </div>
  );
};

export default ClientAssessmentForm;