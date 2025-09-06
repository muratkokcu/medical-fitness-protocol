// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './components/auth/Login';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/ClientList';
import ClientDetail from './pages/ClientDetail';
import ClientForm from './pages/ClientForm';
// import AssessmentList from './pages/AssessmentList'; // Removed - no longer needed
import AssessmentReport from './pages/AssessmentReport';
import AssessmentContainer from './components/AssessmentContainer';
import DashboardAssessmentContainer from './components/DashboardAssessmentContainer';
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
          
          {/* Report Route (opens in new tab) */}
          <Route path="/report/:assessmentId" element={<AssessmentReport />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="clients" element={<ClientList />} />
                  <Route path="clients/:id" element={<ClientDetail />} />
                  <Route path="clients/new" element={<ClientForm mode="create" />} />
                  <Route path="clients/:id/edit" element={<ClientForm mode="edit" />} />
                  <Route path="clients/:clientId/assessment/new" element={<DashboardAssessmentContainer mode="create" />} />
                  <Route path="clients/:clientId/assessment/:assessmentId" element={<DashboardAssessmentContainer mode="view" />} />
                  <Route path="clients/:clientId/assessment/:assessmentId/edit" element={<DashboardAssessmentContainer mode="edit" />} />
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
