import React, { useState } from 'react';
import QRCode from "react-qr-code";
import { motion } from 'framer-motion';
import { X, Copy, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useApp } from '../context/AppContext';

const UPIGenerator = ({ onClose }) => {
    const { user } = useApp();
    const [upiId, setUpiId] = useState(user?.profile?.upi_id || '');
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [note, setNote] = useState('');

    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name || 'User')}&am=${amount || '0'}&cu=INR&tn=${encodeURIComponent(note || 'Payment')}`;

    const handleCopy = () => {
        if (!upiId) return toast.warning("Enter UPI ID first");
        navigator.clipboard.writeText(upiLink);
        toast.success("Payment Link Copied!");
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                    background: 'var(--bg-secondary)',
                    padding: '2rem',
                    borderRadius: '24px',
                    width: '90%',
                    maxWidth: '400px',
                    border: '1px solid var(--glass-border)',
                    position: 'relative',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'linear-gradient(to right, #4ade80, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Receive Payment (UPI)
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Your UPI ID (VPA)</label>
                        <input
                            type="text"
                            placeholder="e.g. user@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Amount (₹)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Name (Optional)</label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Note (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. Dinner split"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="input-field"
                        />
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {upiId ? (
                        <div style={{ background: 'white', padding: '1rem', borderRadius: '12px' }}>
                            <QRCode
                                value={upiLink}
                                size={180}
                                level="M"
                            />
                        </div>
                    ) : (
                        <div style={{
                            width: '200px',
                            height: '200px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-secondary)',
                            border: '2px dashed var(--glass-border)'
                        }}>
                            Enter UPI ID to generate QR
                        </div>
                    )}

                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Scan with any UPI app (GPay, PhonePe, Paytm)
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%' }}>
                        <button
                            className="btn-secondary"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            onClick={handleCopy}
                        >
                            <Copy size={18} /> Copy Link
                        </button>
                        <a
                            href={upiLink}
                            className="btn-primary"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Share2 size={18} /> Open App
                        </a>
                    </div>
                </div>

            </motion.div>
        </motion.div>
    );
};

export default UPIGenerator;
