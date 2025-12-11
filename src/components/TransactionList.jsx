import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';

const TransactionList = ({ transactions, onDelete }) => {
    return (
        <div className="glass-panel" style={{ padding: '2rem', height: '100%' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Recent History</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
                <AnimatePresence>
                    {transactions.slice().reverse().map((t) => (
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
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                                <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 500 }}>{t.description}</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDate(t.date)} • {t.category}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{
                                    fontWeight: 600,
                                    color: t.type === 'income' ? '#10b981' : '#f8fafc'
                                }}>
                                    {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                                </span>
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
                                >
                                    <Trash2 size={16} className="delete-icon" /> {/* Add hover style in CSS if needed */}
                                </button>
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
        </div>
    );
};

export default TransactionList;
