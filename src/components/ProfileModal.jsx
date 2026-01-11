import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, LogOut, Settings, CreditCard, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, logout, points, badges } = useApp();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        onClose();
        navigate('/welcome');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 40
                        }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="glass-panel"
                        style={{
                            position: 'fixed',
                            top: '80px',
                            right: '2rem',
                            width: '320px',
                            padding: '0',
                            zIndex: 50,
                            overflow: 'hidden',
                            border: '1px solid var(--glass-border)',
                            background: '#1e293b' // Fallback
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                            position: 'relative'
                        }}>
                            <button
                                onClick={onClose}
                                style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={14} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '4px solid rgba(255,255,255,0.2)'
                                }}>
                                    {user.picture ? (
                                        <img src={user.picture} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                    ) : (
                                        <User size={30} color="var(--accent-blue)" />
                                    )}
                                </div>
                                <div style={{ color: 'white' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{user.name || 'User'}</h3>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.9, background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '10px' }}>
                                        Pro Member
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Mail size={14} /> Email Account
                                </p>
                                <p style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{user.email || 'user@example.com'}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>{points}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Thrifty Points</span>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-blue)' }}>{badges.length}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Badges</span>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <MenuItem icon={<Settings size={18} />} label="Account Settings" onClick={() => { onClose(); navigate('/settings', { state: { tab: 'profile' } }); }} />
                                <MenuItem icon={<CreditCard size={18} />} label="Billing & Subscription" onClick={() => { onClose(); navigate('/settings', { state: { tab: 'billing' } }); }} />

                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'var(--accent-red)',
                                        cursor: 'pointer',
                                        marginTop: '0.5rem',
                                        fontSize: '0.9rem',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                                    onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const MenuItem = ({ icon, label, onClick }) => (
    <button onClick={onClick} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%',
        padding: '0.75rem',
        background: 'transparent',
        border: 'none',
        borderRadius: '8px',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: '0.9rem',
        textAlign: 'left',
        transition: 'all 0.2s'
    }}
        onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.05)';
            e.target.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = 'var(--text-secondary)';
        }}>
        {icon}
        {label}
    </button>
);

export default ProfileModal;
