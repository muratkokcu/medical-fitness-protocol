import React, { useState } from 'react';
import type { AssessmentData, TestResults } from '../types/assessment';
import { RiskIndicator, ProgressRing, MetricCard, GaugeChart } from './visual';
import { assessOverallRisk, getBMIRisk, getBloodPressureRisk, getPulseRisk, getBodyFatRisk, getRiskColor } from '../utils/riskAssessment';
import type { RiskLevel } from './visual/RiskIndicator';

interface SummaryReportProps {
  assessmentData: AssessmentData;
  testResults: TestResults;
}

const SummaryReport: React.FC<SummaryReportProps> = ({ assessmentData, testResults }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const riskAssessment = assessOverallRisk(assessmentData, testResults);
  const handleSave = () => {
    const reportData = {
      assessmentData,
      testResults,
      riskAssessment,
      timestamp: new Date().toISOString()
    };
    
    const savedReports = localStorage.getItem('savedMedicalReports');
    const reports = savedReports ? JSON.parse(savedReports) : [];
    reports.push(reportData);
    localStorage.setItem('savedMedicalReports', JSON.stringify(reports));
    
    // Create a better notification instead of alert
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = 'Rapor başarıyla kaydedildi!';
    document.body.appendChild(notification);
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRestart = () => {
    localStorage.removeItem('medicalFitnessAssessment');
    window.location.reload();
  };

  // Helper functions to get risk levels and values
  const getBMIValue = () => {
    if (assessmentData.height && assessmentData.weight) {
      return assessmentData.weight / Math.pow(assessmentData.height / 100, 2);
    }
    return null;
  };

  const bmiValue = getBMIValue();

  return (
    <div className="visual-report-section">
      {/* Header with patient info and overall score */}
      <div className="report-header">
        <div className="patient-info">
          <h2 className="report-title">
            {assessmentData.fullName || 'Katılımcı'} - Medikal Fitness Raporu
          </h2>
          <div className="patient-details">
            <span>{assessmentData.assessmentDate || 'Tarih belirtilmemiş'}</span>
            <span>•</span>
            <span>{assessmentData.gender === 'male' ? 'Erkek' : 'Kadın'}</span>
            <span>•</span>
            <span>{assessmentData.age || '—'} yaş</span>
            <span>•</span>
            <span>Trainer: {assessmentData.trainer || '—'}</span>
          </div>
        </div>
        
        <div className="overall-score">
          <ProgressRing 
            progress={riskAssessment.score}
            size={120}
            color={getRiskColor(riskAssessment.overall)}
            label="Sağlık Skoru"
            value={`${riskAssessment.score}%`}
          />
        </div>
      </div>

      {/* Risk Categories Overview */}
      <div className="risk-categories">
        <h3 className="section-title">Risk Durumu Özeti</h3>
        <div className="risk-category-grid">
          <RiskIndicator
            level={riskAssessment.cardiovascular}
            label="Kardiyovasküler"
            size="large"
          />
          <RiskIndicator
            level={riskAssessment.bodyComposition}
            label="Vücut Kompozisyonu"
            size="large"
          />
          <RiskIndicator
            level={riskAssessment.physical}
            label="Fiziksel Fitness"
            size="large"
          />
          <RiskIndicator
            level={riskAssessment.postural}
            label="Postural Sağlık"
            size="large"
          />
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="metrics-dashboard">
        <h3 className="section-title">Ana Sağlık Göstergeleri</h3>
        <div className="metrics-grid">
          {/* BMI Card */}
          {bmiValue && (
            <MetricCard
              title="Vücut Kitle İndeksi"
              value={bmiValue.toFixed(1)}
              riskLevel={getBMIRisk(bmiValue)}
              description={testResults.bmi?.result}
              onClick={() => setActiveSection(activeSection === 'bmi' ? null : 'bmi')}
              expanded={activeSection !== 'bmi'}
            />
          )}

          {/* Blood Pressure Card */}
          {assessmentData.systolicBP && assessmentData.diastolicBP && (
            <MetricCard
              title="Kan Basıncı"
              value={`${assessmentData.systolicBP}/${assessmentData.diastolicBP}`}
              unit="mmHg"
              riskLevel={getBloodPressureRisk(assessmentData.systolicBP, assessmentData.diastolicBP)}
              description={testResults.bloodPressure?.result}
              onClick={() => setActiveSection(activeSection === 'bp' ? null : 'bp')}
              expanded={activeSection !== 'bp'}
            />
          )}

          {/* Heart Rate Card */}
          {assessmentData.restingHR && (
            <MetricCard
              title="Dinlenik Nabız"
              value={assessmentData.restingHR}
              unit="bpm"
              riskLevel={getPulseRisk(assessmentData.restingHR)}
              description={testResults.pulse?.result}
              onClick={() => setActiveSection(activeSection === 'hr' ? null : 'hr')}
              expanded={activeSection !== 'hr'}
            />
          )}

          {/* Body Fat Card */}
          {assessmentData.bodyFatPercentage && assessmentData.gender && (
            <MetricCard
              title="Vücut Yağ Oranı"
              value={assessmentData.bodyFatPercentage}
              unit="%"
              riskLevel={getBodyFatRisk(assessmentData.bodyFatPercentage, assessmentData.gender)}
              description={testResults.bodyFat?.result}
              onClick={() => setActiveSection(activeSection === 'bf' ? null : 'bf')}
              expanded={activeSection !== 'bf'}
            />
          )}
        </div>
      </div>

      {/* Physical Performance Section */}
      <div className="performance-section">
        <h3 className="section-title">Fiziksel Performans</h3>
        <div className="performance-grid">
          
          {/* Balance Gauge */}
          {assessmentData.staticBalance && (
            <div className="gauge-container">
              <GaugeChart
                value={assessmentData.staticBalance}
                min={0}
                max={60}
                label="Denge Testi"
                unit="sn"
                thresholds={{ low: 30, moderate: 15 }}
              />
            </div>
          )}

          {/* Flexibility Metrics */}
          {(assessmentData.shoulderMobilityLeft || assessmentData.shoulderMobilityRight) && (
            <div className="flexibility-container">
              <h4>Omuz Mobilitesi</h4>
              <div className="flexibility-values">
                {assessmentData.shoulderMobilityLeft && (
                  <div className="flex-value">Sol: {assessmentData.shoulderMobilityLeft}cm</div>
                )}
                {assessmentData.shoulderMobilityRight && (
                  <div className="flex-value">Sağ: {assessmentData.shoulderMobilityRight}cm</div>
                )}
              </div>
            </div>
          )}

          {/* Strength Tests */}
          {(assessmentData.pushUps || assessmentData.plankTime) && (
            <div className="strength-container">
              <h4>Kuvvet Testleri</h4>
              <div className="strength-metrics">
                {assessmentData.pushUps && (
                  <div className="strength-item">
                    <span>Şınav:</span>
                    <strong>{assessmentData.pushUps}</strong>
                  </div>
                )}
                {assessmentData.plankTime && (
                  <div className="strength-item">
                    <span>Plank:</span>
                    <strong>{assessmentData.plankTime}sn</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Assessment */}
      {(assessmentData.overallRisk || assessmentData.fitnessLevel || assessmentData.recommendations) && (
        <div className="clinical-section">
          <h3 className="section-title">Klinik Değerlendirme</h3>
          <div className="clinical-grid">
            {assessmentData.overallRisk && (
              <div className="clinical-card">
                <div className="clinical-label">Genel Risk Seviyesi</div>
                <RiskIndicator
                  level={assessmentData.overallRisk as RiskLevel}
                  label=""
                  size="medium"
                />
              </div>
            )}
            
            {assessmentData.fitnessLevel && (
              <div className="clinical-card">
                <div className="clinical-label">Fitness Seviyesi</div>
                <div className="fitness-level">
                  {assessmentData.fitnessLevel === 'excellent' ? 'Mükemmel' :
                   assessmentData.fitnessLevel === 'good' ? 'İyi' :
                   assessmentData.fitnessLevel === 'average' ? 'Ortalama' : 'Zayıf'}
                </div>
              </div>
            )}
          </div>
          
          {assessmentData.recommendations && (
            <div className="recommendations-card">
              <h4>Öneriler ve Notlar</h4>
              <p>{assessmentData.recommendations}</p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="visual-report-actions">
        <button className="action-btn primary" onClick={handleSave}>
          📊 Raporu Kaydet
        </button>
        <button className="action-btn secondary" onClick={handlePrint}>
          🖨️ Raporu Yazdır
        </button>
        <button className="action-btn tertiary" onClick={handleRestart}>
          🔄 Yeni Değerlendirme
        </button>
      </div>
    </div>
  );
};

export default SummaryReport;