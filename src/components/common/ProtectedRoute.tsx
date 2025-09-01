import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Yükleniyor...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return (
      <div className="access-denied">
        <h2>Erişim Reddedildi</h2>
        <p>Bu sayfaya erişmek için yeterli yetkiniz bulunmamaktadır.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;