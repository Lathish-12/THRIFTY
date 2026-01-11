import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const SignupPage = () => {
    const { register, googleLogin } = useApp();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        // Use email as username
        const success = await register({
            username: email,
            email,
            password,
            first_name: name
        });

        setIsLoading(false);

        if (success) {
            navigate('/login');
        }
    };

    // Google Signup (Handled same as Login)
    const handleGoogleSignup = async (credentialResponse) => {
        if (credentialResponse.credential) {
            const success = await googleLogin(credentialResponse.credential);
            if (success) navigate('/');
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
            <div className="bg-gradient-orb" style={{ top: -100, right: -100, background: 'var(--accent-purple)' }} />
            <div className="bg-gradient-orb" style={{ bottom: -100, left: -100, background: 'var(--accent-green)' }} />

            <motion.div
                layout
                className="glass-panel"
                style={{ width: '100%', maxWidth: '420px', padding: '3rem', zIndex: 10 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        Join Thrifty
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Start your journey to financial freedom.
                    </p>
                </div>

                <form
                    onSubmit={handleSignup}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                    <div className="input-group">
                        <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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

                    <div className="input-group">
                        <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary"
                        type="submit"
                        disabled={isLoading}
                        style={{ width: '100%', marginTop: '1rem' }}
                    >
                        {isLoading ? 'Creating Account...' : (
                            <>
                                Create Account <ArrowRight size={18} />
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
                            onSuccess={handleGoogleSignup}
                            onError={() => toast.error('Google Signup Failed')}
                            theme="filled_black"
                            shape="pill"
                            text="signup_with"
                        />
                    </div>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: '600', textDecoration: 'none' }}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div >
    );
};

export default SignupPage;
