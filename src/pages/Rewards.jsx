import React from 'react';
import GamificationHub from '../components/Gamification';
import { motion } from 'framer-motion';

const RewardsPage = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ marginBottom: '2rem' }}>Rewards & Badges</h2>
            <GamificationHub />
        </motion.div>
    );
};

export default RewardsPage;
