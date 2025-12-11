import React from 'react';
import AIAdvisor from '../components/AIAdvisor';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

const AdvisorPage = () => {
    const { transactions } = useApp();
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ marginBottom: '2rem' }}>Thrifty AI Advisor</h2>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <AIAdvisor transactions={transactions} />
            </div>
        </motion.div>
    );
};

export default AdvisorPage;
