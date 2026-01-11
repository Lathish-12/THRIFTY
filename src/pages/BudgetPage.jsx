import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const BudgetPage = () => {
    // Mock data for budgets
    const [budgets, setBudgets] = useState([
        { id: 1, category: 'Food & Dining', limit: 5000, spent: 3200, color: '#f43f5e' },
        { id: 2, category: 'Transportation', limit: 3000, spent: 2800, color: '#3b82f6' },
        { id: 3, category: 'Entertainment', limit: 2000, spent: 500, color: '#a855f7' },
        { id: 4, category: 'Shopping', limit: 4000, spent: 1200, color: '#10b981' },
    ]);

    const totalBudget = budgets.reduce((acc, curr) => acc + curr.limit, 0);
    const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);

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
                    <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        <Plus size={18} /> Add Budget
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {budgets.map((budget) => (
                        <BudgetRow key={budget.id} budget={budget} />
                    ))}
                </div>
            </div>
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

const BudgetRow = ({ budget }) => {
    const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
    const isCrisis = percentage > 90;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '600' }}>{budget.category}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        ₹{budget.spent.toLocaleString()} / ₹{budget.limit.toLocaleString()}
                    </span>
                </div>
                <span style={{ fontWeight: '600', color: isCrisis ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                    {percentage.toFixed(0)}%
                </span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        background: budget.color,
                        borderRadius: '5px'
                    }}
                />
            </div>
        </div>
    );
};

export default BudgetPage;
