import React, { useState } from 'react';
import { X, Heart, MessageCircle, Bookmark, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import VideoPlayer from './VideoPlayer';

const PostModal = ({ post, onClose }) => {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
    const [isSaved, setIsSaved] = useState(user?.savedPosts?.includes(post._id));
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(post.comments || []);

    const handleLike = async () => {
        try {
            const res = await axios.post(`/posts/${post._id}/like`);
            setIsLiked(res.data.isLiked);
            setLikesCount(res.data.likesCount);
        } catch (err) {
            toast.error('Error liking post');
        }
    };

    const handleSave = async () => {
        try {
            const res = await axios.post(`/posts/${post._id}/save`);
            setIsSaved(res.data.isSaved);
            toast.success(res.data.isSaved ? 'Post saved' : 'Post unsaved');
        } catch (err) {
            toast.error('Error saving post');
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            const res = await axios.post(`/posts/${post._id}/comment`, { text: commentText });
            setComments([...comments, res.data]);
            setCommentText('');
        } catch (err) {
            toast.error('Error adding comment');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await axios.delete(`/posts/${post._id}`);
            toast.success('Post deleted');
            onClose();
            window.location.reload();
        } catch (err) {
            toast.error('Error deleting post');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.95)',
                backdropFilter: 'var(--glass-blur-heavy)',
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--spacing-lg)'
            }}
        >
            {/* Close Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="glass"
                style={{
                    position: 'absolute',
                    top: 'var(--spacing-lg)',
                    right: 'var(--spacing-lg)',
                    color: 'white',
                    borderRadius: 'var(--radius-full)',
                    width: '48px',
                    height: '48px',
                    zIndex: 3002,
                    boxShadow: 'var(--shadow-glow)'
                }}
            >
                <X size={24} />
            </motion.button>

            {/* Split Screen Container */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr',
                    width: '100%',
                    maxWidth: '1400px',
                    height: '90vh',
                    borderRadius: 'var(--radius-2xl)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-xl)',
                    background: 'var(--card-bg)',
                    backdropFilter: 'var(--glass-blur-heavy)'
                }}
            >
                {/* Left: Media Section */}
                <div style={{
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    borderRadius: 'var(--radius-2xl) 0 0 var(--radius-2xl)'
                }}>
                    {post.mediaType === 'video' || post.imageUrl?.match(/\.(mp4|webm|avi|mov|mkv)$/i) ? (
                        <VideoPlayer src={post.imageUrl} />
                    ) : (
                        <img
                            src={post.imageUrl}
                            alt="Post"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    )}

                    {/* Floating Action Pills on Media */}
                    <div style={{
                        position: 'absolute',
                        bottom: 'var(--spacing-lg)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 'var(--spacing-sm)'
                    }}>
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={handleLike}
                            className="glass"
                            style={{
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                borderRadius: 'var(--radius-full)',
                                color: isLiked ? 'var(--error)' : 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-xs)',
                                fontWeight: '700',
                                backdropFilter: 'var(--glass-blur)'
                            }}
                        >
                            <Heart size={20} fill={isLiked ? 'var(--error)' : 'none'} strokeWidth={isLiked ? 0 : 2} />
                            <span>{likesCount}</span>
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            className="glass"
                            style={{
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                borderRadius: 'var(--radius-full)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-xs)',
                                fontWeight: '700',
                                backdropFilter: 'var(--glass-blur)'
                            }}
                        >
                            <MessageCircle size={20} />
                            <span>{comments.length}</span>
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={handleSave}
                            className="glass"
                            style={{
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-full)',
                                color: isSaved ? 'var(--primary)' : 'white',
                                backdropFilter: 'var(--glass-blur)'
                            }}
                        >
                            <Bookmark size={20} fill={isSaved ? 'var(--primary)' : 'none'} strokeWidth={isSaved ? 0 : 2} />
                        </motion.button>
                    </div>
                </div>

                {/* Right: Details Panel */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    background: 'var(--card-bg)',
                    backdropFilter: 'var(--glass-blur-heavy)'
                }}>
                    {/* Author Header */}
                    <div className="glass" style={{
                        padding: 'var(--spacing-lg)',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Link to={`/profile/${post.author.username}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--gradient-primary)',
                                padding: '2px'
                            }}>
                                <img
                                    src={post.author.profileImage || 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/v1/user_profile_default.png'}
                                    alt={post.author.username}
                                    style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                                />
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>
                                    {post.author.username}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                                    {formatDistanceToNow(new Date(post.createdAt))} ago
                                </div>
                            </div>
                        </Link>
                        {user?._id === post.author._id && (
                            <button onClick={handleDelete} style={{ color: 'var(--error)', padding: 'var(--spacing-sm)', fontSize: '0.85rem', fontWeight: '700' }}>
                                Delete
                            </button>
                        )}
                    </div>

                    {/* Caption */}
                    {post.caption && (
                        <div style={{
                            padding: 'var(--spacing-lg)',
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            borderBottom: '1px solid var(--border)'
                        }}>
                            {post.caption}
                        </div>
                    )}

                    {/* Comments Section */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: 'var(--spacing-lg)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-md)'
                    }}>
                        {comments.length > 0 ? (
                            comments.map((comment, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="glass"
                                    style={{
                                        padding: 'var(--spacing-md)',
                                        borderRadius: 'var(--radius-lg)',
                                        display: 'flex',
                                        gap: 'var(--spacing-sm)'
                                    }}
                                >
                                    <img
                                        src={comment.user?.profileImage || 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/v1/user_profile_default.png'}
                                        alt={comment.user?.username}
                                        style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '4px' }}>
                                            {comment.user?.username || 'user'}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                                            {comment.text}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                color: 'var(--text-tertiary)',
                                gap: 'var(--spacing-sm)'
                            }}>
                                <Sparkles size={48} style={{ opacity: 0.3 }} />
                                <p style={{ fontWeight: '600' }}>No comments yet</p>
                                <p style={{ fontSize: '0.9rem' }}>Be the first to comment!</p>
                            </div>
                        )}
                    </div>

                    {/* Comment Input */}
                    <form
                        onSubmit={handleComment}
                        className="glass"
                        style={{
                            borderTop: '1px solid var(--border)',
                            padding: 'var(--spacing-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            style={{
                                flex: 1,
                                border: 'none',
                                outline: 'none',
                                fontSize: '0.95rem',
                                background: 'transparent',
                                padding: '0'
                            }}
                        />
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="submit"
                            disabled={!commentText.trim()}
                            className="btn-primary"
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-lg)',
                                fontSize: '0.85rem',
                                opacity: commentText.trim() ? 1 : 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-xs)'
                            }}
                        >
                            <Send size={16} />
                            Send
                        </motion.button>
                    </form>
                </div>
            </motion.div>

            {/* Mobile Responsive Styles */}
            <style>{`
                @media (max-width: 1024px) {
                    [style*="gridTemplateColumns"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </motion.div>
    );
};

export default PostModal;
