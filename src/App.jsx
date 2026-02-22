import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Advisor from './pages/Advisor';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SettingsPage from './pages/SettingsPage';
import BudgetPage from './pages/BudgetPage';
import GoalsPage from './pages/GoalsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MetalsPage from './pages/MetalsPage';
import CryptoPage from './pages/CryptoPage';
import CustomerSupport from './components/CustomerSupport';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import ProfileModal from './components/ProfileModal';
import UPIGenerator from './components/UPIGenerator';
import { User, Search, QrCode } from 'lucide-react';

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'white', flexDirection: 'column', padding: '2rem', textAlign: 'center' }}>
          <h1 className="text-gradient">Something went wrong</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>{this.state.error?.message}</p>
          <button
            onClick={() => window.location.href = '/'}
            style={{ marginTop: '2rem', padding: '0.8rem 1.5rem', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
          >
            Back to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Layout = ({ children }) => {
  const { user, currency, toggleCurrency } = useApp();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUPIOpen, setIsUPIOpen] = useState(false);

  // Search Logic
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const SEARCH_ITEMS = [
    { name: 'Dashboard Overview', path: '/' },
    { name: 'Transaction History', path: '/transactions' },
    { name: 'Smart Budgets', path: '/budgets' },
    { name: 'Financial Goals', path: '/goals' },
    { name: 'Analytics & Insights', path: '/analytics' },
    { name: 'Precious Metals Tracking', path: '/metals' },
    { name: 'Crypto Assets Tracking', path: '/crypto' },
    { name: 'AI Advisor', path: '/advisor' },
    { name: 'Account Settings', path: '/settings' },
  ];

  const filteredItems = SEARCH_ITEMS.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNavigate = (path) => {
    navigate(path);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const location = useLocation();
  const currentPath = location.pathname;
  const currentPage = SEARCH_ITEMS.find(item => item.path === currentPath);
  const pageTitle = currentPage ? currentPage.name : (
    location.pathname.includes('login') ? 'Login' :
      location.pathname.includes('signup') ? 'Sign Up' : 'Thrifty'
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        padding: '0 1.5rem',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(10px)',
        zIndex: 900,
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
            flexShrink: 0
          }}>T</div>
          <span className="desktop-only" style={{
            fontSize: '1.1rem',
            color: 'var(--text-primary)',
            fontWeight: 500,
            marginLeft: '0.5rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '150px'
          }}>{pageTitle}</span>
        </div>

        <div className="desktop-only" style={{ textAlign: 'center' }}>
          <h1 className="text-gradient" style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Thrifty</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-end' }}>
          <div className="desktop-only" style={{
            position: 'relative',
            width: 'clamp(150px, 20vw, 240px)',
            display: 'flex',
            alignItems: 'center',
            zIndex: 1001
          }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredItems.length > 0) {
                  handleNavigate(filteredItems[0].path);
                }
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                padding: '0.5rem 1rem 0.5rem 2.2rem',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
            />

            <AnimatePresence>
              {showSuggestions && searchTerm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: 'absolute',
                    top: '120%',
                    left: 0,
                    right: 0,
                    background: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                      <div
                        key={item.path}
                        onClick={() => handleNavigate(item.path)}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <Search size={14} style={{ opacity: 0.5 }} />
                        {item.name}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                      No results found
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setIsUPIOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              color: '#60a5fa',
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginRight: '0.5rem',
              fontWeight: 500
            }}
            title="Receive Money (UPI)"
          >
            <QrCode size={18} />
            <span className="desktop-only">Receive</span>
          </button>

          <button
            onClick={toggleCurrency}
            className="desktop-only"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              marginRight: '1rem'
            }}
            title="Toggle Currency"
          >
            <span style={{ opacity: 0.7 }}>{currency === 'INR' ? '₹' : '$'}</span>
            {currency}
          </button>

          <span className="desktop-only" style={{ color: 'var(--text-secondary)' }}>Welcome, {user?.name || 'User'}</span>

          <button
            onClick={() => setIsProfileOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-green))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid transparent',
              transition: 'border-color 0.2s'
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              {user.picture ? (
                <img src={user.picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={18} color="white" />
              )}
            </div>
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '1.5rem', paddingTop: '80px', paddingBottom: '90px', maxWidth: '1400px', margin: '0 auto', width: '100%', overflowX: 'hidden' }}>
        <AnimatePresence>
          {isUPIOpen && <UPIGenerator onClose={() => setIsUPIOpen(false)} />}
        </AnimatePresence>
        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>
      <CustomerSupport />
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useApp();
  if (authLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading...</div>;
  if (!user.isAuthenticated) return <Navigate to="/welcome" replace />;
  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }) => {
  const { user, authLoading } = useApp();
  if (authLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading...</div>;
  if (user.isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const location = useLocation();
  const { authLoading } = useApp();

  if (authLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'white', fontSize: '18px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>Loading Thrifty...</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Initializing your financial dashboard</div>
        </div>
      </div>
    );
  }

  return (
    <Routes key={location.pathname} location={location}>
      <Route path="/welcome" element={<PublicRoute><WelcomePage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/budgets" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/metals" element={<ProtectedRoute><MetalsPage /></ProtectedRoute>} />
      <Route path="/crypto" element={<ProtectedRoute><CryptoPage /></ProtectedRoute>} />
      <Route path="/advisor" element={<ProtectedRoute><Advisor /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div style={{ display: 'contents' }}>
          <Router>
            <AppRoutes />
            <ToastContainer position="top-right" theme="dark" />
          </Router>
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
