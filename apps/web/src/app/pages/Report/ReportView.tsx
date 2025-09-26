import React from 'react';
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

interface ReportViewProps {
  data: ReportData;
  metadata: ReportMetadata | null;
}

const ReportView: React.FC<ReportViewProps> = ({ data, metadata }) => {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'iyi':
      case 'excellent':
      case 'ok':
        return 'status-good';
      case 'normal':
      case 'orta':
        return 'status-normal';
      case 'dikkat':
      case 'riskli':
      case 'warning':
        return 'status-warning';
      case 'yüksek':
      case 'risk':
      case 'critical':
        return 'status-risk';
      default:
        return 'status-normal';
    }
  };

  const getRiskMeterClass = (score: number) => {
    if (score <= 25) return 'risk-low';
    if (score <= 50) return 'risk-moderate';
    if (score <= 75) return 'risk-high';
    return 'risk-critical';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="header-section">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">MF</div>
            <div className="brand-info">
              <h1>Medical Fitness Raporu</h1>
              <p className="subtitle">Kapsamlı Sağlık ve Fitness Değerlendirmesi</p>
            </div>
          </div>
          <div className="report-info">
            <p><strong>Rapor Kodu:</strong> {data.code}</p>
            <p><strong>Tarih:</strong> {formatDate(data.person.date)}</p>
            {metadata && (
              <p><strong>Oluşturulma:</strong> {formatDate(metadata.generatedAt)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="summary">
        <div className="patient-info">
          <h2>Hasta Bilgileri</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Ad Soyad:</span>
              <span className="value">{data.person.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Doğum Yılı:</span>
              <span className="value">{data.person.birthYear}</span>
            </div>
            <div className="info-item">
              <span className="label">Kurum:</span>
              <span className="value">{data.person.company}</span>
            </div>
            <div className="info-item">
              <span className="label">Test Tarihi:</span>
              <span className="value">{formatDate(data.person.date)}</span>
            </div>
            <div className="info-item">
              <span className="label">Antrenör:</span>
              <span className="value">{metadata?.practitioner.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Aktivite Seviyesi:</span>
              <span className="value">{data.kpi.activity}</span>
            </div>
          </div>
        </div>

        {/* Risk Score */}
        <div className="risk-section">
          <h3>Risk Skoru</h3>
          <div className={`meter ${getRiskMeterClass(data.risk.score)}`}>
            <div className="meter-fill" style={{ transform: `rotate(${(data.risk.score / 100) * 180}deg)` }}>
              <div className="meter-bar"></div>
            </div>
            <div className="score">
              <b>{data.risk.score}</b>
              <span>{data.risk.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="kpi-section">
        <h2>Anahtar Göstergeler</h2>
        <div className="grid-4">
          <div className="kpi-card">
            <div className="kpi-label">Kalp Hızı</div>
            <div className="kpi-value">{data.kpi.hr}</div>
            <div className={`kpi-status ${getStatusClass(data.cardiovascular.heart_rate.status)}`}>
              {data.cardiovascular.heart_rate.status}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Kan Basıncı</div>
            <div className="kpi-value">{data.kpi.bp}</div>
            <div className={`kpi-status ${getStatusClass(data.cardiovascular.blood_pressure.status)}`}>
              {data.cardiovascular.blood_pressure.status}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">BMI</div>
            <div className="kpi-value">{data.kpi.bmi}</div>
            <div className="kpi-status status-normal">Normal</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Aktivite</div>
            <div className="kpi-value">{data.kpi.activity}</div>
            <div className="kpi-status status-good">İyi</div>
          </div>
        </div>
      </div>

      {/* Detailed Assessment Results */}
      <div className="assessment-section">
        <h2>Detaylı Değerlendirme</h2>

        {/* Cardiovascular */}
        <div className="card">
          <h3>Kardiyovasküler Sistem</h3>
          <div className="grid-2">
            <div className="metric">
              <span className="metric-label">Kan Basıncı:</span>
              <span className="metric-value">{data.cardiovascular.blood_pressure.value}</span>
              <span className={`metric-status ${getStatusClass(data.cardiovascular.blood_pressure.status)}`}>
                {data.cardiovascular.blood_pressure.status}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Kalp Hızı:</span>
              <span className="metric-value">{data.cardiovascular.heart_rate.value}</span>
              <span className={`metric-status ${getStatusClass(data.cardiovascular.heart_rate.status)}`}>
                {data.cardiovascular.heart_rate.status}
              </span>
            </div>
          </div>
        </div>

        {/* Body Composition */}
        <div className="card">
          <h3>Vücut Kompozisyonu</h3>
          <div className="grid-2">
            <div className="metric">
              <span className="metric-label">Vücut Yağ Oranı:</span>
              <span className="metric-value">{data.body_composition.body_fat.value}</span>
              <span className={`metric-status ${getStatusClass(data.body_composition.body_fat.status)}`}>
                {data.body_composition.body_fat.status}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Bel/Kalça Oranı:</span>
              <span className="metric-value">{data.body_composition.waist_hip_ratio.value}</span>
              <span className={`metric-status ${getStatusClass(data.body_composition.waist_hip_ratio.status)}`}>
                {data.body_composition.waist_hip_ratio.status}
              </span>
            </div>
          </div>
        </div>

        {/* Respiratory */}
        <div className="card">
          <h3>Solunum Sistemi</h3>
          <div className="metric">
            <span className="metric-label">Solunum Paterni:</span>
            <span className="metric-value">{data.respiratory.pattern.value}</span>
            <span className={`metric-status ${getStatusClass(data.respiratory.pattern.status)}`}>
              {data.respiratory.pattern.status}
            </span>
          </div>
          {data.respiratory.note && (
            <p className="note">{data.respiratory.note}</p>
          )}
        </div>

        {/* Mobility */}
        <div className="card">
          <h3>Hareket Kabiliyeti</h3>
          <div className="grid-2">
            <div className="metric">
              <span className="metric-label">Omuz Hareketliliği:</span>
              <span className="metric-value">{data.mobility.shoulder.value}</span>
              <span className={`metric-status ${getStatusClass(data.mobility.shoulder.status)}`}>
                {data.mobility.shoulder.status}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Gövde Esnekliği:</span>
              <span className="metric-value">{data.mobility.trunk.value}</span>
              <span className={`metric-status ${getStatusClass(data.mobility.trunk.status)}`}>
                {data.mobility.trunk.status}
              </span>
            </div>
          </div>
        </div>

        {/* Strength */}
        <div className="card">
          <h3>Kas Gücü</h3>
          <div className="grid-3">
            <div className="metric">
              <span className="metric-label">Core Gücü:</span>
              <span className="metric-value">{data.strength.core.value}</span>
              <span className={`metric-status ${getStatusClass(data.strength.core.status)}`}>
                {data.strength.core.status}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Üst Vücut:</span>
              <span className="metric-value">{data.strength.upper_body.value} şınav</span>
              <span className={`metric-status ${getStatusClass(data.strength.upper_body.status)}`}>
                {data.strength.upper_body.status}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Alt Vücut:</span>
              <span className="metric-value">{data.strength.lower_body.value}</span>
              <span className={`metric-status ${getStatusClass(data.strength.lower_body.status)}`}>
                {data.strength.lower_body.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Findings and Recommendations */}
      <div className="findings-section">
        <h2>Bulgular ve Öneriler</h2>

        {/* Findings */}
        {data.findings && data.findings.length > 0 && (
          <div className="card">
            <h3>Ana Bulgular</h3>
            <ul className="finding-list">
              {data.findings.map((finding, index) => (
                <li key={index} className={`finding-item ${finding.color}`}>
                  {finding.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Priority Areas */}
        {data.priority_areas && data.priority_areas.length > 0 && (
          <div className="card">
            <h3>Öncelik Alanları</h3>
            <ul className="priority-list">
              {data.priority_areas.map((area, index) => (
                <li key={index} className={`priority-item ${area.color}`}>
                  {area.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Items */}
        {data.actions && data.actions.length > 0 && (
          <div className="card">
            <h3>Önerilen Aksiyonlar</h3>
            <ul className="action-list">
              {data.actions.map((action, index) => (
                <li key={index} className={`action-item ${action.done ? 'completed' : 'pending'}`}>
                  <input type="checkbox" checked={action.done} readOnly />
                  <span>{action.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lifestyle Recommendations */}
        {data.lifestyle && data.lifestyle.length > 0 && (
          <div className="card">
            <h3>Yaşam Tarzı Önerileri</h3>
            <ul className="lifestyle-list">
              {data.lifestyle.map((item, index) => (
                <li key={index} className={`lifestyle-item ${item.color}`}>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Detailed Test Results */}
      {(data.gait_analysis?.length > 0 || data.balance_tests?.length > 0 || data.posture_analysis?.length > 0) && (
        <div className="detailed-tests">
          <h2>Detaylı Test Sonuçları</h2>

          {/* Gait Analysis */}
          {data.gait_analysis && data.gait_analysis.length > 0 && (
            <div className="card">
              <h3>Yürüyüş Analizi</h3>
              <div className="test-grid">
                {data.gait_analysis.map((test, index) => (
                  <div key={index} className="test-item">
                    <span className="test-label">{test.side}:</span>
                    <span className={`test-status ${getStatusClass(test.status)}`}>{test.status}</span>
                    {test.note && <span className="test-note">{test.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Balance Tests */}
          {data.balance_tests && data.balance_tests.length > 0 && (
            <div className="card">
              <h3>Denge Testleri</h3>
              <div className="test-grid">
                {data.balance_tests.map((test, index) => (
                  <div key={index} className="test-item">
                    <span className="test-label">{test.side}:</span>
                    <span className="test-value">{test.time}</span>
                    <span className={`test-status ${getStatusClass(test.status)}`}>{test.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posture Analysis */}
          {data.posture_analysis && data.posture_analysis.length > 0 && (
            <div className="card">
              <h3>Postür Analizi</h3>
              <div className="test-grid">
                {data.posture_analysis.map((analysis, index) => (
                  <div key={index} className="test-item">
                    <span className="test-label">{analysis.plane}:</span>
                    <span className="test-observation">{analysis.observation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Additional Notes */}
      {data.notes && (
        <div className="notes-section">
          <div className="card">
            <h3>Ek Notlar</h3>
            <p className="notes-content">{data.notes}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="footer-section">
        <div className="footer-content">
          <p className="disclaimer">
            Bu rapor, Medical Fitness değerlendirme sistemleri kullanılarak oluşturulmuştur.
            Sonuçlar referans amaçlıdır ve tıbbi tanı yerine geçmez.
            Herhangi bir sağlık sorunu için mutlaka bir sağlık profesyoneli ile görüşün.
          </p>
          <div className="report-meta">
            {metadata && (
              <>
                <p><strong>Rapor ID:</strong> {metadata.submissionId}</p>
                <p><strong>Oluşturan:</strong> {metadata.practitioner.name}</p>
                <p><strong>Kurum:</strong> {metadata.practitioner.organization}</p>
                <p><strong>Oluşturulma Tarihi:</strong> {formatDate(metadata.generatedAt)}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;