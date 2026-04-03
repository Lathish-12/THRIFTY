import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../api/axios';
import { toast } from 'react-toastify';

const BudgetPage = () => {
    const { user } = useApp();
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Fetch budgets from backend
    useEffect(() => {
        if (user.isAuthenticated) {
            fetchBudgets();
        }
    }, [user.isAuthenticated]);

    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users/budgets/');
            setBudgets(response.data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
            toast.error('Failed to load budgets');
        } finally {
            setLoading(false);
        }
    };

    const addBudget = async (newBudget) => {
        try {
            const response = await api.post('/users/budgets/', newBudget);
            setBudgets([...budgets, response.data]);
            toast.success('Budget added successfully!');
            setShowAddModal(false);
        } catch (error) {
            console.error('Error adding budget:', error);
            if (error.response?.data?.category) {
                toast.error('Budget for this category already exists');
            } else if (error.response?.data?.detail) {
                toast.error(error.response.data.detail);
            } else {
                toast.error(`Failed to add budget: ${error.message}`);
            }
        }
    };

    const deleteBudget = async (id) => {
        try {
            await api.delete(`/users/budgets/${id}/`);
            setBudgets(budgets.filter(b => b.id !== id));
            toast.success('Budget deleted');
        } catch (error) {
            console.error('Error deleting budget:', error);
            toast.error('Failed to delete budget');
        }
    };

    const totalBudget = budgets.reduce((acc, curr) => acc + parseFloat(curr.limit || 0), 0);
    const totalSpent = budgets.reduce((acc, curr) => acc + parseFloat(curr.spent || 0), 0);

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
                <h3>Loading budgets...</h3>
            </div>
        );
    }

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem' }}>Monthly Budget</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Track your spending limits and save more.</p>
            </header>

            {/* Summary Cards */}
            <div className="grid-layout" style={{ marginBottom: '2rem' }}>
                <SummaryCard
                    title="Total Budget"
                    amount={totalBudget}
                    icon={<CheckCircle size={24} color="#10b981" />}
                />
                <SummaryCard
                    title="Total Spent"
                    amount={totalSpent}
                    icon={<TrendingUp size={24} color="#f43f5e" />}
                />
                <SummaryCard
                    title="Remaining"
                    amount={totalBudget - totalSpent}
                    icon={<AlertCircle size={24} color="#3b82f6" />}
                />
            </div>

            {/* Budgets List */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>Category Budgets</h3>
                    <button
                        className="btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus size={18} /> Add Budget
                    </button>
                </div>

                {budgets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        <p>No budgets yet. Click "Add Budget" to create one!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {budgets.map((budget) => (
                            <BudgetRow
                                key={budget.id}
                                budget={budget}
                                onDelete={() => deleteBudget(budget.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add Budget Modal */}
            {showAddModal && (
                <AddBudgetModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={addBudget}
                />
            )}
        </div>
    );
};

const SummaryCard = ({ title, amount, icon }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-panel"
        style={{
            gridColumn: 'span 4',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        }}
    >
        <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {icon}
        </div>
        <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{title}</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>₹{amount.toLocaleString()}</h3>
        </div>
    </motion.div>
);

const BudgetRow = ({ budget, onDelete }) => {
    const percentage = (budget.spent / budget.limit) * 100;
    const displayPercentage = Math.min(percentage, 100);

    // 7.4 Color Coding logic
    let statusColor = '#2dd4bf'; // Safe (Neon Teal)
    if (percentage > 90) {
        statusColor = '#ef4444'; // Critical (Panic Red)
    } else if (percentage > 60) {
        statusColor = '#fde047'; // Warning (Yellow)
    }

    const isCrisis = percentage > 90;
    const isWarning = percentage > 60 && percentage <= 90;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '600' }}>{budget.category}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        ₹{parseFloat(budget.spent || 0).toLocaleString()} / ₹{parseFloat(budget.limit).toLocaleString()}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                        fontWeight: '600',
                        color: statusColor,
                        textShadow: isCrisis ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none'
                    }}>
                        {percentage.toFixed(0)}%
                    </span>
                    <button
                        onClick={onDelete}
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#ef4444'
                        }}
                        title="Delete budget"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
            <div style={{
                width: '100%',
                height: '12px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                position: 'relative'
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${displayPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        background: `linear-gradient(90deg, ${statusColor}, ${statusColor}dd)`,
                        borderRadius: '6px',
                        boxShadow: `0 0 15px ${statusColor}44`
                    }}
                />
            </div>
        </div>
    );
};

const AddBudgetModal = ({ onClose, onAdd }) => {
    const [category, setCategory] = useState('');
    const [limit, setLimit] = useState('');
    const [color, setColor] = useState('#3b82f6');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!category || !limit || parseFloat(limit) <= 0) {
            toast.error('Please fill all fields with valid values');
            return;
        }
        onAdd({
            category: category,
            limit: parseFloat(limit),
            color: color
        });
        setCategory('');
        setLimit('');
        setColor('#3b82f6');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-panel"
                style={{
                    width: '90%',
                    maxWidth: '500px',
                    padding: '2rem'
                }}
            >
                <h3 style={{ marginBottom: '1.5rem' }}>Add New Budget</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            Category Name
                        </label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g., Food & Dining, Transport"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            Monthly Limit (₹)
                        </label>
                        <input
                            type="number"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            placeholder="5000"
                            min="0"
                            step="100"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            Color
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['#f43f5e', '#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ec4899'].map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        background: c,
                                        border: color === c ? '3px solid white' : 'none',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ flex: 1, padding: '0.75rem' }}
                        >
                            Add Budget
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default BudgetPage;
