import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award, Gift } from 'lucide-react';
import { useApp } from '../context/AppContext';

const GamificationHub = () => {
    const { points, badges } = useApp();

    // Simple level logic: 100 points per level
    const level = Math.floor(points / 100) + 1;
    const progress = points % 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={20} color="#f59e0b" /> Rewards Hub
                </h3>
                <span style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'white'
                }}>
                    LEVEL {level}
                </span>
            </div>

            {/* Progress Bar */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Points</span>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>{points} PTS</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1 }}
                        style={{ height: '100%', background: '#f59e0b', borderRadius: '4px' }}
                    />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', textAlign: 'right' }}>
                    {100 - progress} pts to next level
                </p>
            </div>

            {/* Badges Grid */}
            <div>
                <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Your Badges</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {badges.length > 0 ? badges.map((badge, idx) => (
                        <div key={idx} style={{
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '8px',
                            color: '#f59e0b',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            <Award size={12} /> {badge}
                        </div>
                    )) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            Add transactions to earn badges!
                        </span>
                    )}
                </div>
            </div>

            {/* Rewards Mock */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(236, 72, 153, 0.2)', borderRadius: '8px' }}>
                    <Gift size={20} color="#ec4899" />
                </div>
                <div>
                    <h4 style={{ fontSize: '0.875rem' }}>Coupons Available</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reach Level 3 to unlock premium discounts.</p>
                </div>
            </div>

        </motion.div>
    );
};

export default GamificationHub;
