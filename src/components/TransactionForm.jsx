import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ReceiptUpload from './ReceiptUpload';

const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Other'];

const categoryMap = {
    'food': 'Food',
    'transport': 'Transport',
    'bills': 'Utilities',
    'entertainment': 'Entertainment',
    'health': 'Health',
    'shopping': 'Shopping',
    'other': 'Other',
    'salary': 'Other'
};

const reverseCategoryMap = {
    'Food': 'food',
    'Transport': 'transport',
    'Utilities': 'bills',
    'Entertainment': 'entertainment',
    'Health': 'health',
    'Shopping': 'shopping',
    'Other': 'other'
};

const TransactionForm = ({ editingTransaction, onCancel }) => {
    const { addTransaction, updateTransaction } = useApp();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [file, setFile] = useState(null);

    // Populate form when editing
    useEffect(() => {
        if (editingTransaction) {
            setDescription(editingTransaction.description);
            setAmount(editingTransaction.amount.toString());
            setType(editingTransaction.type);
            setCategory(categoryMap[editingTransaction.category] || CATEGORIES[0]);
        } else {
            // Reset form
            setDescription('');
            setAmount('');
            setType('expense');
            setCategory(CATEGORIES[0]);
        }
    }, [editingTransaction]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description || !amount) return;

        const transactionData = {
            description,
            amount: parseFloat(amount),
            type: type,
            category: type === 'expense' ? reverseCategoryMap[category] || 'other' : 'salary',
            date: editingTransaction ? editingTransaction.date : new Date().toISOString().split('T')[0],
        };

        try {
            if (editingTransaction) {
                await updateTransaction(editingTransaction.id, transactionData);
                onCancel(); // Reset editing state
            } else {
                await addTransaction(transactionData);
            }

            // Clear fields if not editing
            if (!editingTransaction) {
                setDescription('');
                setAmount('');
                setFile(null);
            }
        } catch (error) {
            console.error('Failed to save transaction:', error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel"
            style={{ padding: '2rem', height: 'fit-content' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {editingTransaction ? <Pencil size={20} color="var(--accent-blue)" /> : <Plus size={20} />}
                    {editingTransaction ? 'Edit Transaction' : 'Add New'}
                </h3>
                {editingTransaction && (
                    <button
                        onClick={onCancel}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Type Toggle */}
                <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', padding: '0.25rem', borderRadius: '12px' }}>
                    <button
                        type="button"
                        disabled={editingTransaction} // Optionally disable type change during edit
                        onClick={() => setType('expense')}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: type === 'expense' ? 'var(--accent-red)' : 'transparent',
                            color: type === 'expense' ? 'white' : 'var(--text-secondary)',
                            cursor: editingTransaction ? 'not-allowed' : 'pointer',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                            opacity: editingTransaction && type !== 'expense' ? 0.5 : 1
                        }}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        disabled={editingTransaction}
                        onClick={() => setType('income')}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: type === 'income' ? 'var(--accent-green)' : 'transparent',
                            color: type === 'income' ? 'white' : 'var(--text-secondary)',
                            cursor: editingTransaction ? 'not-allowed' : 'pointer',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                            opacity: editingTransaction && type !== 'income' ? 0.5 : 1
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

                {!editingTransaction && <ReceiptUpload file={file} setFile={setFile} />}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    {editingTransaction && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn-secondary"
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ flex: 2, padding: '0.75rem' }}
                    >
                        {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                    </button>
                </div>

            </form>
        </motion.div>
    );
};

export default TransactionForm;
