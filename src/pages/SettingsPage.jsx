import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Bell, Shield,
    Moon, Globe, ChevronRight, Save,
    Smartphone, Mail, Lock, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';

import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const SettingsPage = () => {
    const { user, fetchUserData, fetchMe, isDark, toggleTheme } = useApp();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile');
    const [isLoading, setIsLoading] = useState(false);

    // Mock Form State
    const [formData, setFormData] = useState({
        name: user?.name || 'Lathish',
        email: user?.email || 'test@example.com',
        bio: 'Full-stack developer enjoying the Thrifty life.',
        currency: 'INR',
        notifications_enabled: user?.profile?.notifications_enabled ?? true,
        darkMode: isDark
    });

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Update User model (name)
            await api.patch('/users/me/', { first_name: formData.name });

            // Update UserProfile model (notifications)
            await api.patch('/users/profile/', {
                notifications_enabled: formData.notifications_enabled
            });



            // Refresh current user info so UI shows updated data
            fetchMe && await fetchMe();

            toast.success('Settings saved successfully!');
            // navigate('/'); // Stay on settings page to see changes
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error(error.response?.data?.error || 'Failed to save settings');
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User size={18} /> },
        { id: 'preferences', label: 'Preferences', icon: <Globe size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ maxWidth: '1000px', margin: '0 auto' }}
        >
            <h2 style={{ marginBottom: '2rem' }}>Account Settings</h2>

            <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', minHeight: '600px', overflow: 'hidden' }}>

                {/* Sidebar */}
                <div style={{ padding: '1.5rem', borderRight: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    background: activeTab === tab.id ? 'var(--accent-blue)' : 'transparent',
                                    border: 'none',
                                    color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontFamily: 'inherit',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.icon}
                                {tab.label}
                                {activeTab === tab.id && <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.8 }} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: '2rem' }}>
                    {activeTab === 'profile' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-green))', position: 'relative' }}>
                                    {user?.picture ? (
                                        <img src={user.picture} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={40} color="white" />
                                        </div>
                                    )}
                                    <button style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        background: 'var(--accent-purple)',
                                        border: '2px solid var(--bg-secondary)',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: 'white'
                                    }}>
                                        <User size={14} />
                                    </button>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{formData.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{formData.bio}</p>
                                </div>
                            </div>

                            <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', display: 'grid' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                        <input
                                            className="input-field"
                                            style={{ paddingLeft: '2.5rem' }}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                        <input
                                            className="input-field"
                                            style={{ paddingLeft: '2.5rem' }}
                                            value={formData.email}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>



                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Bio / Description</label>
                                <textarea
                                    className="input-field"
                                    style={{ height: '100px', resize: 'none' }}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'preferences' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                        >
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>App Preferences</h3>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '8px', color: 'var(--accent-blue)' }}>
                                        <Moon size={20} />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '500', marginBottom: '0.2rem' }}>Dark Mode</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Use dark theme across the app</p>
                                    </div>
                                </div>
                                <Toggle checked={isDark} onChange={toggleTheme} />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: 'var(--accent-green)' }}>
                                        <Bell size={20} />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '500', marginBottom: '0.2rem' }}>Notifications</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Receive alerts about expenses</p>
                                    </div>
                                </div>
                                <Toggle checked={formData.notifications_enabled} onChange={() => setFormData({ ...formData, notifications_enabled: !formData.notifications_enabled })} />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                        >
                            <h3 style={{ fontSize: '1.25rem' }}>Security Settings</h3>

                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Current Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input className="input-field" type="password" style={{ paddingLeft: '2.5rem' }} placeholder="••••••••" />
                                </div>
                            </div>

                            <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', display: 'grid' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>New Password</label>
                                    <input className="input-field" type="password" placeholder="••••••••" />
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Confirm Password</label>
                                    <input className="input-field" type="password" placeholder="••••••••" />
                                </div>
                            </div>

                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ color: 'var(--accent-red)' }}>
                                    <p style={{ fontWeight: '600' }}>Two-Factor Authentication</p>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Add an extra layer of security to your account.</p>
                                </div>
                                <button className="btn-danger" style={{ fontSize: '0.85rem' }}>Enable 2FA</button>
                            </div>
                        </motion.div>
                    )}

                    {/* Billing removed — app is free */}

                    {/* Footer Actions */}
                    <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end' }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : (
                                <>
                                    <Save size={18} /> Save Changes
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Toggle = ({ checked, onChange }) => (
    <div
        onClick={onChange}
        style={{
            width: '50px',
            height: '26px',
            background: checked ? 'var(--accent-green)' : 'var(--bg-secondary)',
            borderRadius: '50px',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.2s'
        }}
    >
        <div style={{
            width: '20px',
            height: '20px',
            background: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '3px',
            left: checked ? '27px' : '3px',
            transition: 'left 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
    </div>
);

export default SettingsPage;
