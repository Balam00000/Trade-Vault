import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import LCManagement from './pages/LCManagement';
import BGManagement from './pages/BGManagement';
import BillsCollections from './pages/BillsCollections';
import ComplianceCases from './pages/ComplianceCases';
import Reports from './pages/Reports';
import AuditLedger from './pages/AuditLedger';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Secure Banking Operations Portal (Protected via RBAC) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lcs" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LCManagement />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bgs" 
            element={
              <ProtectedRoute>
                <Layout>
                  <BGManagement />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bills" 
            element={
              <ProtectedRoute allowedRoles={['CLIENT', 'OPERATIONS', 'ADMIN']}>
                <Layout>
                  <BillsCollections />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/compliance" 
            element={
              <ProtectedRoute allowedRoles={['COMPLIANCE', 'ADMIN']}>
                <Layout>
                  <ComplianceCases />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRoles={['CLIENT', 'TREASURY', 'OPERATIONS', 'ADMIN']}>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/audit-logs" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <AuditLedger />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
