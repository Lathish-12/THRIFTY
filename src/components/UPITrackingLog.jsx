import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, XCircle, Clock, History, Search } from 'lucide-react';
import PaymentService from '../api/paymentService';
import { useApp } from '../context/AppContext';

const UPITrackingLog = () => {
    const { formatCurrency } = useApp();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await PaymentService.getPaymentHistory();
            setPayments(data);
        } catch (error) {
            console.error("Failed to load tracking log");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredPayments = payments.filter(p =>
        p.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.payment_id && p.payment_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Shield size={24} color="var(--accent-blue)" />
                    <h3 style={{ margin: 0 }}>UPI Audit Log (Tracking)</h3>
                </div>
                <button
                    onClick={fetchHistory}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                >
                    <History size={14} /> Refresh
                </button>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                    type="text"
                    placeholder="Search Order ID or Payment ID..."
                    className="input-field"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.02)' }}
                />
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '0.8rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TIMESTAMP</th>
                            <th style={{ padding: '0.8rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ORDER ID</th>
                            <th style={{ padding: '0.8rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AMOUNT</th>
                            <th style={{ padding: '0.8rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>STATUS</th>
                            <th style={{ padding: '0.8rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>REF ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Scanning Blockchain...</td></tr>
                        ) : filteredPayments.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No tracked UPI transactions found.</td></tr>
                        ) : (
                            filteredPayments.map((p) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '0.8rem', fontSize: '0.8rem' }}>
                                        {new Date(p.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </td>
                                    <td style={{ padding: '0.8rem', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--accent-blue)' }}>
                                        {p.order_id}
                                    </td>
                                    <td style={{ padding: '0.8rem', fontWeight: 'bold' }}>
                                        {formatCurrency(p.amount)}
                                    </td>
                                    <td style={{ padding: '0.8rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                            {p.status === 'success' ? (
                                                <><CheckCircle2 size={14} color="#10b981" /> <span style={{ color: '#10b981' }}>Verified</span></>
                                            ) : p.status === 'failed' ? (
                                                <><XCircle size={14} color="#f43f5e" /> <span style={{ color: '#f43f5e' }}>Failed</span></>
                                            ) : (
                                                <><Clock size={14} color="#f59e0b" /> <span style={{ color: '#f59e0b' }}>Pending</span></>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.8rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                        {p.payment_id || 'N/A'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px dashed rgba(99, 102, 241, 0.2)' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    🔐 All transactions above are cryptographically tracked and reconciled with the banking gateway webhook.
                </p>
            </div>
        </div>
    );
};

export default UPITrackingLog;
