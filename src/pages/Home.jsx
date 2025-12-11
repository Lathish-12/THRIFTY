import React from 'react';
import Dashboard from '../components/Dashboard';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

const HomePage = () => {
    const { transactions } = useApp();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Dashboard Overview</h2>
            <Dashboard transactions={transactions} />

            <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Welcome Back!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>You are on track with your monthly budget. Check your rewards progress!</p>
            </div>
        </motion.div>
    );
};

export default HomePage;
