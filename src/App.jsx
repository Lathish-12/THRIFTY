import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Rewards from './pages/Rewards';
import Advisor from './pages/Advisor';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CustomerSupport from './components/CustomerSupport';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

const Layout = ({ children }) => {
  const { user } = useApp();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '2rem', paddingLeft: 'calc(80px + 2rem)', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="text-gradient">Thrifty</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Welcome, {user?.name || 'User'}</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-green))' }}></div>
          </div>
        </header>

        <AnimatePresence mode='wait'>
          {children}
        </AnimatePresence>
      </main>
      <CustomerSupport />
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user } = useApp();
  if (!user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }) => {
  const { user } = useApp();
  if (user.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    <Routes key={location.pathname} location={location}>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
      <Route path="/advisor" element={<ProtectedRoute><Advisor /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" theme="dark" />
      </Router>
    </AppProvider>
  );
}

export default App;
