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

    // Profile photo upload removed — render nothing
    return null;
};

export default ProfilePhotoUpload;
