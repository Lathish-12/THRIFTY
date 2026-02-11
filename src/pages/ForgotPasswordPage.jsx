import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!email) {
            toast.error('Please enter your email address');
            setIsLoading(false);
            return;
        }

        try {
            // Call backend password reset endpoint
            await api.post('/users/password-reset/', { email });
            setEmailSent(true);
            toast.success('Password reset instructions sent to your email!');
        } catch (error) {
            console.error('Password reset error:', error);
            if (error.response?.data?.email) {
                toast.error(error.response.data.email[0]);
            } else {
                toast.error('Failed to send reset email. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Elements */}
            <div className="bg-gradient-orb" style={{ top: -100, left: -100, background: 'var(--accent-blue)' }} />
            <div className="bg-gradient-orb" style={{ bottom: -100, right: -100, background: 'var(--accent-green)' }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '420px', padding: 'clamp(1.5rem, 5vw, 3rem)', zIndex: 10 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Thrifty</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {emailSent
                            ? 'Check your email for reset instructions'
                            : 'Enter your email to reset your password'}
                    </p>
                </div>

                {!emailSent ? (
                    <form
                        onSubmit={handleSubmit}
                        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                    >
                        <div className="input-group">
                            <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary"
                            type="submit"
                            disabled={isLoading}
                            style={{ width: '100%' }}
                        >
                            {isLoading ? 'Sending...' : (
                                <>
                                    Send Reset Link <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 1.5rem',
                            background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Mail size={40} color="white" />
                        </div>
                        <p style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            We've sent password reset instructions to:
                        </p>
                        <p style={{ color: 'var(--accent-blue)', fontWeight: '600', marginBottom: '1.5rem' }}>
                            {email}
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Please check your inbox and follow the link to reset your password.
                        </p>
                    </div>
                )}

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Link
                        to="/login"
                        style={{
                            color: 'var(--accent-blue)',
                            textDecoration: 'none',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <ArrowLeft size={18} />
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
