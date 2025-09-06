import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';
import { performAllCalculations } from '../utils/calculations';
import type { AssessmentData, TestResults, Assessment } from '../types/assessment';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './AssessmentReport.css';


const AssessmentReport: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({});
  const [testResults, setTestResults] = useState<TestResults>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (assessmentId) {
      fetchAssessmentData();
    }
  }, [assessmentId]);

  const fetchAssessmentData = async () => {
    try {
      setIsLoading(true);
      const response = await assessmentAPI.getAssessment(assessmentId!);
      const assessmentData = response.data.assessment;
      
      setAssessment(assessmentData);
      
      // Transform backend data to frontend format for calculations
      const frontendData = transformBackendToFrontend(assessmentData);
      setAssessmentData(frontendData);
      
      // Perform calculations
      const results = performAllCalculations(frontendData);
      setTestResults(results);
      
    } catch (error: any) {
      console.error('Fetch assessment error:', error);
      setError('Assessment verisi yüklenirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const transformBackendToFrontend = (backendAssessment: any): AssessmentData => {
    return {
      // Personal Information
      fullName: backendAssessment.client?.fullName,
      gender: backendAssessment.personalInfo?.gender,
      age: backendAssessment.personalInfo?.age,
      height: backendAssessment.personalInfo?.height,
      weight: backendAssessment.personalInfo?.weight,
      trainer: backendAssessment.personalInfo?.trainer,
      
      // Vital Signs
      systolicBP: backendAssessment.vitalSigns?.systolicBP,
      diastolicBP: backendAssessment.vitalSigns?.diastolicBP,
      restingHR: backendAssessment.vitalSigns?.restingHR,
      bodyTemperature: backendAssessment.vitalSigns?.bodyTemperature,
      
      // Body Composition
      bodyFatPercentage: backendAssessment.bodyComposition?.bodyFatPercentage,
      muscleMass: backendAssessment.bodyComposition?.muscleMass,
      waistCircumference: backendAssessment.bodyComposition?.waistCircumference,
      hipCircumference: backendAssessment.bodyComposition?.hipCircumference,
      
      // Add more fields as needed for calculations...
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    if (assessment && typeof assessment.client === 'object' && assessment.client._id) {
      navigate(`/dashboard/clients/${assessment.client._id}/assessment/${assessmentId}/edit`);
    }
  };

  const canEdit = () => {
    return assessment && (assessment.status === 'draft' || assessment.status === 'in_progress');
  };

  if (isLoading) {
    return (
      <div className="report-loading">
        <LoadingSpinner message="Rapor yükleniyor..." size="large" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="report-error">
        <h2>Hata</h2>
        <p>{error || 'Assessment bulunamadı.'}</p>
      </div>
    );
  }

  return (
    <div className="assessment-report">
      <div className="report-header no-print">
        <h1>Medical Fitness Değerlendirme Raporu</h1>
        <div className="report-actions">
          {canEdit() && (
            <button onClick={handleEdit} className="btn-edit">
              Düzenle
            </button>
          )}
          <button onClick={handlePrint} className="btn-primary">
            Yazdır
          </button>
          <button onClick={() => window.close()} className="btn-secondary">
            Kapat
          </button>
        </div>
      </div>

      <div className="report-content">
        {/* Header Section */}
        <div className="report-title">
          <h1>MEDICAL FITNESS DEĞERLENDIRME RAPORU</h1>
          <div className="report-date">
            Rapor Tarihi: {formatDate(assessment.assessmentDate)}
          </div>
        </div>

        {/* Client Information */}
        <div className="report-section">
          <h2>Müşteri Bilgileri</h2>
          <div className="info-grid">
            <div className="info-row">
              <span className="label">Ad Soyad:</span>
              <span className="value">{typeof assessment.client === 'object' ? assessment.client.fullName : 'Bilinmeyen'}</span>
            </div>
            {typeof assessment.client === 'object' && assessment.client.dateOfBirth && (
              <div className="info-row">
                <span className="label">Doğum Tarihi:</span>
                <span className="value">
                  {formatDate(assessment.client.dateOfBirth)} 
                  ({assessmentData.age ? ` - ${assessmentData.age} yaş` : ''})
                </span>
              </div>
            )}
            {typeof assessment.client === 'object' && assessment.client.gender && (
              <div className="info-row">
                <span className="label">Cinsiyet:</span>
                <span className="value">
                  {typeof assessment.client === 'object' && assessment.client.gender === 'male' ? 'Erkek' : 
                   typeof assessment.client === 'object' && assessment.client.gender === 'female' ? 'Kadın' : 'Diğer'}
                </span>
              </div>
            )}
            {typeof assessment.client === 'object' && assessment.client.occupation && (
              <div className="info-row">
                <span className="label">Meslek:</span>
                <span className="value">{typeof assessment.client === 'object' ? assessment.client.occupation : ''}</span>
              </div>
            )}
            {typeof assessment.client === 'object' && assessment.client.phone && (
              <div className="info-row">
                <span className="label">Telefon:</span>
                <span className="value">{typeof assessment.client === 'object' ? assessment.client.phone : ''}</span>
              </div>
            )}
            <div className="info-row">
              <span className="label">Uygulayıcı:</span>
              <span className="value">
                {assessment.practitioner.firstName} {assessment.practitioner.lastName}
              </span>
            </div>
          </div>
        </div>

        {/* Physical Measurements */}
        {(assessmentData.height || assessmentData.weight) && (
          <div className="report-section">
            <h2>Fiziksel Ölçümler</h2>
            <div className="measurements-grid">
              {assessmentData.height && (
                <div className="measurement-item">
                  <span className="measurement-label">Boy:</span>
                  <span className="measurement-value">{assessmentData.height} cm</span>
                </div>
              )}
              {assessmentData.weight && (
                <div className="measurement-item">
                  <span className="measurement-label">Kilo:</span>
                  <span className="measurement-value">{assessmentData.weight} kg</span>
                </div>
              )}
              {testResults.bmi && (
                <div className="measurement-item">
                  <span className="measurement-label">BMI:</span>
                  <span className="measurement-value">
                    {testResults.bmi.value} - {testResults.bmi.category}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vital Signs */}
        {(assessmentData.systolicBP || assessmentData.restingHR) && (
          <div className="report-section">
            <h2>Vital Bulgular</h2>
            <div className="measurements-grid">
              {assessmentData.systolicBP && assessmentData.diastolicBP && (
                <div className="measurement-item">
                  <span className="measurement-label">Tansiyon:</span>
                  <span className="measurement-value">
                    {assessmentData.systolicBP}/{assessmentData.diastolicBP} mmHg
                  </span>
                </div>
              )}
              {assessmentData.restingHR && (
                <div className="measurement-item">
                  <span className="measurement-label">Dinlenik Nabız:</span>
                  <span className="measurement-value">{assessmentData.restingHR} bpm</span>
                </div>
              )}
              {assessmentData.bodyTemperature && (
                <div className="measurement-item">
                  <span className="measurement-label">Vücut Sıcaklığı:</span>
                  <span className="measurement-value">{assessmentData.bodyTemperature} °C</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Test Results Summary */}
        <div className="report-section">
          <h2>Değerlendirme Sonuçları</h2>
          <div className="results-summary">
            {Object.entries(testResults).map(([key, result]) => {
              if (!result || typeof result !== 'object') return null;
              
              return (
                <div key={key} className="result-item">
                  <div className="result-header">
                    <span className="result-name">{getTestName(key)}:</span>
                    <span className={`result-status ${result.status || ''}`}>
                      {result.result}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="report-footer">
          <div className="footer-info">
            <p>Bu rapor Medical Fitness Protocol sistemi tarafından otomatik olarak üretilmiştir.</p>
            <p>Rapor Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get user-friendly test names
const getTestName = (key: string): string => {
  const testNames: { [key: string]: string } = {
    bmi: 'Vücut Kitle İndeksi',
    bloodPressure: 'Kan Basıncı',
    pulse: 'Nabız',
    bodyFat: 'Vücut Yağ Oranı',
    whr: 'Bel-Kalça Oranı',
    respiratory: 'Solunum Fonksiyonu',
    balance: 'Denge',
    shoulderMobility: 'Omuz Mobility',
    trunkFlexibility: 'Gövde Esnekliği',
    staticPosture: 'Statik Postür',
    dynamicPosture: 'Dinamik Postür',
    strengthTests: 'Kuvvet Testleri',
    clinicalAssessment: 'Klinik Değerlendirme'
  };
  
  return testNames[key] || key;
};

export default AssessmentReport;