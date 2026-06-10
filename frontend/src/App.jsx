import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import MainLayout from './components/Layout/MainLayout';
import './index.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="h-screen bg-kakao-sidebar flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-kakao-yellow border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/" element={user ? <MainLayout /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
