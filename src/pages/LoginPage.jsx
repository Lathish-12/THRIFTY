import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Fingerprint, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
    const { login } = useApp();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Creds, 2: Bio
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call for Credentials
        setTimeout(() => {
            if (email && password) {
                setStep(2);
                toast.success('Credentials verified. Please scan fingerprint.');
            } else {
                toast.error('Please fill in all fields');
            }
            setIsLoading(false);
        }, 1000);
    };

    const [errorMsg, setErrorMsg] = useState('');

    const handleGoogleLogin = (credentialResponse) => {
        try {
            if (!credentialResponse.credential) {
                throw new Error("No credential received");
            }
            const decoded = jwtDecode(credentialResponse.credential);
            login({
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture
            });
            toast.success(`Welcome ${decoded.given_name}!`);
            navigate('/');
        } catch (error) {
            console.error(error);
            setErrorMsg(`Login Error: ${error.message}`);
            toast.error('Google Login Failed');
        }
    };

    const handleGoogleError = () => {
        setErrorMsg("Google Popup Failed. Check Console for details.");
        toast.error('Google Login Failed');
    };

    const handleBiometric = () => {
        setIsLoading(true);
        // Simulate Biometric Scan
        setTimeout(() => {
            login({ name: email.split('@')[0], email });
            navigate('/');
            toast.success('Identity Verified! Welcome.', {
                icon: <ShieldCheck color="var(--accent-green)" />
            });
        }, 1500);
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
                layout
                className="glass-panel"
                style={{ width: '100%', maxWidth: '420px', padding: '3rem', zIndex: 10 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Thrifty</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {step === 1 ? 'Welcome back! Please sign in.' : 'Biometric Security'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleLogin}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                        >
                            <div className="input-group">
                                <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <a href="#" style={{ fontSize: '0.875rem', color: 'var(--accent-blue)', textDecoration: 'none' }}>Forgot Password?</a>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary"
                                type="submit"
                                disabled={isLoading}
                                style={{ width: '100%' }}
                            >
                                {isLoading ? 'Verifying...' : (
                                    <>
                                        Next Step <ArrowRight size={18} />
                                    </>
                                )}
                            </motion.button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                                <div style={{ height: '1px', background: 'var(--glass-border)', flex: 1 }}></div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>OR</span>
                                <div style={{ height: '1px', background: 'var(--glass-border)', flex: 1 }}></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <GoogleLogin
                                    onSuccess={handleGoogleLogin}
                                    onError={handleGoogleError}
                                    theme="filled_black"
                                    shape="pill"
                                />
                                {errorMsg && (
                                    <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                                        {errorMsg}
                                    </p>
                                )}
                            </div>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBiometric}
                                disabled={isLoading}
                                style={{
                                    background: 'transparent',
                                    border: '2px dashed var(--accent-blue)',
                                    borderRadius: '50%',
                                    width: '120px',
                                    height: '120px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--accent-blue)',
                                    position: 'relative',
                                    outline: 'none'
                                }}
                            >
                                <Fingerprint size={64} style={{ opacity: isLoading ? 0.5 : 1 }} />
                                {isLoading && (
                                    <motion.div
                                        style={{
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: '50%',
                                            border: '2px solid var(--accent-green)',
                                            borderTopColor: 'transparent',
                                            top: -2,
                                            left: -2
                                        }}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    />
                                )}
                            </motion.button>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-primary)', fontWeight: '500', marginBottom: '0.25rem' }}>Scan Fingerprint</p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Touch the sensor to verify your identity</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{ color: 'var(--accent-green)', fontWeight: '600', textDecoration: 'none' }}>
                            Create Account
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
