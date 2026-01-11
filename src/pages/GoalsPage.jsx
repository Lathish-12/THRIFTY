import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Trophy, TrendingUp } from 'lucide-react';

const GoalsPage = () => {
    const [goals, setGoals] = useState([
        { id: 1, name: 'New Laptop', target: 80000, current: 45000, deadline: '2024-12-31', icon: '💻' },
        { id: 2, name: 'Vacation', target: 150000, current: 20000, deadline: '2025-06-15', icon: 'vacation' },
        { id: 3, name: 'Emergency Fund', target: 100000, current: 85000, deadline: '2024-10-01', icon: 'fun' },
    ]);

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem' }}>Savings Goals</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Visualize your dreams and reach them faster.</p>
                </div>
                <button className="btn-primary">
                    <Plus size={20} /> New Goal
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {goals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                ))}

                {/* Add Goal Placeholder */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    style={{
                        border: '2px dashed var(--glass-border)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '250px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                    }}
                >
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Plus size={30} />
                    </div>
                    <h3>Create New Goal</h3>
                </motion.div>
            </div>
        </div>
    );
};

const GoalCard = ({ goal }) => {
    const percentage = Math.min((goal.current / goal.target) * 100, 100);

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-panel"
            style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                }}>
                    {goal.id === 1 ? '💻' : goal.id === 2 ? '🌴' : '🛡️'}
                </div>
                <div style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>
                    {percentage.toFixed(0)}%
                </div>
            </div>

            <h3 style={{ margin: '0 0 0.5rem 0' }}>{goal.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Target: {new Date(goal.deadline).toLocaleDateString()}
            </p>

            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <span>₹{goal.current.toLocaleString()}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>of ₹{goal.target.toLocaleString()}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1 }}
                        style={{ height: '100%', background: 'var(--accent-blue)', borderRadius: '4px' }}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default GoalsPage;
