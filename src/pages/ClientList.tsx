import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Client } from '../types/assessment';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import TrashIcon from '../components/icons/TrashIcon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './ClientList.css';

// Professional SVG Icon Components
const UserPlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M12.5 7C12.5 9.20914 10.7091 11 8.5 11C6.29086 11 4.5 9.20914 4.5 7C4.5 4.79086 6.29086 3 8.5 3C10.7091 3 12.5 4.79086 12.5 7ZM20 8V14M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44818 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59344 1.99522 8.06544 2.16708 8.43785 2.48353C8.81026 2.79999 9.06067 3.23945 9.13999 3.72C9.28952 4.68007 9.55887 5.61273 9.93999 6.5C10.0513 6.78024 10.0983 7.08552 10.0767 7.38921C10.0551 7.69289 9.9657 7.98774 9.81999 8.25L8.51999 10.38C9.77382 12.6024 11.5976 14.4262 13.82 15.68L15.94 14.38C16.2023 14.2343 16.4972 14.1449 16.8008 14.1233C17.1045 14.1017 17.4098 14.1487 17.69 14.26C18.5773 14.6411 19.5099 14.9105 20.47 15.06C20.9435 15.1392 21.3784 15.3837 21.6947 15.7493C22.0111 16.1149 22.1887 16.5785 22.19 17.06L22.02 16.92H22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21H21M5 21V7L13 3V21M19 21V11L13 7M9 9V11M9 13V15M16 11V13M16 15V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const ClientList: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companies, setCompanies] = useState<string[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const limit = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchClients = useCallback(async () => {
    try {
      // Use different loading states based on context
      if (isInitialLoad) {
        setIsLoading(true);
      } else if (searchTerm !== debouncedSearchTerm) {
        setIsSearching(true);
      }
      
      const response = await clientAPI.getClients({
        page: currentPage,
        limit,
        search: debouncedSearchTerm || undefined,
        sortBy,
        sortOrder
      });

      const { clients: clientsData, pagination } = response.data.data;
      setClients(clientsData);
      setTotalPages(pagination.pages);
      
      // Extract unique companies for filter dropdown
      const uniqueCompanies = [...new Set(clientsData.map((client: Client) => client.company).filter(Boolean))] as string[];
      setCompanies(uniqueCompanies);
    } catch (error) {
      console.error('Fetch clients error:', error);
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
      setIsSearching(false);
    }
  }, [currentPage, debouncedSearchTerm, sortBy, sortOrder, isInitialLoad, searchTerm]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);


  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    setClientToDelete({ id: clientId, name: clientName });
    setDeleteModalOpen(true);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    
    try {
      setIsDeleting(true);
      await clientAPI.deleteClient(clientToDelete.id);
      fetchClients(); // Refresh the list
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
      setClientToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleClientClick = (clientId: string) => {
    navigate(`/dashboard/clients/${clientId}`);
  };


  const handleNewClient = () => {
    navigate('/dashboard/clients/new');
  };

  // Filter clients by selected company
  const filteredClients = selectedCompany 
    ? clients.filter(client => client.company === selectedCompany)
    : clients;


  const renderClientRow = (client: Client) => (
    <tr key={client._id} className="client-row">
      <td>
        <div className="client-name">
          <div className="client-avatar">
            {client.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="name-text">{client.fullName}</div>
            <div className="created-by">
              Ekleyen: {typeof client.createdBy === 'object' ? `${client.createdBy.firstName} ${client.createdBy.lastName}` : 'Belirtilmemiş'}
            </div>
          </div>
        </div>
      </td>
      <td>
        <div className="contact-info">
          {client.email && (
            <div className="contact-item">
              <MailIcon /> {client.email}
            </div>
          )}
          {client.phone && (
            <div className="contact-item">
              <PhoneIcon /> {client.phone}
            </div>
          )}
          {!client.email && !client.phone && (
            <span className="text-muted">Belirtilmemiş</span>
          )}
        </div>
      </td>
      <td>
        <div className="company-info">
          <div className="detail-item">
            <BuildingIcon /> {client.company || 'Belirtilmemiş'}
          </div>
        </div>
      </td>
      <td>
        <div className="client-details">
          {client.gender && (
            <div className="detail-item">
              <UserIcon /> 
              {client.gender === 'male' ? 'Erkek' : client.gender === 'female' ? 'Kadın' : 'Diğer'}
            </div>
          )}
          {client.occupation && (
            <div className="detail-item">
              <BriefcaseIcon /> {client.occupation}
            </div>
          )}
        </div>
      </td>
      <td>
        <div className="assessment-info">
          <div className="assessment-count">
            {client.totalAssessments} değerlendirme
          </div>
          {client.lastAssessment && (
            <div className="last-assessment">
              Son: {formatDate(client.lastAssessment)}
            </div>
          )}
        </div>
      </td>
      <td>
        {formatDate(client.createdAt)}
      </td>
      <td>
        <div className="action-buttons">
          <button
            onClick={() => handleClientClick(client._id)}
            className="btn-secondary btn-small"
          >
            Görüntüle
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClient(client._id, client.fullName);
              }}
              className="btn-danger btn-small"
              title="Müşteriyi Sil"
            >
              <TrashIcon size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  if (isLoading && isInitialLoad) {
    return (
      <div className="loading-container">
        <LoadingSpinner message="Müşteriler yükleniyor..." size="large" />
      </div>
    );
  }

  return (
    <div className="client-list-page">
      <div className="page-header">
        <h1>Müşteri Yönetimi</h1>
        <div className="header-actions">
          <button onClick={handleNewClient} className="btn-primary">
            <span className="btn-icon">
              <UserPlusIcon />
            </span>
            Yeni Müşteri
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Müşteri ara (isim, email, telefon, şirket)..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">
              <SearchIcon />
            </span>
          </div>
          
          <div className="filter-controls">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="company-filter"
            >
              <option value="">Tüm Şirketler</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
            
          </div>
        </div>
      </div>

      <div className="clients-table-container">
        {isSearching && (
          <div className="search-loading-overlay">
            <div className="search-loading-spinner">
              <div className="spinner"></div>
              <span>Aranıyor...</span>
            </div>
          </div>
        )}
        <table className={`clients-table ${isSearching ? 'searching' : ''}`}>
          <thead>
            <tr>
              <th 
                onClick={() => handleSort('fullName')}
                className={`sortable ${sortBy === 'fullName' ? 'active' : ''}`}
              >
                Ad Soyad
                {sortBy === 'fullName' && (
                  <span className="sort-arrow">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>İletişim</th>
              <th>Şirket</th>
              <th>Bilgiler</th>
              <th 
                onClick={() => handleSort('totalAssessments')}
                className={`sortable ${sortBy === 'totalAssessments' ? 'active' : ''}`}
              >
                Değerlendirme
                {sortBy === 'totalAssessments' && (
                  <span className="sort-arrow">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                onClick={() => handleSort('createdAt')}
                className={`sortable ${sortBy === 'createdAt' ? 'active' : ''}`}
              >
                Kayıt Tarihi
                {sortBy === 'createdAt' && (
                  <span className="sort-arrow">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(renderClientRow)}
          </tbody>
        </table>

        {filteredClients.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="empty-icon">
              <UsersIcon />
            </div>
            <h3>Müşteri bulunamadı</h3>
            <p>
              {searchTerm || selectedCompany
                ? 'Arama kriterlerinize uygun müşteri bulunamadı.'
                : 'Henüz hiç müşteri eklenmemiş.'
              }
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Önceki
          </button>
          
          <div className="pagination-info">
            Sayfa {currentPage} / {totalPages}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Sonraki →
          </button>
        </div>
      )}
      
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        title="Müşteriyi Sil"
        message={`${clientToDelete?.name} adlı müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve müşteriye ait tüm değerlendirmeler de silinecektir.`}
        confirmText="Müşteriyi Sil"
        onConfirm={confirmDeleteClient}
        onCancel={() => {
          setDeleteModalOpen(false);
          setClientToDelete(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ClientList;