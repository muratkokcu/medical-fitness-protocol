import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import TrashIcon from '../components/icons/TrashIcon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { Client } from '@medical-fitness/shared-types';
import './ClientDetail.css';

interface Assessment {
  _id: string;
  createdAt: string;
  assessmentResults?: {
    overall?: {
      riskLevel: string;
      riskScore: number;
    };
  };
  reportData?: {
    code: string;
  };
  accessTokens?: {
    read: string;
  };
}


const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClientData();
      fetchClientAssessments();
    }
  }, [id]);

  const fetchClientData = async () => {
    try {
      setIsLoading(true);

      const clientResponse = await clientAPI.getClient(id!);
      setClient(clientResponse.data.data.client);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Müşteri bilgileri yüklenirken bir hata oluştu.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClientAssessments = async () => {
    try {
      setAssessmentsLoading(true);

      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/assessments/client/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAssessments(result.data.assessments || []);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setAssessmentsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/clients');
  };

  const handleEdit = () => {
    navigate(`/dashboard/clients/${id}/edit`);
  };


  const handleDeleteClient = () => {
    setDeleteModalOpen(true);
  };

  const confirmDeleteClient = async () => {
    try {
      setIsDeleting(true);
      await clientAPI.deleteClient(id!);
      navigate('/dashboard/clients');
    } catch (error: any) {
      console.error('Delete client error:', error);
      if (error.response?.status === 403) {
        alert('Bu işlem için yetkiniz bulunmamaktadır. Sadece admin kullanıcılar müşteri silebilir.');
      } else {
        alert('Müşteri silinirken bir hata oluştu.');
      }
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleStartAssessment = () => {
    // Navigate to client-specific assessment form
    navigate(`/dashboard/clients/${id}/assessment`);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Düşük':
        return '#10b981'; // green
      case 'Orta':
        return '#f59e0b'; // yellow
      case 'Orta-Yüksek':
        return '#f97316'; // orange
      case 'Yüksek':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const handleViewReport = (assessment: Assessment) => {
    if (assessment.reportData?.code && assessment.accessTokens?.read) {
      // Navigate to report view
      window.open(`/report/${assessment._id}?token=${assessment.accessTokens.read}`, '_blank');
    }
  };

  const handleDownloadReport = async (assessment: Assessment) => {
    if (!assessment.accessTokens?.read) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/${assessment._id}/download?token=${assessment.accessTokens.read}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${client?.fullName || 'client'}_assessment_${formatDate(assessment.createdAt).replace(/\s/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Rapor indirme işlemi başarısız oldu.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Rapor indirme sırasında bir hata oluştu.');
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
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
        <button onClick={handleBack} className="btn-secondary">
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className="client-detail-page">
      <div className="page-header">
        <div className="header-left">
          <button onClick={handleBack} className="back-btn">
            ← Müşteri Listesi
          </button>
          <h1>{client.fullName}</h1>
        </div>
        <div className="header-actions">
          <button
            onClick={handleStartAssessment}
            className="btn-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8M16 4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4M16 4C16 5.10457 15.1046 6 14 6H10C8.89543 6 8 5.10457 8 4M10 14L12 16L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Start Assessment
          </button>
          <button onClick={handleEdit} className="btn-secondary">
            Düzenle
          </button>
          {user?.role === 'admin' && (
            <button onClick={handleDeleteClient} className="btn-danger">
              <TrashIcon size={16} />
              Müşteriyi Sil
            </button>
          )}
        </div>
      </div>

      <div className="client-content">
        <div className="client-info-section">
          <div className="info-card">
            <div className="info-card-header">
              <h2>Kişisel Bilgiler</h2>
              <div className="registration-date">
                Kayıt: {formatDate(client.createdAt)}
              </div>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <label>Ad Soyad:</label>
                <span>{client.fullName}</span>
              </div>
              
              {client.email && (
                <div className="info-item">
                  <label>E-posta:</label>
                  <span>{client.email}</span>
                </div>
              )}
              
              {client.phone && (
                <div className="info-item">
                  <label>Telefon:</label>
                  <span>{client.phone}</span>
                </div>
              )}
              
              {client.dateOfBirth && (
                <div className="info-item">
                  <label>Doğum Tarihi:</label>
                  <span>{formatDate(client.dateOfBirth)} ({calculateAge(client.dateOfBirth)} yaş)</span>
                </div>
              )}
              
              {client.gender && (
                <div className="info-item">
                  <label>Cinsiyet:</label>
                  <span>
                    {client.gender === 'male' ? 'Erkek' : 
                     client.gender === 'female' ? 'Kadın' : 'Diğer'}
                  </span>
                </div>
              )}
              
              {client.occupation && (
                <div className="info-item">
                  <label>Meslek:</label>
                  <span>{client.occupation}</span>
                </div>
              )}
              
              {client.company && (
                <div className="info-item">
                  <label>Organizasyon/Şirket:</label>
                  <span>{client.company}</span>
                </div>
              )}
              
              <div className="info-item">
                <label>Ekleyen:</label>
                <span>{typeof client.createdBy === 'object' ? `${client.createdBy.firstName} ${client.createdBy.lastName}` : 'Belirtilmemiş'}</span>
              </div>
            </div>
          </div>

          {client.emergencyContact && (
            <div className="info-card">
              <h2>Acil Durum İletişim</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Ad:</label>
                  <span>{client.emergencyContact.name}</span>
                </div>
                <div className="info-item">
                  <label>Telefon:</label>
                  <span>{client.emergencyContact.phone}</span>
                </div>
                <div className="info-item">
                  <label>Yakınlık:</label>
                  <span>{client.emergencyContact.relationship}</span>
                </div>
              </div>
            </div>
          )}

          {client.medicalHistory && (
            <div className="info-card">
              <h2>Tıbbi Geçmiş</h2>
              <div className="medical-history">
                {client.medicalHistory.allergies && client.medicalHistory.allergies.length > 0 && (
                  <div className="medical-item">
                    <label>Alerjiler:</label>
                    <ul>
                      {client.medicalHistory.allergies.map((allergy, index) => (
                        <li key={index}>{allergy}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {client.medicalHistory.medications && client.medicalHistory.medications.length > 0 && (
                  <div className="medical-item">
                    <label>İlaçlar:</label>
                    <ul>
                      {client.medicalHistory.medications.map((medication, index) => (
                        <li key={index}>{medication}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {client.medicalHistory.conditions && client.medicalHistory.conditions.length > 0 && (
                  <div className="medical-item">
                    <label>Hastalıklar:</label>
                    <ul>
                      {client.medicalHistory.conditions.map((condition, index) => (
                        <li key={index}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {client.medicalHistory.notes && (
                  <div className="medical-item">
                    <label>Notlar:</label>
                    <p>{client.medicalHistory.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assessments Section */}
          <div className="info-card">
            <div className="info-card-header">
              <h2>Değerlendirmeler</h2>
              {assessments.length > 0 && (
                <span className="assessment-count">
                  Toplam: {assessments.length} değerlendirme
                </span>
              )}
            </div>

            {assessmentsLoading ? (
              <div className="assessments-loading">
                <LoadingSpinner message="Değerlendirmeler yükleniyor..." size="small" />
              </div>
            ) : assessments.length > 0 ? (
              <div className="assessments-list">
                {assessments.map((assessment) => (
                  <div key={assessment._id} className="assessment-item">
                    <div className="assessment-info">
                      <div className="assessment-date">
                        {formatDate(assessment.createdAt)}
                      </div>
                      {assessment.assessmentResults?.overall?.riskLevel && (
                        <div
                          className="risk-badge"
                          style={{
                            backgroundColor: getRiskLevelColor(assessment.assessmentResults.overall.riskLevel),
                            color: 'white'
                          }}
                        >
                          {assessment.assessmentResults.overall.riskLevel} Risk
                          {assessment.assessmentResults.overall.riskScore && (
                            <span className="risk-score">
                              ({assessment.assessmentResults.overall.riskScore}%)
                            </span>
                          )}
                        </div>
                      )}
                      {assessment.reportData?.code && (
                        <div className="report-code">
                          Kod: {assessment.reportData.code}
                        </div>
                      )}
                    </div>
                    <div className="assessment-actions">
                      <button
                        onClick={() => handleViewReport(assessment)}
                        className="btn-secondary btn-small"
                        disabled={!assessment.accessTokens?.read}
                      >
                        Görüntüle
                      </button>
                      <button
                        onClick={() => handleDownloadReport(assessment)}
                        className="btn-primary btn-small"
                        disabled={!assessment.accessTokens?.read}
                      >
                        İndir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-assessments">
                <p>Bu müşteri için henüz değerlendirme yapılmamış.</p>
                <button
                  onClick={handleStartAssessment}
                  className="btn-primary"
                >
                  İlk Değerlendirmeyi Başlat
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
      
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        title="Müşteriyi Sil"
        message={`${client?.fullName} adlı müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve müşteriye ait tüm değerlendirmeler de silinecektir.`}
        confirmText="Müşteriyi Sil"
        onConfirm={confirmDeleteClient}
        onCancel={() => setDeleteModalOpen(false)}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ClientDetail;