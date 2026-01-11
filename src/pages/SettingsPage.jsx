import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Bell, Shield, Wallet,
    Moon, Globe, ChevronRight, Save,
    Smartphone, Mail, Lock, Check, CreditCard, Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';

import { useLocation, useNavigate } from 'react-router-dom';

const SettingsPage = () => {
    const { user } = useApp();
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
        notifications: true,
        darkMode: true
    });

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.success('Settings saved successfully!');
            navigate('/');
        }, 1000);
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User size={18} /> },
        { id: 'preferences', label: 'Preferences', icon: <Globe size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
        { id: 'billing', label: 'Billing', icon: <Wallet size={18} /> },
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
                                <Toggle checked={formData.darkMode} onChange={() => setFormData({ ...formData, darkMode: !formData.darkMode })} />
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
                                <Toggle checked={formData.notifications} onChange={() => setFormData({ ...formData, notifications: !formData.notifications })} />
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

                    {activeTab === 'billing' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                        >
                            {/* Current Plan Card */}
                            <div style={{
                                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                                padding: '2rem',
                                borderRadius: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                color: 'white'
                            }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Thrifty Pro</h3>
                                    <p style={{ opacity: 0.9 }}>Your plan auto-renews on Jan 15, 2026</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>$9.99</span>
                                    <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>/month</span>
                                </div>
                            </div>

                            <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', display: 'grid' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <CreditCard size={20} color="var(--accent-green)" /> Payment Method
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ background: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#1a1a1a', fontSize: '0.8rem' }}>VISA</div>
                                        <span>•••• •••• •••• 4242</span>
                                    </div>
                                    <button style={{ background: 'transparent', color: 'var(--accent-blue)', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.9rem' }}>Update Card</button>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <Shield size={20} color="var(--accent-purple)" /> Plan Features
                                    </h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {['Unlimited Transactions', 'AI Financial Advisor', 'Export to PDF/CSV', 'Priority Support'].map(item => (
                                            <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                <Check size={14} color="var(--accent-green)" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Billing History</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {[
                                        { date: 'Dec 15, 2025', amount: '$9.99', status: 'Paid', invoice: '#INV-2025-012' },
                                        { date: 'Nov 15, 2025', amount: '$9.99', status: 'Paid', invoice: '#INV-2025-011' },
                                        { date: 'Oct 15, 2025', amount: '$9.99', status: 'Paid', invoice: '#INV-2025-010' }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '1rem',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '12px',
                                            border: '1px solid var(--glass-border)'
                                        }}>
                                            <div>
                                                <p style={{ fontWeight: '500' }}>Thrifty Pro Subscription</p>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.date}</p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                                <span style={{ fontWeight: 'bold' }}>{item.amount}</span>
                                                <span style={{
                                                    background: 'rgba(16, 185, 129, 0.2)',
                                                    color: 'var(--accent-green)',
                                                    padding: '4px 8px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem'
                                                }}>{item.status}</span>
                                                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                                    <Download size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

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
