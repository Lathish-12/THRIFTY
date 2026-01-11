import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const ProfilePhotoUpload = ({ currentPhoto, onPhotoUpdate }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentPhoto);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to backend
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('profile_picture', file);

            const response = await api.patch('/users/profile/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.profile_picture_url) {
                setPreview(response.data.profile_picture_url);
                onPhotoUpdate && onPhotoUpdate(response.data.profile_picture_url);
                toast.success('Profile photo updated!', { theme: 'dark' });
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            toast.error('Failed to upload photo');
            setPreview(currentPhoto);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '4px solid rgba(139, 92, 246, 0.3)',
                        background: preview
                            ? `url(${preview}) center/cover`
                            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative'
                    }}
                    onClick={() => document.getElementById('profile-photo-input').click()}
                >
                    {!preview && (
                        <Camera size={48} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    )}
                    {uploading && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            Uploading...
                        </div>
                    )}
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => document.getElementById('profile-photo-input').click()}
                    style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                        border: '3px solid var(--bg-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
                    }}
                >
                    <Upload size={20} color="white" />
                </motion.button>
            </div>

            <input
                id="profile-photo-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={uploading}
            />

            <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                textAlign: 'center'
            }}>
                Click to upload profile picture
                <br />
                <span style={{ fontSize: '0.75rem' }}>Max size: 5MB</span>
            </p>
        </div>
    );
};

export default ProfilePhotoUpload;
