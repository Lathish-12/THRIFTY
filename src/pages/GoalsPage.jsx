import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Trophy, TrendingUp, Trash2, Calendar, IndianRupee } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../api/axios';
import { toast } from 'react-toastify';

const GoalsPage = () => {
    const { user } = useApp();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (user.isAuthenticated) {
            fetchGoals();
        }
    }, [user.isAuthenticated]);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users/goals/');
            setGoals(response.data);
        } catch (error) {
            console.error('Error fetching goals:', error);
            toast.error('Failed to load goals');
        } finally {
            setLoading(false);
        }
    };

    const addGoal = async (newGoal) => {
        try {
            console.log('Adding goal:', newGoal);
            const response = await api.post('/users/goals/', newGoal);
            console.log('Goal added successfully:', response.data);
            setGoals([...goals, response.data]);
            toast.success('Goal created successfully!');
            setShowAddModal(false);
        } catch (error) {
            console.error('Error adding goal:', error);
            toast.error(`Failed to create goal: ${error.response?.data?.detail || error.message}`);
        }
    };

    const deleteGoal = async (id) => {
        try {
            await api.delete(`/users/goals/${id}/`);
            setGoals(goals.filter(g => g.id !== id));
            toast.success('Goal deleted');
        } catch (error) {
            console.error('Error deleting goal:', error);
            toast.error('Failed to delete goal');
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
                <h3>Loading goals...</h3>
            </div>
        );
    }

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem' }}>Savings Goals</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Visualize your dreams and reach them faster.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={20} /> New Goal
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {goals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} onDelete={() => deleteGoal(goal.id)} />
                ))}

                {/* Add Goal Placeholder */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setShowAddModal(true)}
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

            {showAddModal && (
                <AddGoalModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={addGoal}
                />
            )}
        </div>
    );
};

const GoalCard = ({ goal, onDelete }) => {
    const percentage = Math.min((parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100, 100);

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-panel"
            style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}
        >
            <button
                onClick={onDelete}
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.4rem',
                    cursor: 'pointer',
                    color: '#ef4444',
                    zIndex: 10
                }}
                title="Delete goal"
            >
                <Trash2 size={16} />
            </button>

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
                    {goal.icon || '🎯'}
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
                    <span>₹{parseFloat(goal.current_amount).toLocaleString()}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>of ₹{parseFloat(goal.target_amount).toLocaleString()}</span>
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

const AddGoalModal = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('0');
    const [deadline, setDeadline] = useState('');
    const [icon, setIcon] = useState('🎯');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !targetAmount || !deadline) {
            toast.error('Please fill all required fields');
            return;
        }
        onAdd({
            name,
            target_amount: parseFloat(targetAmount),
            current_amount: parseFloat(currentAmount || 0),
            deadline,
            icon
        });
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
                <h3 style={{ marginBottom: '1.5rem' }}>Create New Goal</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Goal Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., New Laptop, Vacation"
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Target Amount (₹)</label>
                            <input
                                type="number"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                placeholder="50000"
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Current Savings (₹)</label>
                            <input
                                type="number"
                                value={currentAmount}
                                onChange={(e) => setCurrentAmount(e.target.value)}
                                placeholder="0"
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
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Target Deadline</label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Goal Icon</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {['🎯', '💻', '🌴', '🏠', '🚗', '🎓', '🏥', '🎮', '📱'].map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setIcon(emoji)}
                                    style={{
                                        fontSize: '1.2rem',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        background: icon === emoji ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                                        border: icon === emoji ? '2px solid white' : '1px solid var(--glass-border)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {emoji}
                                </button>
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
                            Create Goal
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default GoalsPage;
