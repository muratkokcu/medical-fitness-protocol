import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './ClientForm.css';

interface ClientFormData {
  fullName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
  company?: string;
}

interface ClientFormProps {
  mode?: 'create' | 'edit';
}

const ClientForm: React.FC<ClientFormProps> = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<ClientFormData>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: undefined,
    occupation: '',
    company: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchClientData();
    }
  }, [mode, id]);

  const fetchClientData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await clientAPI.getClient(id);
      const client = response.data.data.client;
      
      setFormData({
        fullName: client.fullName || '',
        email: client.email || '',
        phone: client.phone || '',
        dateOfBirth: client.dateOfBirth ? 
          new Date(client.dateOfBirth).toISOString().split('T')[0] : '',
        gender: client.gender || undefined,
        occupation: client.occupation || '',
        company: client.company || ''
      });
    } catch (error: any) {
      console.error('Fetch client error:', error);
      setError('Müşteri bilgileri yüklenirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      setError('Ad Soyad alanı zorunludur.');
      return false;
    }
    
    if (formData.email && !isValidEmail(formData.email)) {
      setError('Geçerli bir e-posta adresi girin.');
      return false;
    }
    
    return true;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const submitData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined
      };

      if (mode === 'create') {
        const response = await clientAPI.createClient(submitData);
        const newClientId = response.data.data.client._id;
        navigate(`/dashboard/clients/${newClientId}`);
      } else if (mode === 'edit' && id) {
        await clientAPI.updateClient(id, submitData);
        navigate(`/dashboard/clients/${id}`);
      }
    } catch (error: any) {
      console.error('Client save error:', error);
      setError(
        error.response?.data?.message || 
        `Müşteri ${mode === 'create' ? 'ekleme' : 'güncelleme'} sırasında hata oluştu.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'edit' && id) {
      navigate(`/dashboard/clients/${id}`);
    } else {
      navigate('/dashboard/clients');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner message="Müşteri bilgileri yükleniyor..." size="large" />
      </div>
    );
  }

  return (
    <div className="client-form-page">
      <div className="page-header">
        <div className="header-left">
          <button onClick={handleCancel} className="back-btn">
            ← Geri
          </button>
          <h1>{mode === 'create' ? 'Yeni Müşteri Ekle' : 'Müşteri Düzenle'}</h1>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="client-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-section">
            <h2>Temel Bilgiler</h2>
            
            <div className="form-row">
              <div className="form-field required">
                <label htmlFor="fullName">Ad Soyad</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Müşteri adı soyadı"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="phone">Telefon</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0555 123 45 67"
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">E-posta</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="dateOfBirth">Doğum Tarihi</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor="gender">Cinsiyet</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Seçiniz</option>
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="occupation">Meslek</label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  placeholder="Meslek (opsiyonel)"
                />
              </div>

              <div className="form-field">
                <label htmlFor="company">Organizasyon/Şirket</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Çalıştığı kurum/şirket"
                />
              </div>
            </div>

          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 
                (mode === 'create' ? 'Ekleniyor...' : 'Güncelleniyor...') :
                (mode === 'create' ? 'Müşteri Ekle' : 'Değişiklikleri Kaydet')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;