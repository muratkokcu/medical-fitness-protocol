import React, { useEffect, useState } from 'react';
import { clientAPI, assessmentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Client, Assessment } from '../types/assessment';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Dashboard.css';

// Clean SVG Icon Components
const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8M16 4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4M16 4C16 5.10457 15.1046 6 14 6H10C8.89543 6 8 5.10457 8 4M9 12H15M9 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4905 2.02168 11.3363C2.16356 9.18206 2.99721 7.13175 4.39828 5.49395C5.79935 3.85615 7.69279 2.71268 9.79619 2.24003C11.8996 1.76737 14.1003 1.98898 16.07 2.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UserPlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 1.17157 16.1716C0.421427 16.9217 0 17.9391 0 19V21M12.5 7C12.5 9.20914 10.7091 11 8.5 11C6.29086 11 4.5 9.20914 4.5 7C4.5 4.79086 6.29086 3 8.5 3C10.7091 3 12.5 4.79086 12.5 7ZM20 8V14M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FileTextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="12" y1="20" x2="12" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="18" y1="20" x2="18" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="6" y1="20" x2="6" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface DashboardStats {
  totalClients: number;
  totalAssessments: number;
  completedAssessments: number;
  inProgressAssessments: number;
  recentClients: Client[];
  recentAssessments: Assessment[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalAssessments: 0,
    completedAssessments: 0,
    inProgressAssessments: 0,
    recentClients: [],
    recentAssessments: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [clientStatsResponse, assessmentStatsResponse] = await Promise.all([
          clientAPI.getClientStats(),
          assessmentAPI.getAssessmentStats()
        ]);

        const clientStats = clientStatsResponse.data.data;
        const assessmentStats = assessmentStatsResponse.data.data;

        setStats({
          totalClients: clientStats.stats?.totalClients || 0,
          totalAssessments: assessmentStats.stats?.totalAssessments || 0,
          completedAssessments: assessmentStats.stats?.completedAssessments || 0,
          inProgressAssessments: assessmentStats.stats?.inProgressAssessments || 0,
          recentClients: clientStats.recentClients || [],
          recentAssessments: assessmentStats.recentAssessments || []
        });
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner message="Veriler yükleniyor..." size="large" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Hoş Geldiniz, {user?.firstName}!</h1>
          <p>İşte organizasyonunuzun güncel durumu:</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/dashboard/clients/new')}
            className="action-btn primary"
          >
            <span className="action-icon">
              <UserPlusIcon />
            </span>
            Yeni Müşteri
          </button>
          <button 
            onClick={() => navigate('/dashboard/clients')}
            className="action-btn secondary"
          >
            <span className="action-icon">
              <FileTextIcon />
            </span>
            Müşteri Listesi
          </button>
          <button 
            onClick={() => navigate('/dashboard/reports')}
            className="action-btn tertiary"
          >
            <span className="action-icon">
              <BarChartIcon />
            </span>
            Raporlar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <UsersIcon />
          </div>
          <div className="stat-content">
            <h3>Toplam Müşteri</h3>
            <div className="stat-value">{stats.totalClients}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <ClipboardIcon />
          </div>
          <div className="stat-content">
            <h3>Toplam Değerlendirme</h3>
            <div className="stat-value">{stats.totalAssessments}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircleIcon />
          </div>
          <div className="stat-content">
            <h3>Tamamlanan</h3>
            <div className="stat-value">{stats.completedAssessments}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <ClockIcon />
          </div>
          <div className="stat-content">
            <h3>Devam Eden</h3>
            <div className="stat-value">{stats.inProgressAssessments}</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-content">
        <div className="content-section">
          <h2>Son Eklenen Müşteriler</h2>
          <div className="recent-list">
            {stats.recentClients.length > 0 ? (
              stats.recentClients.map((client) => (
                <div key={client._id} className="recent-item">
                  <div className="item-avatar">
                    {client.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="item-details">
                    <div className="item-title">{client.fullName}</div>
                    <div className="item-subtitle">
                      {client.email || 'E-posta belirtilmemiş'}
                    </div>
                  </div>
                  <div className="item-meta">
                    {formatDate(client.createdAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Henüz müşteri eklenmemiş</p>
              </div>
            )}
          </div>
        </div>

        <div className="content-section">
          <h2>Son Değerlendirmeler</h2>
          <div className="recent-list">
            {stats.recentAssessments.length > 0 ? (
              stats.recentAssessments.map((assessment) => (
                <div key={assessment._id} className="recent-item">
                  <div className="item-avatar">
                    {assessment.client?.fullName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="item-details">
                    <div className="item-title">
                      {assessment.client?.fullName || 'Bilinmeyen Müşteri'}
                    </div>
                    <div className="item-subtitle">
                      Uygulayıcı: {assessment.practitioner?.firstName} {assessment.practitioner?.lastName}
                    </div>
                  </div>
                  <div className="item-meta">
                    <div className={`status-badge status-${assessment.status}`}>
                      {assessment.status === 'completed' ? 'Tamamlandı' : 
                       assessment.status === 'in_progress' ? 'Devam Ediyor' : 
                       assessment.status === 'reviewed' ? 'İncelendi' : 'Taslak'}
                    </div>
                    <div className="item-date">
                      {formatDate(assessment.assessmentDate)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Henüz değerlendirme yapılmamış</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;