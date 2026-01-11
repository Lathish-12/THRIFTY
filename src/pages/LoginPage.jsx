import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
    const { login, googleLogin } = useApp();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!email || !password) {
            toast.error('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        const success = await login(email, password);

        setIsLoading(false);
        if (success) {
            navigate('/');
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        if (credentialResponse.credential) {
            setIsLoading(true);
            console.log("Google credential received, calling googleLogin...");
            const success = await googleLogin(credentialResponse.credential);

            if (success) {
                console.log("Login successful, navigating to dashboard...");
                // Brief timeout to ensure AppContext state update is processed
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 100);
            } else {
                console.error("Google Login failed in AppContext");
                setIsLoading(false);
            }
        }
    };

    const handleGoogleError = () => {
        setErrorMsg("Google Popup Failed.");
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
                style={{ width: '100%', maxWidth: '420px', padding: 'clamp(1.5rem, 5vw, 3rem)', zIndex: 10 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Thrifty</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Welcome back! Please sign in.
                    </p>
                </div>

                <form
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
                        {isLoading ? 'Signing In...' : (
                            <>
                                Sign In <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                    <div style={{ height: '1px', background: 'var(--glass-border)', flex: 1 }}></div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>OR</span>
                    <div style={{ height: '1px', background: 'var(--glass-border)', flex: 1 }}></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={handleGoogleError}
                        theme="filled_black"
                        shape="pill"
                        disabled={isLoading}
                    />
                    {errorMsg && (
                        <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                            {errorMsg}
                        </p>
                    )}
                </div>

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
