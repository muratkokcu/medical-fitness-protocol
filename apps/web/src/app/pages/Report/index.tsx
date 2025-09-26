import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ReportView from './ReportView';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './report.css';

interface ReportData {
  person: {
    name: string;
    birthYear: number;
    company: string;
    date: string;
    duration: string;
    level: string;
    priority: string;
  };
  risk: {
    score: number;
    label: string;
  };
  kpi: {
    hr: string;
    bp: string;
    bmi: string;
    activity: string;
  };
  cardiovascular: {
    blood_pressure: { value: string; status: string };
    heart_rate: { value: string; status: string };
  };
  body_composition: {
    body_fat: { value: string; status: string };
    waist_hip_ratio: { value: string; status: string };
  };
  respiratory: {
    pattern: { value: string; status: string };
    note: string;
  };
  mobility: {
    shoulder: { value: string; status: string };
    trunk: { value: string; status: string };
  };
  strength: {
    core: { value: string; status: string };
    upper_body: { value: number; status: string };
    lower_body: { value: string; status: string };
  };
  findings: Array<{ color: string; text: string }>;
  actions: Array<{ text: string; done: boolean }>;
  lifestyle: Array<{ color: string; text: string }>;
  metrics: Array<{
    k: string;
    v: string;
    range: string;
    status: string;
  }>;
  notes: string;
  priority_areas: Array<{ color: string; text: string }>;
  gait_analysis: Array<{
    side: string;
    status: string;
    note: string;
  }>;
  balance_tests: Array<{
    side: string;
    time: string;
    status: string;
  }>;
  posture_analysis: Array<{
    plane: string;
    observation: string;
  }>;
  upper_body_tests: Array<{
    test: string;
    score: number;
    evaluation: string;
  }>;
  lower_body_tests: Array<{
    test: string;
    time: string;
    evaluation: string;
  }>;
  code: string;
}

interface ReportMetadata {
  language: string;
  submissionId: string;
  generatedAt: string;
  practitioner: {
    name: string;
    organization: string;
  };
}

const Report: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('access');

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [metadata, setMetadata] = useState<ReportMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Geçersiz rapor bağlantısı');
      setIsLoading(false);
      return;
    }

    fetchReportData();
  }, [id, accessToken]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Build API URL with access token if available
      const url = accessToken
        ? `/api/reports/${id}?access=${accessToken}`
        : `/api/reports/${id}`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Rapor bulunamadı');
        } else if (response.status === 403) {
          throw new Error('Bu raporu görüntüleme yetkiniz bulunmuyor');
        } else if (response.status === 410) {
          throw new Error('Raporun süresi dolmuş');
        } else {
          throw new Error('Rapor yüklenirken bir hata oluştu');
        }
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Rapor verisi alınamadı');
      }

      setReportData(data.reportData);
      setMetadata(data.metadata);
    } catch (error: any) {
      console.error('Report fetch error:', error);
      setError(error.message || 'Rapor yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!id || !reportData) {
      return;
    }

    try {
      setIsPdfGenerating(true);

      // Build PDF URL with access token
      const url = accessToken
        ? `/api/reports/pdf?submissionId=${id}&access=${accessToken}`
        : `/api/reports/pdf?submissionId=${id}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('PDF oluşturulurken bir hata oluştu');
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `medical-fitness-report-${reportData.code}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      console.error('PDF download error:', error);
      alert(error.message || 'PDF indirilirken bir hata oluştu');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner message="Rapor yükleniyor..." size="large" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h1>Rapor Yüklenemedi</h1>
          <p>{error}</p>
          <div className="error-actions">
            <p>Lütfen bağlantınızı kontrol edin veya daha sonra tekrar deneyin.</p>
            <button
              onClick={fetchReportData}
              className="btn primary"
              style={{ marginTop: '16px' }}
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!reportData) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h1>Rapor Verisi Bulunamadı</h1>
          <p>Bu rapor için veri bulunamadı.</p>
        </div>
      </div>
    );
  }

  // Success state - show report
  return (
    <div className="report-container">
      {/* Action buttons - hidden when printing */}
      <div className="report-actions no-print">
        <div className="action-buttons">
          <button
            onClick={downloadPDF}
            disabled={isPdfGenerating}
            className="btn primary"
          >
            {isPdfGenerating ? 'PDF Hazırlanıyor...' : 'PDF İndir'}
          </button>
          <button
            onClick={printReport}
            className="btn secondary"
          >
            Yazdır
          </button>
        </div>
        {metadata && (
          <div className="report-info">
            <small>
              Rapor Kodu: {reportData.code} |
              Oluşturulma: {new Date(metadata.generatedAt).toLocaleDateString('tr-TR')} |
              Dil: {metadata.language.toUpperCase()}
            </small>
          </div>
        )}
      </div>

      {/* Report view */}
      <ReportView data={reportData} metadata={metadata} />
    </div>
  );
};

export default Report;