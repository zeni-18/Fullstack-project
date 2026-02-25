import React from 'react';
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
                {post.mediaType === 'video' || post.imageUrl?.match(/\.(mp4|webm|avi|mov|mkv)$/i) ? (
                    <VideoPlayer
                        src={post.imageUrl}
                        className="post-video"
                    />
                ) : (
                    <img
                        src={post.imageUrl}
                        alt="Post"
                        style={{
                            width: '100%',
                            display: 'block',
                            cursor: 'pointer',
                            minHeight: '350px',
                            maxHeight: '600px',
                            objectFit: 'cover'
                        }}
                    />
                )}

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
                            onClick={() => setShowComments(!showComments)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <MessageCircle size={22} />
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                                {comments.length}
                            </span>
                        </motion.button>

                        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

                        <motion.button whileTap={{ scale: 0.85 }}>
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

                {/* Comments Section */}
                {comments.length > 0 && (
                    <button
                        onClick={() => setShowComments(!showComments)}
                        style={{
                            color: 'var(--primary)',
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            marginBottom: showComments ? 'var(--spacing-md)' : 0
                        }}
                    >
                        {showComments ? 'Hide comments' : `View all ${comments.length} comments`}
                    </button>
                )}

                <AnimatePresence>
                    {showComments && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--spacing-md)',
                                marginTop: 'var(--spacing-md)'
                            }}>
                                {comments.map((comment, idx) => (
                                    <div
                                        key={idx}
                                        className="glass"
                                        style={{
                                            padding: 'var(--spacing-md)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <span style={{
                                            fontWeight: '700',
                                            marginRight: 'var(--spacing-sm)',
                                            color: 'var(--primary)'
                                        }}>
                                            {comment.user?.username || 'user'}
                                        </span>
                                        {comment.text}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Comment Input */}
            <form
                onSubmit={handleComment}
                className="glass"
                style={{
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                    borderRadius: '0 0 var(--radius-xl) var(--radius-xl)'
                }}
            >
                <input
                    type="text"
                    placeholder="Add a comment..."
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
                <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="btn-primary"
                    style={{
                        padding: 'var(--spacing-sm) var(--spacing-lg)',
                        fontSize: '0.85rem',
                        opacity: commentText.trim() ? 1 : 0.5
                    }}
                >
                    Post
                </button>
            </form>
        </motion.div>
    );
};

export default PostCard;
