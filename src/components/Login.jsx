import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, ShieldCheck, Lock, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const Login = () => {
    const { login } = useApp();
    const [step, setStep] = useState(0); // 0: Google, 1: Bio, 2: MFA
    const [mfaCode, setMfaCode] = useState(['', '', '', '']);
    const [errorMsg, setErrorMsg] = useState('');

    // Handle Google Login Success
    const handleGoogleSuccess = (credentialResponse) => {
        try {
            if (!credentialResponse.credential) {
                throw new Error("No credential received");
            }
            const decoded = jwtDecode(credentialResponse.credential);
            console.log("User:", decoded);

            toast.success(`Welcome, ${decoded.name}!`, { theme: "dark" });
            setStep(1);
        } catch (error) {
            console.error("Login Success Error:", error);
            setErrorMsg(`Decode Error: ${error.message}`);
            toast.error('Login Process Failed', { theme: "dark" });
        }
    };

    const handleGoogleError = () => {
        console.error("Google Sign In Failed");
        setErrorMsg("Google Popup Failed. Check Console. Likely 'Authorized Origin' mismatch.");
        toast.error('Google Sign In Failed', { theme: "dark" });
    };

    const handleBioClick = () => {
        // Simulate biometric scan delay
        setTimeout(() => {
            setStep(2);
        }, 1000);
    };

    const handleMfaChange = (index, value) => {
        if (value.length > 1) return;
        const newCode = [...mfaCode];
        newCode[index] = value;
        setMfaCode(newCode);

        // Auto focus next
        if (value && index < 3) {
            document.getElementById(`mfa-${index + 1}`).focus();
        }

        // Check completion
        if (newCode.every(d => d !== '') && index === 3) {
            setTimeout(() => login(), 500);
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
            {/* Abstract Background Shapes */}
            <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: 'var(--accent-blue)', filter: 'blur(150px)', opacity: 0.3, borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, background: 'var(--accent-green)', filter: 'blur(150px)', opacity: 0.3, borderRadius: '50%' }} />

            <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-panel"
                style={{ width: '400px', padding: '3rem', textAlign: 'center', zIndex: 10 }}
            >
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}>
                        {step === 0 ? <Globe size={40} color="#6366f1" /> : <Lock size={40} color="#6366f1" />}
                    </div>
                </div>

                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Thrifty Secure</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    {step === 0 && 'Sign in to continue'}
                    {step === 1 && 'Biometric Authentication'}
                    {step === 2 && 'Final Security Check'}
                </p>

                {step === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="filled_black"
                            shape="pill"
                            text="continue_with"
                        />
                        {errorMsg && (
                            <p style={{ color: '#f43f5e', fontSize: '0.8rem', maxWidth: '300px', margin: '0.5rem auto', textAlign: 'center', background: 'rgba(244, 63, 94, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                                {errorMsg}
                            </p>
                        )}
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            By continuing, you agree to our Terms & Secure Policy.
                        </p>
                    </div>
                )}

                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBioClick}
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
                                color: 'var(--accent-blue)'
                            }}
                        >
                            <Fingerprint size={64} />
                        </motion.button>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tap to scan fingerprint</p>
                    </div>
                )}

                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
                    >
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            {mfaCode.map((digit, i) => (
                                <input
                                    key={i}
                                    id={`mfa-${i}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    autoFocus={i === 0}
                                    onChange={(e) => handleMfaChange(i, e.target.value)}
                                    style={{
                                        width: '50px',
                                        height: '60px',
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '1.5rem',
                                        textAlign: 'center',
                                        outline: 'none'
                                    }}
                                />
                            ))}
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enter 4-digit security PIN.</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-green)', fontSize: '0.875rem' }}>
                            <ShieldCheck size={16} /> Secure Connection
                        </div>
                    </motion.div>
                )}
            </motion.div>

            <p style={{ position: 'absolute', bottom: '2rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                Secured by Thrifty AI • 256-bit Encryption
            </p>
        </div>
    );
};

export default Login;
