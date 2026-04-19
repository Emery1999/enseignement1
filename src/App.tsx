import React from 'react';
import { Toaster } from 'sonner';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { Layout } from './components/Layout';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { ThemesView } from './views/ThemesView';
import { ThemeDetailView } from './views/ThemeDetailView';
import { EnseignementDetailView } from './views/EnseignementDetailView';
import { FavorisView } from './views/FavorisView';
import { SettingsView } from './views/SettingsView';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <HashRouter>
      <Toaster position="top-right" richColors theme="system" />
      <Routes>
        <Route path="/login" element={<LoginView />} />
        
        <Route path="/" element={<ProtectedRoute><DashboardView /></ProtectedRoute>} />
        <Route path="/themes" element={<ProtectedRoute><ThemesView /></ProtectedRoute>} />
        <Route path="/themes/:themeId" element={<ProtectedRoute><ThemeDetailView /></ProtectedRoute>} />
        <Route path="/enseignements/:id" element={<ProtectedRoute><EnseignementDetailView /></ProtectedRoute>} />
        <Route path="/favoris" element={<ProtectedRoute><FavorisView /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsView /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
