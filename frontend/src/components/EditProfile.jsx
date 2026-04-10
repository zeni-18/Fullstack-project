import React, { useState } from 'react';
import { X, Camera } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const EditProfile = ({ onClose, onProfileUpdated }) => {
    const { user, setUser } = useAuth();
    const [formData, setFormData] = useState({
        fullName: user.fullName || '',
        bio: user.bio || '',
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(user.profileImage || 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/v1/user_profile_default.png');
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append('fullName', formData.fullName);
        data.append('bio', formData.bio);
        if (image) data.append('image', image);

        try {
            const res = await axios.put('/users/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(res.data);
            onProfileUpdated(res.data);
            toast.success('Profile updated!');
            onClose();
        } catch (err) {
            toast.error('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card"
                style={{ width: '100%', maxWidth: '440px', padding: '32px' }}
            >
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Edit Profile</h3>
                    <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex column gap-md">
                    <div className="flex-center column" style={{ gap: '16px', marginBottom: '8px' }}>
                        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                            <img
                                src={preview}
                                alt="preview"
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                            />
                            <label style={{
                                position: 'absolute', bottom: '0', right: '0',
                                backgroundColor: 'var(--primary)', color: 'white',
                                width: '32px', height: '32px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', boxShadow: 'var(--shadow-md)'
                            }}>
                                <Camera size={18} />
                                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        <button type="button" style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}>Change Profile Photo</button>
                    </div>

                    <div className="flex column gap-xs">
                        <label style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)', paddingLeft: '4px' }}>Full Name</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="Name"
                            style={{ width: '100%', padding: '12px' }}
                        />
                    </div>

                    <div className="flex column gap-xs">
                        <label style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)', paddingLeft: '4px' }}>Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell the world about yourself..."
                            style={{ width: '100%', height: '100px', padding: '12px' }}
                        />
                    </div>

                    <div className="flex gap-md" style={{ marginTop: '12px' }}>
                        <button type="button" onClick={onClose} className="card" style={{ flex: 1, padding: '12px', fontWeight: '700' }}>Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                            {loading ? <div className="spinner" style={{ borderTopColor: 'white' }}></div> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditProfile;
