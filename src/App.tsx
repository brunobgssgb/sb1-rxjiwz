import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { AuthGuard } from './components/AuthGuard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Customers } from './pages/Customers';
import { Applications } from './pages/Applications';
import { Codes } from './pages/Codes';
import { Sales } from './pages/Sales';
import { MyAccount } from './pages/MyAccount';
import { AdminUsers } from './pages/AdminUsers';
import { useAuthStore } from './store/authStore';
import { useStore } from './store/useStore';
import { AlertCircle } from 'lucide-react';

export function App() {
  const { currentUser, initialize: initAuth } = useAuthStore();
  const { initialize: initStore, error: storeError } = useStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        await initAuth();
        if (currentUser) {
          await initStore();
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao inicializar aplicação';
        console.error('App initialization error:', err);
        setError(errorMessage);
      } finally {
        setIsInitializing(false);
      }
    };

    initApp();
  }, [initAuth, initStore, currentUser]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (error || storeError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md w-full mx-4">
          <div className="flex items-center space-x-2 text-red-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h2 className="font-semibold">Erro de Inicialização</h2>
          </div>
          <p className="text-red-700">{error || storeError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {currentUser && <Navigation />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <AuthGuard>
              <Home />
            </AuthGuard>
          } />
          
          <Route path="/customers" element={
            <AuthGuard>
              <Customers />
            </AuthGuard>
          } />
          
          <Route path="/apps" element={
            <AuthGuard>
              <Applications />
            </AuthGuard>
          } />
          
          <Route path="/codes" element={
            <AuthGuard>
              <Codes />
            </AuthGuard>
          } />
          
          <Route path="/sales" element={
            <AuthGuard>
              <Sales />
            </AuthGuard>
          } />

          <Route path="/account" element={
            <AuthGuard>
              <MyAccount />
            </AuthGuard>
          } />

          <Route path="/admin/users" element={
            <AuthGuard>
              <AdminUsers />
            </AuthGuard>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}