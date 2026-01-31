import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card"
            style={{
                padding: 0,
                overflow: 'hidden',
                marginBottom: 'var(--spacing-lg)',
                maxWidth: '100%',
                backgroundColor: 'var(--card-bg)'
            }}
        >
            <div style={{ padding: 'var(--spacing-sm) var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to={`/profile/${post.author.username}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        padding: '2px',
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                    }}>
                        <img
                            src={post.author.profileImage || 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/v1/user_profile_default.png'}
                            alt={post.author.username}
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--card-bg)' }}
                        />
                    </div>
                    <div className="flex column">
                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{post.author.username}</span>
                        {post.location && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{post.location}</span>}
                    </div>
                </Link>

                <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowOptions(!showOptions)} style={{ padding: '8px', color: 'var(--text-secondary)' }}>
                        <MoreHorizontal size={20} />
                    </button>
                    <AnimatePresence>
                        {showOptions && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className="card glass"
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    zIndex: 100,
                                    padding: '8px',
                                    width: '160px',
                                    boxShadow: 'var(--shadow-md)'
                                }}
                            >
                                {user?._id === post.author._id ? (
                                    <button onClick={handleDelete} style={{ color: 'var(--error)', width: '100%', textAlign: 'left', padding: '10px', fontSize: '0.9rem', fontWeight: '600' }}>
                                        Delete Post
                                    </button>
                                ) : (
                                    <button style={{ width: '100%', textAlign: 'left', padding: '10px', fontSize: '0.9rem' }}>
                                        Report
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div style={{ position: 'relative', background: 'var(--border)' }} onDoubleClick={handleLike}>
                <img
                    src={post.imageUrl}
                    alt="Post"
                    style={{ width: '100%', display: 'block', cursor: 'pointer', minHeight: '300px', objectFit: 'contain' }}
                />
                <AnimatePresence>
                    {showHeartAnimation && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
                            transition={{ duration: 0.8 }}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 10
                            }}
                        >
                            <Heart size={100} color="white" fill="white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={{ padding: 'var(--spacing-md)' }}>
                <div className="flex-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <div className="flex" style={{ gap: 'var(--spacing-md)' }}>
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={handleLike}
                            style={{ color: isLiked ? 'var(--error)' : 'inherit' }}
                        >
                            <Heart size={26} fill={isLiked ? 'var(--error)' : 'none'} strokeWidth={isLiked ? 0 : 2} />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.8 }} onClick={() => setShowComments(!showComments)}>
                            <MessageCircle size={26} />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.8 }}>
                            <Share2 size={26} />
                        </motion.button>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={handleSave}
                        style={{ color: isSaved ? 'var(--text-main)' : 'inherit' }}
                    >
                        <Bookmark size={26} fill={isSaved ? 'var(--text-main)' : 'none'} strokeWidth={isSaved ? 0 : 2} />
                    </motion.button>
                </div>

                <div style={{ fontWeight: '700', marginBottom: '8px', fontSize: '0.95rem' }}>
                    {likesCount.toLocaleString()} likes
                </div>

                <div style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                    <span style={{ fontWeight: '700', marginRight: '8px' }}>{post.author.username}</span>
                    {post.caption}
                </div>

                {comments.length > 0 && (
                    <button
                        onClick={() => setShowComments(!showComments)}
                        style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px', fontWeight: '500' }}
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
                            style={{ overflow: 'hidden', marginTop: '12px' }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '4px' }}>
                                {comments.map((comment, idx) => (
                                    <div key={idx} style={{ fontSize: '0.9rem' }}>
                                        <span style={{ fontWeight: '700', marginRight: '8px' }}>{comment.user?.username || 'user'}</span>
                                        {comment.text}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                    {formatDistanceToNow(new Date(post.createdAt))} ago
                </div>
            </div>

            <form onSubmit={handleComment} style={{ borderTop: '1px solid var(--border)', display: 'flex', padding: '12px 16px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', background: 'transparent' }}
                />
                <button
                    type="submit"
                    disabled={!commentText.trim()}
                    style={{
                        color: 'var(--primary)',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        opacity: commentText.trim() ? 1 : 0.4,
                        padding: '4px 8px'
                    }}
                >
                    Post
                </button>
            </form>
        </motion.div>
    );
};

export default PostCard;
