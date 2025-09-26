import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './components/auth/Login';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/ClientList';
import ClientDetail from './pages/ClientDetail';
import ClientForm from './pages/ClientForm';
import ClientAssessmentForm from './app/pages/TokenForm';
import AssessmentFormPage from './pages/AssessmentForm';
import ClientAssessmentFormPage from './pages/ClientAssessmentForm';
import Report from './app/pages/Report';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Client Assessment Form (Public) */}
          <Route path="/assessment/:clientId" element={<ClientAssessmentForm />} />

          {/* Modern Assessment Form (Public) */}
          <Route path="/assessment" element={<AssessmentFormPage />} />

          {/* Report Viewing (Public with access token) */}
          <Route path="/report/:id" element={<Report />} />

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
                  <Route path="clients/:clientId/assessment" element={<ClientAssessmentFormPage />} />
                  <Route path="assessments" element={<AssessmentFormPage />} />
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
