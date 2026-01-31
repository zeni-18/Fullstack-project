import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';

const Notifications = () => {
    const { user: currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'Notifications • Blogger';
        const fetchNotifications = async () => {
            try {
                const res = await axios.get('/notifications');
                setNotifications(res.data);
                await axios.put('/notifications/read');
            } catch (err) {
                console.error('Error fetching notifications:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const getNotificationBadge = (type) => {
        switch (type) {
            case 'like': return <Heart size={14} fill="var(--error)" color="var(--error)" />;
            case 'comment': return <MessageCircle size={14} fill="var(--primary)" color="var(--primary)" />;
            case 'follow': return <UserPlus size={14} color="var(--success)" />;
            default: return null;
        }
    };

    const getNotificationText = (notif) => {
        const postDetail = notif.post?.caption ? ` "${notif.post.caption.substring(0, 20)}..."` : '';
        switch (notif.type) {
            case 'like': return `liked your post${postDetail}.`;
            case 'comment': return `commented on your post${postDetail}.`;
            case 'follow': return 'started following you.';
            default: return '';
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="App">
            <Navbar />
            <div className="container" style={{ paddingTop: '30px', maxWidth: '600px' }}>
                <div className="flex-between" style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Notifications</h2>
                    <Bell size={24} color="var(--text-secondary)" />
                </div>

                {loading ? (
                    <div className="flex column" style={{ gap: '20px' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex" style={{ gap: '16px', alignItems: 'center' }}>
                                <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }}></div>
                                <div className="flex column gap-xs" style={{ flex: 1 }}>
                                    <div className="skeleton" style={{ width: '70%', height: '12px' }}></div>
                                    <div className="skeleton" style={{ width: '30%', height: '10px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length > 0 ? (
                    <motion.div layout className="flex column">
                        {notifications.map((notif, idx) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={notif._id}
                                className="flex-between"
                                style={{
                                    padding: '16px 0',
                                    borderBottom: '1px solid var(--border)',
                                    alignItems: 'center'
                                }}
                            >
                                <div className="flex" style={{ gap: '16px', alignItems: 'center' }}>
                                    <div style={{ position: 'relative' }}>
                                        <Link to={`/profile/${notif.sender.username}`}>
                                            <img
                                                src={notif.sender.profileImage || 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/v1/user_profile_default.png'}
                                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                                                alt={notif.sender.username}
                                            />
                                        </Link>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-2px',
                                            right: '-2px',
                                            backgroundColor: 'var(--card-bg)',
                                            borderRadius: '50%',
                                            padding: '4px',
                                            boxShadow: 'var(--shadow-sm)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {getNotificationBadge(notif.type)}
                                        </div>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                                            <Link to={`/profile/${notif.sender.username}`} style={{ fontWeight: '700' }}>
                                                {notif.sender.username}
                                            </Link>{' '}
                                            <span style={{ color: 'var(--text-main)' }}>{getNotificationText(notif)}</span>
                                        </p>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
                                            {formatDistanceToNow(new Date(notif.createdAt))} ago
                                        </p>
                                    </div>
                                </div>

                                {notif.post && (
                                    <motion.div whileHover={{ scale: 1.05 }}>
                                        <Link to={`/profile/${currentUser?.username}`}>
                                            <img
                                                src={notif.post.imageUrl}
                                                style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                                alt="post notification"
                                            />
                                        </Link>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="card flex-center column" style={{ padding: '60px var(--spacing-md)', textAlign: 'center', borderStyle: 'dotted' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>📭</div>
                        <h3 style={{ marginBottom: '8px' }}>No notifications yet</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>When people interact with you, it'll show up here.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Notifications;
