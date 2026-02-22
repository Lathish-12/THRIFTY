import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Smartphone, CheckCircle, Loader2, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';
import PaymentService from '../api/paymentService';
import { useApp } from '../context/AppContext';

const PaymentSimulator = ({ amount, orderId, onClose, onSuccess }) => {
    const { fetchUserData, fetchMe } = useApp();
    const [step, setStep] = useState('choice'); // choice, pin, processing, success
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePinSubmit = async () => {
        if (pin.length !== 4) return toast.error("Enter a 4-digit PIN");

        setStep('processing');
        // Simulate network delay
        setTimeout(async () => {
            try {
                const res = await PaymentService.simulateSuccess(orderId, `pay_sim_${Math.random().toString(36).substr(2, 9)}`);
                setStep('success');
                // Refresh global state
                fetchUserData && await fetchUserData();
                fetchMe && await fetchMe();

                setTimeout(() => {
                    onSuccess && onSuccess();
                    onClose();
                }, 2000);
            } catch (error) {
                toast.error("Payment sync failed");
                setStep('choice');
            }
        }, 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
            }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                style={{
                    width: '90%', maxWidth: '380px', background: '#FFFFFF',
                    borderRadius: '32px', overflow: 'hidden', color: '#1e293b',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                }}
            >
                {/* Header - Simulated Banking App Style */}
                <div style={{ background: '#6366f1', padding: '1.5rem', color: 'white', position: 'relative' }}>
                    <ShieldCheck size={20} style={{ position: 'absolute', left: '1.5rem', top: '1.5rem' }} />
                    <h3 style={{ textAlign: 'center', margin: 0, fontSize: '1rem', fontWeight: '600' }}>UPI Secure Terminal</h3>
                    <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '2rem' }}>
                    {step === 'choice' && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '50%' }}>
                                    <Smartphone size={40} color="#6366f1" />
                                </div>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Paying to Thrifty Wallet</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '0 0 2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IndianRupee size={28} /> {amount}
                            </h2>
                            <button
                                onClick={() => setStep('pin')}
                                className="btn-primary"
                                style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: '#6366f1' }}
                            >
                                Proceed to Pay
                            </button>
                        </div>
                    )}

                    {step === 'pin' && (
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Enter 4-Digit UPI PIN</h3>
                            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginBottom: '2rem' }}>
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} style={{
                                        width: '16px', height: '16px', borderRadius: '50%',
                                        background: pin.length >= i ? '#6366f1' : '#e2e8f0'
                                    }} />
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'Clear', 0, 'Go'].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => {
                                            if (val === 'Clear') setPin('');
                                            else if (val === 'Go') handlePinSubmit();
                                            else if (pin.length < 4) setPin(pin + val);
                                        }}
                                        style={{
                                            padding: '1rem', border: 'none', background: '#f8fafc',
                                            borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
                                            color: val === 'Go' ? '#10b981' : '#1e293b'
                                        }}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                style={{ display: 'inline-block', marginBottom: '1.5rem' }}
                            >
                                <Loader2 size={60} color="#6366f1" />
                            </motion.div>
                            <h3>Syncing with Bank...</h3>
                            <p style={{ color: '#64748b' }}>Establishing secure connection</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 10 }}
                                style={{ display: 'inline-block', marginBottom: '1.5rem' }}
                            >
                                <CheckCircle size={80} color="#10b981" />
                            </motion.div>
                            <h2 style={{ color: '#10b981' }}>Success!</h2>
                            <p style={{ fontWeight: '600' }}>₹{amount} Added to Wallet</p>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem' }}>Transaction ID: {orderId}</p>
                        </div>
                    )}
                </div>

                {/* Footer Logo */}
                <div style={{ padding: '1rem', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '1px', fontWeight: 'bold' }}>POWERED BY UPI</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PaymentSimulator;
