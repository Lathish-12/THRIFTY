import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, TrendingUp, TrendingDown, Pencil, Info, FileImage, X } from 'lucide-react';
import { formatDate } from '../utils';
import { useApp } from '../context/AppContext';

const TransactionList = ({ transactions, onDelete, onEdit }) => {
    const { formatCurrency } = useApp();
    const [selectedMsg, setSelectedMsg] = React.useState(null);
    const [viewingReceipt, setViewingReceipt] = React.useState(null);

    const getMethodLabel = (method) => {
        const map = {
            'upi': 'UPI',
            'cash': 'Cash',
            'card': 'Card',
            'net_banking': 'Net Banking',
            'other': 'Other'
        };
        return map[method] || method || 'Other';
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', height: '100%', position: 'relative' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Recent History</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <AnimatePresence mode="popLayout">
                    {transactions.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            layout
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                background: 'rgba(15, 23, 42, 0.4)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                position: 'relative'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                <div style={{
                                    padding: '0.5rem',
                                    borderRadius: '10px',
                                    background: t.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)'
                                }}>
                                    {t.type === 'income' ?
                                        <TrendingUp size={18} color="#10b981" /> :
                                        <TrendingDown size={18} color="#f43f5e" />
                                    }
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 500, margin: 0 }}>{t.description}</h4>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            {t.source_message && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedMsg(selectedMsg === t.id ? null : t.id) }}
                                                    style={{ background: 'rgba(99, 102, 241, 0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', padding: '4px' }}
                                                    title="View Tracked Message"
                                                >
                                                    <Info size={14} color="var(--accent-blue)" />
                                                </button>
                                            )}
                                            {t.receipt_url && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setViewingReceipt(t.receipt_url) }}
                                                    style={{ background: 'rgba(16, 185, 129, 0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', padding: '4px' }}
                                                    title="View Receipt Image"
                                                >
                                                    <FileImage size={14} color="#10b981" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
                                        {formatDate(t.date)} • {t.category} • <span style={{ color: 'var(--accent-blue)' }}>{getMethodLabel(t.payment_method)}</span>
                                    </p>

                                    {/* Tracked Message Overlay */}
                                    <AnimatePresence>
                                        {selectedMsg === t.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                style={{ overflow: 'hidden', marginTop: '0.5rem' }}
                                            >
                                                <div style={{ fontSize: '0.7rem', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', borderLeft: '2px solid var(--accent-blue)', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                                    {t.source_message}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{
                                    fontWeight: 600,
                                    color: t.type === 'income' ? '#10b981' : '#f8fafc'
                                }}>
                                    {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => onEdit(t)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            padding: '0.25rem',
                                            transition: 'color 0.2s'
                                        }}
                                        className="hover-blue"
                                        title="Edit Transaction"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(t.id)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            padding: '0.25rem',
                                            transition: 'color 0.2s'
                                        }}
                                        className="hover-red"
                                        title="Delete Transaction"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {transactions.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                            No transactions found.
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Receipt Modal */}
            <AnimatePresence>
                {viewingReceipt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setViewingReceipt(null)}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}
                        >
                            <img
                                src={viewingReceipt}
                                alt="Receipt"
                                style={{ maxWidth: '100%', maxHeight: '600px', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                            <button
                                onClick={() => setViewingReceipt(null)}
                                style={{
                                    position: 'absolute',
                                    top: '-40px',
                                    right: '0',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={24} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TransactionList;

