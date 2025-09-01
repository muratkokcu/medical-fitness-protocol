import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './components/auth/Login';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/ClientList';
import ClientDetail from './pages/ClientDetail';
import AssessmentContainer from './components/AssessmentContainer';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Legacy Assessment Route (for existing functionality) */}
          <Route path="/assessment" element={<AssessmentContainer />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="clients" element={<ClientList />} />
                  <Route path="clients/:id" element={<ClientDetail />} />
                  <Route path="clients/new" element={<div>Yeni müşteri sayfası geliştiriliyor...</div>} />
                  <Route path="clients/:id/edit" element={<div>Müşteri düzenleme sayfası geliştiriliyor...</div>} />
                  <Route path="assessments" element={<div>Değerlendirmeler sayfası geliştiriliyor...</div>} />
                  <Route path="assessments/new" element={<div>Yeni değerlendirme sayfası geliştiriliyor...</div>} />
                  <Route path="assessments/:id" element={<div>Değerlendirme detay sayfası geliştiriliyor...</div>} />
                  <Route path="reports" element={<div>Raporlar sayfası geliştiriliyor...</div>} />
                  <Route path="settings" element={<div>Ayarlar sayfası geliştiriliyor...</div>} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
