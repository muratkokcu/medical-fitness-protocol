import React from 'react';
import type { AssessmentData } from '../types/assessment';

interface AssessmentCompletionProps {
  assessmentData: AssessmentData;
  onClose?: () => void;
}

const AssessmentCompletion: React.FC<AssessmentCompletionProps> = ({ 
  assessmentData
  // onClose - not used currently but kept for future use
}) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 32px',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <div style={{
        fontSize: '64px',
        marginBottom: '24px',
        color: '#007AFF'
      }}>
        ✓
      </div>
      
      <h2 style={{
        fontSize: '28px',
        fontWeight: '600',
        color: '#000',
        marginBottom: '16px',
        letterSpacing: '-0.5px'
      }}>
        Değerlendirme Tamamlandı!
      </h2>
      
      <p style={{
        fontSize: '18px',
        color: '#6E6E73',
        lineHeight: '1.5',
        marginBottom: '32px'
      }}>
        {assessmentData.fullName ? `${assessmentData.fullName} için` : ''} 
        14 adımlık medical fitness değerlendirmesi başarıyla tamamlandı ve sisteme kaydedildi.
      </p>

      <div style={{
        background: '#F5F5F7',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        textAlign: 'left'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#000',
          marginBottom: '16px'
        }}>
          Değerlendirme Özeti
        </h3>
        
        <div style={{
          display: 'grid',
          gap: '8px',
          fontSize: '14px',
          color: '#6E6E73'
        }}>
          {assessmentData.assessmentDate && (
            <div>
              <strong>Tarih:</strong> {new Date(assessmentData.assessmentDate).toLocaleDateString('tr-TR')}
            </div>
          )}
          {assessmentData.trainer && (
            <div>
              <strong>Trainer:</strong> {assessmentData.trainer}
            </div>
          )}
          {assessmentData.age && (
            <div>
              <strong>Yaş:</strong> {assessmentData.age}
            </div>
          )}
          {assessmentData.height && assessmentData.weight && (
            <div>
              <strong>Vücut Bilgileri:</strong> {assessmentData.height}cm / {assessmentData.weight}kg
            </div>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        fontSize: '14px',
        color: '#8E8E93',
        textAlign: 'center'
      }}>
        <div>
          Detaylı raporu müşteri sayfasından görüntüleyebilirsiniz
        </div>
        <div>
          Tüm veriler otomatik olarak kaydedilmiştir
        </div>
      </div>
    </div>
  );
};

export default AssessmentCompletion;