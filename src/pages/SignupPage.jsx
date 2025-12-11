import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const SignupPage = () => {
    const { login } = useApp();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [otp, setOtp] = useState(['', '', '', '']);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        // Simulate Sending OTP
        setTimeout(() => {
            setIsLoading(false);
            setStep(2);
            toast.success(`OTP sent to ${email}`);
        }, 1500);
    };

    const handleGoogleSignup = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            login({
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture
            });
            toast.success(`Welcome ${decoded.given_name}! Account created.`);
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error('Google Signup Failed');
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 3) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const verifyOtp = () => {
        if (otp.some(d => d === '')) {
            toast.error('Please enter the full 4-digit code');
            return;
        }

        setIsLoading(true);
        // Simulate Verification
        setTimeout(() => {
            toast.success('Account verified! Please login.');
            navigate('/login');
            setIsLoading(false);
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
            <div className="bg-gradient-orb" style={{ top: -100, right: -100, background: 'var(--accent-purple)' }} />
            <div className="bg-gradient-orb" style={{ bottom: -100, left: -100, background: 'var(--accent-green)' }} />

            <motion.div
                layout
                className="glass-panel"
                style={{ width: '100%', maxWidth: '420px', padding: '3rem', zIndex: 10 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        {step === 1 ? 'Join Thrifty' : 'Verify Email'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {step === 1 ? 'Start your journey to financial freedom.' : `Enter the code sent to ${email}`}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
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
                                {isLoading ? 'Sending Code...' : (
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
                        </motion.form>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}
                        >
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        style={{
                                            width: '60px',
                                            height: '70px',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '2rem',
                                            textAlign: 'center',
                                            outline: 'none',
                                            borderColor: digit ? 'var(--accent-green)' : 'var(--glass-border)'
                                        }}
                                    />
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary"
                                onClick={verifyOtp}
                                disabled={isLoading}
                                style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent-green), #059669)' }}
                            >
                                {isLoading ? 'Verifying...' : (
                                    <>
                                        Verify Email <CheckCircle size={18} />
                                    </>
                                )}
                            </motion.button>

                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Didn't receive code? <span style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => toast.info('Resending OTP...')}>Resend</span>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

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
