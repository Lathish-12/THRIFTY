import React, { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import api from '../api/axios';

const HomePage = () => {
    const { transactions, user } = useApp();
    const [profilePhoto, setProfilePhoto] = useState(null);

    useEffect(() => {
        // Fetch profile photo on mount
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/profile/');
                setProfilePhoto(response.data.profile_picture_url);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchProfile();
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Dashboard Overview</h2>

            {/* Profile Section */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <ProfilePhotoUpload
                        currentPhoto={profilePhoto}
                        onPhotoUpdate={setProfilePhoto}
                    />
                    <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>Welcome Back, {user.name}!</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {user.email}
                        </p>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            You are on track with your monthly budget. Check your rewards progress!
                        </p>
                    </div>
                </div>
            </div>

            <Dashboard transactions={transactions} />
        </motion.div>
    );
};

export default HomePage;

