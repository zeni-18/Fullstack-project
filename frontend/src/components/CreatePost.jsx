import React, { useState } from 'react';
import { X, Image as ImageIcon, Video as VideoIcon, MapPin, Send, Sparkles, Camera } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCapture from './CameraCapture';

const CreatePost = ({ onClose, onPostCreated }) => {
    const { user } = useAuth();
    const [media, setMedia] = useState(null);
    const [preview, setPreview] = useState('');
    const [mediaType, setMediaType] = useState('image');
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMedia(file);
            setPreview(URL.createObjectURL(file));
            if (file.type.startsWith('video/')) {
                setMediaType('video');
            } else {
                setMediaType('image');
            }
        }
    };

    const handleCameraCapture = (file) => {
        setMedia(file);
        setPreview(URL.createObjectURL(file));
        setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
        setIsCameraOpen(false);
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
                    maxWidth: '850px',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-between" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--card-bg)' }}>
                    <button onClick={onClose} style={{ color: 'var(--text-main)', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7}>
                        <X size={20} />
                    </button>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', letterSpacing: '-0.01em' }}>Create New Post</h3>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !media}
                        style={{
                            color: 'var(--primary)',
                            fontWeight: '800',
                            fontSize: '0.95rem',
                            opacity: (loading || !media) ? 0.3 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }}></div> : 'Share'}
                    </button>
                </div>

                <div className="flex" style={{ height: '100%', overflow: 'hidden', flex: 1 }}>
                    {/* Left Media Panel */}
                    <div style={{
                        flex: 1.3,
                        backgroundColor: 'var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: '1px solid var(--border)',
                        position: 'relative',
                        minHeight: '480px',
                        background: 'linear-gradient(135deg, var(--bg) 0%, var(--bg-secondary) 100%)'
                    }}>
                        {preview ? (
                            mediaType === 'video' ? (
                                <video src={preview} controls style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black' }} />
                            ) : (
                                <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black' }} alt="Preview" />
                            )
                        ) : (
                            <div className="flex column flex-center" style={{ gap: '24px', color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>
                                <div style={{
                                    display: 'flex',
                                    gap: '24px',
                                    background: 'var(--card-bg)',
                                    padding: '24px',
                                    borderRadius: '50%',
                                    border: '1px solid var(--border)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <ImageIcon size={40} strokeWidth={1} />
                                    <VideoIcon size={40} strokeWidth={1} />
                                </div>
                                <div style={{ marginBottom: '8px' }}>
                                    <p style={{ fontWeight: '600', fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>Select an image or video</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>Max 1GB • MP4, WEBM, JPG, PNG</p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px' }}>
                                    <label className="btn-primary" style={{
                                        cursor: 'pointer',
                                        padding: '14px 24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        fontSize: '0.95rem',
                                        fontWeight: '700',
                                        transition: 'all 0.2s'
                                    }}>
                                        <ImageIcon size={18} /> Select from computer
                                        <input type="file" hidden accept="image/*,video/*" onChange={handleMediaChange} />
                                    </label>

                                    <button
                                        onClick={() => setIsCameraOpen(true)}
                                        className="card"
                                        style={{
                                            padding: '14px 24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            fontWeight: '700',
                                            color: 'var(--text-main)',
                                            fontSize: '0.95rem',
                                            border: '1px solid var(--border)',
                                            transition: 'all 0.2s',
                                            background: 'var(--card-bg)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--card-bg)'}
                                    >
                                        <Camera size={18} /> Open Camera
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Info Panel */}
                    <div style={{
                        flex: 1,
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        backgroundColor: 'var(--card-bg)'
                    }}>
                        <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                            <img
                                src={user?.profileImage || 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/v1/user_profile_default.png'}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                                alt="me"
                            />
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user?.username}</span>
                        </div>

                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            background: 'var(--bg)',
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}>
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
                                    height: '140px',
                                    background: 'transparent',
                                    color: 'var(--text-main)',
                                    lineHeight: '1.6',
                                    outline: 'none'
                                }}
                            />
                            <div className="flex" style={{ justifyContent: 'flex-end' }}>
                                {/* AI Assist - Only shown if key is configured */}
                                {import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_GOES_HERE" && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={async () => {
                                            if (!caption && !media) return toast.info('Add context/media for better AI results');
                                            const loadingToast = toast.loading('AI is thinking...');
                                            try {
                                                const payload = {
                                                    prompt: `Write an engaging caption for social media. ${caption ? `Context: ${caption}` : ''} ${mediaType ? `Media: ${mediaType}` : ''}.`
                                                };

                                                if (mediaType === 'image' && media) {
                                                    const reader = new FileReader();
                                                    reader.readAsDataURL(media);
                                                    reader.onloadend = async () => {
                                                        const base64data = reader.result;
                                                        try {
                                                            const res = await axios.post('/ai/generate-post', { ...payload, image: base64data });
                                                            setCaption(res.data.content);
                                                            toast.update(loadingToast, { render: 'AI Caption generated!', type: 'success', isLoading: false, autoClose: 2000 });
                                                        } catch (err) {
                                                            toast.update(loadingToast, { render: 'Vision AI failed.', type: 'error', isLoading: false, autoClose: 2000 });
                                                        }
                                                    };
                                                } else {
                                                    const res = await axios.post('/ai/generate-post', payload);
                                                    setCaption(res.data.content);
                                                    toast.update(loadingToast, { render: 'AI Caption generated!', type: 'success', isLoading: false, autoClose: 2000 });
                                                }
                                            } catch (err) {
                                                toast.update(loadingToast, { render: 'AI Assist failed.', type: 'error', isLoading: false, autoClose: 2000 });
                                            }
                                        }}
                                        className="glass"
                                        style={{
                                            padding: '8px 14px',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.8rem',
                                            fontWeight: '700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            color: 'var(--primary)',
                                            border: '1px solid hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.2)',
                                            background: 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.05)'
                                        }}
                                    >
                                        <Sparkles size={14} /> AI Assist
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            background: 'var(--bg)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)'
                        }}>
                            <MapPin size={18} style={{ color: 'var(--text-tertiary)' }} />
                            <input
                                type="text"
                                placeholder="Add location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                style={{ border: 'none', padding: 0, fontSize: '0.95rem', background: 'transparent', width: '100%', color: 'var(--text-main)', outline: 'none' }}
                            />
                        </div>

                        <div style={{ marginTop: 'auto', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: '1.6', textAlign: 'center' }}>
                                Your post will be shared with your followers and can be discovered in Explore.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isCameraOpen && (
                    <CameraCapture
                        onCapture={handleCameraCapture}
                        onClose={() => setIsCameraOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CreatePost;
