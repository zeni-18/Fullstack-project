import React, { useState } from 'react';
import { X, Image as ImageIcon, Video as VideoIcon, MapPin, Send } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const CreatePost = ({ onClose, onPostCreated }) => {
    const { user } = useAuth();
    const [media, setMedia] = useState(null);
    const [preview, setPreview] = useState('');
    const [mediaType, setMediaType] = useState('image');
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMedia(file);
            setPreview(URL.createObjectURL(file));
            // Detect if it's a video or image
            if (file.type.startsWith('video/')) {
                setMediaType('video');
            } else {
                setMediaType('image');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!media) return toast.error('Please select an image or video');

        setLoading(true);
        const formData = new FormData();
        formData.append('image', media);
        formData.append('caption', caption);
        formData.append('location', location);
        formData.append('mediaType', mediaType);

        try {
            const res = await axios.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(`${mediaType === 'video' ? 'Video' : 'Post'} created successfully!`);
            onPostCreated(res.data);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error creating post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.85)',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                backdropFilter: 'blur(4px)'
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={{
                    backgroundColor: 'var(--card-bg)',
                    width: '100%',
                    maxWidth: '800px',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh',
                    boxShadow: 'var(--shadow-lg)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-between" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <button onClick={onClose} style={{ color: 'var(--text-main)' }}><X size={24} /></button>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Create New Post</h3>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !media}
                        style={{
                            color: 'var(--primary)',
                            fontWeight: '800',
                            fontSize: '0.95rem',
                            opacity: (loading || !media) ? 0.5 : 1
                        }}
                    >
                        {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }}></div> : 'Share'}
                    </button>
                </div>

                <div className="flex" style={{ height: '100%', overflow: 'hidden', flex: 1 }}>
                    <div style={{
                        flex: 1.2,
                        backgroundColor: 'var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: '1px solid var(--border)',
                        position: 'relative',
                        minHeight: '400px'
                    }}>
                        {preview ? (
                            mediaType === 'video' ? (
                                <video src={preview} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Preview" />
                            )
                        ) : (
                            <div className="flex column flex-center" style={{ gap: '16px', color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <ImageIcon size={48} strokeWidth={1} />
                                    <VideoIcon size={48} strokeWidth={1} />
                                </div>
                                <p style={{ fontWeight: '500' }}>Select an image or video to start</p>
                                <label className="btn-primary" style={{ cursor: 'pointer', padding: '10px 20px' }}>
                                    Select from computer
                                    <input type="file" hidden accept="image/*,video/*" onChange={handleMediaChange} />
                                </label>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Max 100MB • MP4, WebM, AVI, JPG, PNG</p>
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                            <img
                                src={user?.profileImage || 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/v1/user_profile_default.png'}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                alt="me"
                            />
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user?.username}</span>
                        </div>

                        <textarea
                            placeholder="Write a caption..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            style={{
                                width: '100%',
                                border: 'none',
                                resize: 'none',
                                padding: 0,
                                fontSize: '1rem',
                                height: '120px',
                                background: 'transparent'
                            }}
                        />

                        <div className="flex column gap-sm">
                            <div className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                <div className="flex gap-sm" style={{ color: 'var(--text-main)' }}>
                                    <MapPin size={20} />
                                    <input
                                        type="text"
                                        placeholder="Add location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        style={{ border: 'none', padding: 0, fontSize: '0.95rem', background: 'transparent' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', padingTop: '20px' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                Your post will be shared with your followers and can be discovered in Explore.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CreatePost;
