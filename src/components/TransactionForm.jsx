import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ReceiptUpload from './ReceiptUpload';

const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Other'];

const TransactionForm = () => {
    const { addTransaction } = useApp();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description || !amount) return;

        // Map frontend categories to backend categories
        const categoryMap = {
            'Food': 'food',
            'Transport': 'transport',
            'Utilities': 'bills',
            'Entertainment': 'entertainment',
            'Health': 'health',
            'Shopping': 'shopping',
            'Other': 'other'
        };

        const newTransaction = {
            description,
            amount: parseFloat(amount),
            type: type, // 'income' or 'expense'
            category: type === 'expense' ? categoryMap[category] || 'other' : 'salary',
            date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
        };

        try {
            await addTransaction(newTransaction);
            setDescription('');
            setAmount('');
            setFile(null);
        } catch (error) {
            console.error('Failed to add transaction:', error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel"
            style={{ padding: '2rem', height: 'fit-content' }}
        >
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} /> Add New
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Type Toggle */}
                <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', padding: '0.25rem', borderRadius: '12px' }}>
                    <button
                        type="button"
                        onClick={() => setType('expense')}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: type === 'expense' ? 'var(--accent-red)' : 'transparent',
                            color: type === 'expense' ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'all 0.2s'
                        }}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('income')}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: type === 'income' ? 'var(--accent-green)' : 'transparent',
                            color: type === 'income' ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'all 0.2s'
                        }}
                    >
                        Income
                    </button>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
                    <input
                        className="input-field"
                        placeholder="e.g. Grocery Shopping"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Amount (₹)</label>
                    <input
                        type="number"
                        className="input-field"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>

                {type === 'expense' && (
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Category</label>
                        <select
                            className="input-field"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{ cursor: 'pointer' }}
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                )}

                <ReceiptUpload file={file} setFile={setFile} />

                <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                    Add Transaction
                </button>

            </form>
        </motion.div>
    );
};

export default TransactionForm;
