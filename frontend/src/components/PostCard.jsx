import React from 'react';
import { createPortal } from 'react-dom';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from './VideoPlayer';

const PostCard = ({ post }) => {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = React.useState(post.likes?.includes(user?._id));
    const [likesCount, setLikesCount] = React.useState(post.likes?.length || 0);
    const [isSaved, setIsSaved] = React.useState(user?.savedPosts?.includes(post._id));
    const [showComments, setShowComments] = React.useState(false);
    const [commentText, setCommentText] = React.useState('');
    const [comments, setComments] = React.useState(post.comments || []);
    const [showHeartAnimation, setShowHeartAnimation] = React.useState(false);
    const [showOptions, setShowOptions] = React.useState(false);
    const [showCommentOverlay, setShowCommentOverlay] = React.useState(false);
    const [expandedMedia, setExpandedMedia] = React.useState(null);

    const handleSave = async () => {
        try {
            const res = await axios.post(`/posts/${post._id}/save`);
            setIsSaved(res.data.isSaved);
            toast.success(res.data.isSaved ? 'Post saved' : 'Post unsaved');
        } catch (err) {
            toast.error('Error saving post');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await axios.delete(`/posts/${post._id}`);
            toast.success('Post deleted');
            window.location.reload();
        } catch (err) {
            toast.error('Error deleting post');
        }
    };

    const handleLike = async () => {
        try {
            const res = await axios.post(`/posts/${post._id}/like`);
            setIsLiked(res.data.isLiked);
            setLikesCount(res.data.likesCount);
            if (res.data.isLiked) {
                setShowHeartAnimation(true);
                setTimeout(() => setShowHeartAnimation(false), 1000);
            }
        } catch (err) {
            toast.error('Error liking post');
        }
    };

    const toggleComments = () => {
        setShowCommentOverlay(!showCommentOverlay);
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

    const handleShare = async () => {
        const shareData = {
            title: 'ConnectX Post',
            text: post.caption || 'Check out this post on ConnectX!',
            url: window.location.origin
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    toast.error('Error sharing post');
                }
            }
        } else {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="card hover-lift"
            style={{
                padding: 0,
                overflow: 'hidden',
                marginBottom: 'var(--spacing-xl)',
                maxWidth: '100%',
                position: 'relative'
            }}
        >
            {/* Media Section with Overlay */}
            <div
                style={{
                    position: 'relative',
                    background: '#000',
                    borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                    overflow: 'hidden'
                }}
                onDoubleClick={handleLike}
            >
                {post.imageUrl ? (
                    post.mediaType === 'video' || post.imageUrl?.match(/\.(mp4|webm|avi|mov|mkv)$/i) ? (
                        <div onClick={() => setExpandedMedia({ type: 'video', url: post.imageUrl })} style={{ cursor: 'zoom-in' }}>
                            <VideoPlayer
                                src={post.imageUrl}
                                className="post-video"
                                forcePause={!!expandedMedia}
                            />
                        </div>
                    ) : (
                        <img
                            src={post.imageUrl}
                            alt="Post"
                            onClick={() => setExpandedMedia({ type: 'image', url: post.imageUrl })}
                            style={{
                                width: '100%',
                                display: 'block',
                                cursor: 'zoom-in',
                                minHeight: '350px',
                                maxHeight: '600px',
                                objectFit: 'cover',
                                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            className="post-image"
                        />
                    )
                ) : null}
                {/* Author Overlay at Bottom of Media */}
                <div className="overlay-bottom">
                    <Link
                        to={`/profile/${post.author.username}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            marginBottom: 'var(--spacing-sm)'
                        }}
                    >
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--gradient-primary)',
                            padding: '2px',
                            flexShrink: 0
                        }}>
                            <img
                                src={post.author.profileImage || 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/v1/user_profile_default.png'}
                                alt={post.author.username}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 'var(--radius-sm)',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                        <div>
                            <div style={{
                                fontWeight: '700',
                                fontSize: '1rem',
                                color: 'white',
                                fontFamily: 'var(--font-heading)'
                            }}>
                                {post.author.username}
                            </div>
                            {post.location && (
                                <div className="chip" style={{
                                    fontSize: '0.75rem',
                                    color: 'rgba(255,255,255,0.9)',
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    marginTop: '4px'
                                }}>
                                    📍 {post.location}
                                </div>
                            )}
                        </div>
                    </Link>
                </div>

                {/* Heart Animation */}
                <AnimatePresence>
                    {showHeartAnimation && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0] }}
                            transition={{ duration: 0.8 }}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 10
                            }}
                        >
                            <Heart size={120} color="white" fill="white" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Comment Overlay */}
                <AnimatePresence>
                    {showCommentOverlay && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="glass-heavy"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 100,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
                            }}
                        >
                            {/* Overlay Header */}
                            <div style={{
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'rgba(255,255,255,0.1)'
                            }}>
                                <span style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-main)' }}>COMMENTS</span>
                                <button
                                    onClick={() => setShowCommentOverlay(false)}
                                    style={{
                                        padding: '4px',
                                        borderRadius: '50%',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-main)',
                                        display: 'flex'
                                    }}
                                >
                                    <Sparkles size={16} /> {/* Using Sparkles as a placeholder for "close" or just UI flair, or use a proper X icon if available */}
                                </button>
                            </div>

                            {/* Comment List */}
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: 'var(--spacing-md)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--spacing-sm)'
                            }}>
                                {comments.length > 0 ? (
                                    comments.map((comment, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={idx}
                                            className="glass"
                                            style={{
                                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                                borderRadius: 'var(--radius-md)',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            <span style={{ fontWeight: '700', marginRight: '8px', color: 'var(--primary)' }}>
                                                {comment.user?.username || 'user'}
                                            </span>
                                            {comment.text}
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
                                        <MessageCircle size={32} opacity={0.3} />
                                        <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>No comments yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Comment Input inside Overlay */}
                            <form
                                onSubmit={handleComment}
                                style={{
                                    padding: 'var(--spacing-md)',
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    borderTop: '1px solid var(--border)',
                                    display: 'flex',
                                    gap: 'var(--spacing-sm)'
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    autoFocus
                                    style={{
                                        flex: 1,
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-full)',
                                        padding: '8px 16px',
                                        fontSize: '0.85rem',
                                        background: 'rgba(255,255,255,0.5)',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!commentText.trim()}
                                    className="btn-primary"
                                    style={{
                                        padding: 'var(--spacing-xs) var(--spacing-md)',
                                        fontSize: '0.8rem',
                                        borderRadius: 'var(--radius-full)'
                                    }}
                                >
                                    Post
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Options Menu */}
                <div style={{ position: 'absolute', top: 'var(--spacing-md)', right: 'var(--spacing-md)' }}>
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="glass"
                        style={{
                            padding: 'var(--spacing-sm)',
                            borderRadius: 'var(--radius-full)',
                            color: 'white',
                            backdropFilter: 'var(--glass-blur)'
                        }}
                    >
                        <MoreHorizontal size={20} />
                    </button>
                    <AnimatePresence>
                        {showOptions && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className="card glass-heavy"
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    marginTop: 'var(--spacing-sm)',
                                    zIndex: 100,
                                    padding: 'var(--spacing-sm)',
                                    minWidth: '180px',
                                    boxShadow: 'var(--shadow-lg)'
                                }}
                            >
                                {user?._id === post.author._id ? (
                                    <button
                                        onClick={handleDelete}
                                        style={{
                                            color: 'var(--error)',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: 'var(--spacing-sm)',
                                            fontSize: '0.9rem',
                                            fontWeight: '700',
                                            borderRadius: 'var(--radius-sm)'
                                        }}
                                    >
                                        Delete Post
                                    </button>
                                ) : (
                                    <button
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: 'var(--spacing-sm)',
                                            fontSize: '0.9rem',
                                            borderRadius: 'var(--radius-sm)'
                                        }}
                                    >
                                        Report
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content Section */}
            <div style={{ padding: 'var(--spacing-lg)' }}>
                {/* Caption */}
                {post.caption && (
                    <div style={{
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        marginBottom: 'var(--spacing-md)',
                        color: 'var(--text-main)'
                    }}>
                        {post.caption}
                    </div>
                )}

                {/* Action Pills */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--spacing-md)'
                }}>
                    {/* Left Actions */}
                    <div className="pill-container">
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={handleLike}
                            style={{
                                color: isLiked ? 'var(--error)' : 'var(--text-main)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Heart
                                size={22}
                                fill={isLiked ? 'var(--error)' : 'none'}
                                strokeWidth={isLiked ? 0 : 2}
                            />
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                                {likesCount}
                            </span>
                        </motion.button>

                        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={toggleComments}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: showCommentOverlay ? 'var(--primary)' : 'var(--text-main)'
                            }}
                        >
                            <MessageCircle size={22} fill={showCommentOverlay ? 'var(--primary)' : 'none'} />
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                                {comments.length}
                            </span>
                        </motion.button>

                        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={handleShare}
                            style={{ color: 'var(--text-main)' }}
                        >
                            <Share2 size={22} />
                        </motion.button>
                    </div>

                    {/* Save Button */}
                    <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={handleSave}
                        className="pill-container"
                        style={{
                            color: isSaved ? 'var(--primary)' : 'var(--text-main)',
                            padding: 'var(--spacing-sm) var(--spacing-md)'
                        }}
                    >
                        <Bookmark
                            size={22}
                            fill={isSaved ? 'var(--primary)' : 'none'}
                            strokeWidth={isSaved ? 0 : 2}
                        />
                    </motion.button>
                </div>

                {/* Timestamp */}
                <div style={{
                    color: 'var(--text-tertiary)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 'var(--spacing-md)'
                }}>
                    {formatDistanceToNow(new Date(post.createdAt))} ago
                </div>
            </div>

            {createPortal(
                <AnimatePresence>
                    {expandedMedia && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setExpandedMedia(null)}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                                zIndex: 10000,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'zoom-out',
                                padding: 'var(--spacing-xl)'
                            }}
                        >
                            {expandedMedia.type === 'image' ? (
                                <motion.img
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    src={expandedMedia.url}
                                    alt="Expanded"
                                    style={{
                                        maxWidth: '95%',
                                        maxHeight: '95vh',
                                        objectFit: 'contain',
                                        borderRadius: 'var(--radius-lg)',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    style={{
                                        width: '95%',
                                        maxWidth: '1200px',
                                        maxHeight: '90vh',
                                        borderRadius: 'var(--radius-lg)',
                                        overflow: 'hidden',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <VideoPlayer
                                        src={expandedMedia.url}
                                        autoPlay={true}
                                    />
                                </motion.div>
                            )}

                            <button
                                onClick={() => setExpandedMedia(null)}
                                style={{
                                    position: 'absolute',
                                    top: '30px',
                                    right: '30px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: 'none',
                                    color: 'white',
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </motion.div>
    );
};

export default PostCard;
