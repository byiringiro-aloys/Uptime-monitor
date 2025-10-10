import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MonitorDetails from './pages/MonitorDetails';

// Component to handle authenticated user redirects
const AuthenticatedRedirect = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return null;
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Layout>
            <Routes>
            {/* Public routes */}
            <Route 
              path="/" 
              element={
                <AuthenticatedRedirect>
                  <Home />
                </AuthenticatedRedirect>
              } 
            />
            <Route 
              path="/login" 
              element={
                <AuthenticatedRedirect>
                  <Login />
                </AuthenticatedRedirect>
              } 
            />
            <Route 
              path="/register" 
              element={
                <AuthenticatedRedirect>
                  <Register />
                </AuthenticatedRedirect>
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/monitor/:id" 
              element={
                <ProtectedRoute>
                  <MonitorDetails />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
