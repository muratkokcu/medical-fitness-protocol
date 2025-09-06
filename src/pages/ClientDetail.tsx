import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientAPI, assessmentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import TrashIcon from '../components/icons/TrashIcon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { Client, Assessment } from '../types/assessment';
import './ClientDetail.css';


const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteAssessmentModalOpen, setDeleteAssessmentModalOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClientData();
    }
  }, [id]);

  const fetchClientData = async () => {
    try {
      setIsLoading(true);
      const [clientResponse, assessmentsResponse] = await Promise.all([
        clientAPI.getClient(id!),
        assessmentAPI.getAssessments({ clientId: id, limit: 20 })
      ]);

      setClient(clientResponse.data.client);
      setAssessments(assessmentsResponse.data.data.assessments);
    } catch (error: unknown) {
      console.error('Fetch client data error:', error);
      setError('Müşteri bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/clients');
  };

  const handleEdit = () => {
    navigate(`/dashboard/clients/${id}/edit`);
  };

  const handleNewAssessment = () => {
    navigate(`/dashboard/clients/${id}/assessment/new`);
  };

  const handleGenerateReport = (assessmentId: string) => {
    window.open(`/report/${assessmentId}`, '_blank', 'width=1000,height=800');
  };

  const handleEditAssessment = (assessmentId: string) => {
    navigate(`/dashboard/clients/${id}/assessment/${assessmentId}/edit`);
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

  const handleDeleteAssessment = (assessmentId: string) => {
    setAssessmentToDelete(assessmentId);
    setDeleteAssessmentModalOpen(true);
  };

  const confirmDeleteAssessment = async () => {
    if (!assessmentToDelete) return;
    
    try {
      setIsDeleting(true);
      await assessmentAPI.deleteAssessment(assessmentToDelete);
      fetchClientData(); // Refresh data
    } catch (error: any) {
      console.error('Delete assessment error:', error);
      if (error.response?.status === 403) {
        alert('Bu işlem için yetkiniz bulunmamaktadır. Sadece admin kullanıcılar değerlendirme silebilir.');
      } else {
        alert('Değerlendirme silinirken bir hata oluştu.');
      }
    } finally {
      setIsDeleting(false);
      setDeleteAssessmentModalOpen(false);
      setAssessmentToDelete(null);
    }
  };

  const canEditAssessment = (status: string) => {
    return status === 'draft' || status === 'in_progress';
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

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      'completed': { text: 'Tamamlandı', className: 'status-completed' },
      'in_progress': { text: 'Devam Ediyor', className: 'status-in-progress' },
      'reviewed': { text: 'İncelendi', className: 'status-reviewed' },
      'draft': { text: 'Taslak', className: 'status-draft' }
    };
    
    const statusInfo = statusMap[status] || { text: status, className: 'status-unknown' };
    
    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
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
          <button onClick={handleEdit} className="btn-secondary">
            Düzenle
          </button>
          <button onClick={handleNewAssessment} className="btn-primary">
            Yeni Değerlendirme
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
        </div>

        <div className="assessments-section">
          <div className="assessments-card">
            <div className="card-header">
              <h2>Değerlendirme Geçmişi</h2>
              <div className="assessment-stats">
                <span className="stat-item">
                  Toplam: <strong>{client.totalAssessments}</strong>
                </span>
                {client.lastAssessment && (
                  <span className="stat-item">
                    Son: <strong>{formatDate(client.lastAssessment)}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="assessments-list">
              {assessments.length > 0 ? (
                assessments.map((assessment) => (
                  <div key={assessment._id} className="assessment-item">
                    <div className="assessment-header">
                      <div className="assessment-date">
                        {formatDate(assessment.assessmentDate)}
                      </div>
                      {getStatusBadge(assessment.status)}
                    </div>
                    <div className="assessment-details">
                      <span className="practitioner">
                        Uygulayıcı: {assessment.practitioner.firstName} {assessment.practitioner.lastName}
                      </span>
                    </div>
                    <div className="assessment-actions">
                      {canEditAssessment(assessment.status) && (
                        <button 
                          onClick={() => handleEditAssessment(assessment._id)}
                          className="btn-small btn-edit"
                          title="Düzenle"
                        >
                          Düzenle
                        </button>
                      )}
                      {assessment.status === 'completed' && (
                        <button 
                          onClick={() => handleGenerateReport(assessment._id)}
                          className="btn-small btn-primary"
                          title="Rapor Oluştur"
                        >
                          Rapor
                        </button>
                      )}
                      <button 
                        onClick={() => navigate(`/dashboard/clients/${id}/assessment/${assessment._id}`)}
                        className="btn-small btn-secondary"
                      >
                        Görüntüle
                      </button>
                      {user?.role === 'admin' && (
                        <button 
                          onClick={() => handleDeleteAssessment(assessment._id)}
                          className="btn-small btn-danger"
                          title="Sil"
                        >
                          <TrashIcon size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-assessments">
                  <p>Henüz değerlendirme yapılmamış.</p>
                  <button onClick={handleNewAssessment} className="btn-primary">
                    İlk Değerlendirmeyi Başlat
                  </button>
                </div>
              )}
            </div>
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
      
      <DeleteConfirmationModal
        isOpen={deleteAssessmentModalOpen}
        title="Değerlendirmeyi Sil"
        message="Bu değerlendirmeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Değerlendirmeyi Sil"
        onConfirm={confirmDeleteAssessment}
        onCancel={() => {
          setDeleteAssessmentModalOpen(false);
          setAssessmentToDelete(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ClientDetail;