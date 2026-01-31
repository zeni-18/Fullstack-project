import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const { user } = useAuth();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await axios.get('/users/suggestions');
                setSuggestions(res.data);
            } catch (err) {
                console.error('Error fetching suggestions:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchSuggestions();
    }, [user]);

    if (!user) return null;

    return (
        <div style={{ width: '320px', padding: '10px 0' }}>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-between"
                style={{ marginBottom: '24px' }}
            >
                <div className="flex" style={{ gap: '16px', alignItems: 'center' }}>
                    <Link to={`/profile/${user.username}`}>
                        <img
                            src={user.profileImage || 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/v1/user_profile_default.png'}
                            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                            alt="me"
                        />
                    </Link>
                    <div>
                        <Link to={`/profile/${user.username}`}>
                            <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{user.username}</p>
                        </Link>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.fullName}</p>
                    </div>
                </div>
                <button style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.8rem' }}>Switch</button>
            </motion.div>

            <div className="flex-between" style={{ marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.9rem' }}>Suggestions for you</span>
                <button style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-main)' }}>See All</button>
            </div>

            <div className="flex column" style={{ gap: '16px' }}>
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="flex" style={{ gap: '12px', alignItems: 'center' }}>
                            <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
                            <div className="flex column gap-xs" style={{ flex: 1 }}>
                                <div className="skeleton" style={{ width: '60%', height: '10px' }}></div>
                                <div className="skeleton" style={{ width: '40%', height: '8px' }}></div>
                            </div>
                        </div>
                    ))
                ) : (
                    suggestions.map((sug, idx) => (
                        <motion.div
                            key={sug._id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex-between"
                            style={{ alignItems: 'center' }}
                        >
                            <div className="flex" style={{ gap: '12px', alignItems: 'center' }}>
                                <Link to={`/profile/${sug.username}`}>
                                    <img
                                        src={sug.profileImage || 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/v1/user_profile_default.png'}
                                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                                        alt="suggestion"
                                    />
                                </Link>
                                <div>
                                    <Link to={`/profile/${sug.username}`}>
                                        <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{sug.username}</p>
                                    </Link>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Suggested for you</p>
                                </div>
                            </div>
                            <button style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.8rem' }}>Follow</button>
                        </motion.div>
                    ))
                )}
            </div>

            <div style={{ marginTop: '40px', color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: '1.6' }}>
                <p style={{ wordSpacing: '4px' }}>
                    About • Help • Press • API • Jobs • Privacy • Terms • Locations • Language
                </p>
                <p style={{ marginTop: '16px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>
                    © 2026 Blogger
                </p>
            </div>
        </div>
    );
};

export default Sidebar;
