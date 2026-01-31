import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Settings, Grid, Bookmark, Tag, Heart, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import EditProfile from '../components/EditProfile';

const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [taggedPosts, setTaggedPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const userRes = await axios.get(`/users/username/${username}`);
                const userProfile = userRes.data;
                setProfile(userProfile);
                setIsFollowing(userProfile.followers.some(f => f._id === currentUser?._id || f === currentUser?._id));

                const postsRes = await axios.get(`/users/${userProfile._id}/posts`);
                setPosts(postsRes.data);

                if (currentUser?._id === userProfile._id) {
                    const savedRes = await axios.get(`/users/${userProfile._id}/saved`);
                    setSavedPosts(savedRes.data);
                }

                const taggedRes = await axios.get(`/posts/search?tag=${userProfile.username}`);
                setTaggedPosts(taggedRes.data);
            } catch (err) {
                toast.error('User not found');
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [username, currentUser]);

    useEffect(() => {
        if (profile) {
            document.title = `@${profile.username} • Blogger`;
        }
    }, [profile]);

    const handleFollow = async () => {
        try {
            const res = await axios.post(`/users/${profile._id}/follow`);
            setProfile(res.data);
            setIsFollowing(res.data.followers.some(f => f._id === currentUser?._id || f === currentUser?._id));
        } catch (err) {
            toast.error('Error following user');
        }
    };

    if (loading) return (
        <>
            <Navbar />
            <div className="container flex-center" style={{ height: '80vh' }}><div className="spinner"></div></div>
        </>
    );
    if (!profile) return (
        <div className="flex-center column" style={{ height: '100vh', gap: '20px' }}>
            <h2>User not found</h2>
            <button className="btn-primary" onClick={() => navigate('/')}>Go Home</button>
        </div>
    );

    const isOwnProfile = currentUser?._id === profile?._id;
    let displayedPosts = [];
    if (activeTab === 'posts') displayedPosts = posts;
    else if (activeTab === 'saved') displayedPosts = savedPosts;
    else if (activeTab === 'tagged') displayedPosts = taggedPosts;

    const tabs = [
        { id: 'posts', label: 'POSTS', icon: Grid },
        ...(isOwnProfile ? [{ id: 'saved', label: 'SAVED', icon: Bookmark }] : []),
        { id: 'tagged', label: 'TAGGED', icon: Tag }
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="App">
            <Navbar />
            <div className="container" style={{ paddingTop: '30px' }}>
                <div className="flex" style={{ gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)', alignItems: 'flex-start' }}>
                    <div style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        flexShrink: 0
                    }}>
                        <img src={profile.profileImage || 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/v1/user_profile_default.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="profile" />
                    </div>

                    <div className="flex column" style={{ gap: 'var(--spacing-md)', flex: 1, paddingTop: '10px' }}>
                        <div className="flex" style={{ gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '400', fontFamily: 'var(--font-body)' }}>{profile.username}</h2>
                            <div className="flex" style={{ gap: '12px' }}>
                                {isOwnProfile ? (
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="card"
                                        style={{ padding: '6px 16px', fontWeight: '600', fontSize: '0.9rem' }}
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleFollow}
                                        className={isFollowing ? 'card' : 'btn-primary'}
                                        style={{ padding: '6px 20px', fontSize: '0.9rem' }}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                )}
                                {isOwnProfile && (
                                    <button onClick={() => navigate('/settings')} style={{ color: 'var(--text-main)' }}>
                                        <Settings size={24} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex" style={{ gap: '40px' }}>
                            <span style={{ fontSize: '1.05rem' }}><strong>{posts.length}</strong> posts</span>
                            <span style={{ fontSize: '1.05rem' }}><strong>{profile.followers.length}</strong> followers</span>
                            <span style={{ fontSize: '1.05rem' }}><strong>{profile.following.length}</strong> following</span>
                        </div>

                        <div style={{ marginTop: '4px' }}>
                            <p style={{ fontWeight: '700', fontSize: '1rem' }}>{profile.fullName}</p>
                            <p style={{ whiteSpace: 'pre-wrap', marginTop: '4px', maxWidth: '400px' }}>{profile.bio}</p>
                        </div>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '60px'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '16px 0',
                                borderTop: activeTab === tab.id ? '1.5px solid var(--text-main)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-secondary)',
                                marginTop: '-1px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                letterSpacing: '0.1em'
                            }}
                        >
                            <tab.icon size={14} strokeWidth={activeTab === tab.id ? 2.5 : 2} /> {tab.label}
                        </button>
                    ))}
                </div>

                <motion.div
                    layout
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '24px',
                        marginTop: '24px',
                        paddingBottom: '40px'
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        {displayedPosts.length > 0 ? (
                            displayedPosts.map(post => (
                                <motion.div
                                    key={post._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ scale: 1.02 }}
                                    style={{
                                        aspectRatio: '1/1',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        backgroundColor: 'var(--border)'
                                    }}
                                >
                                    <img
                                        src={post.imageUrl}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        alt="grid-post"
                                    />
                                    <div className="grid-overlay">
                                        <div className="flex-center" style={{ gap: '20px', color: 'white', fontWeight: '800' }}>
                                            <span className="flex gap-xs" style={{ alignItems: 'center' }}><Heart fill="white" size={20} /> {post.likes?.length || 0}</span>
                                            <span className="flex gap-xs" style={{ alignItems: 'center' }}><MessageCircle fill="white" size={20} /> {post.comments?.length || 0}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex-center" style={{ gridColumn: '1 / -1', padding: '60px', color: 'var(--text-secondary)' }}>
                                <div className="flex column flex-center gap-sm">
                                    <Grid size={48} strokeWidth={1} />
                                    <p>No posts added yet</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {isEditModalOpen && (
                <EditProfile
                    onClose={() => setIsEditModalOpen(false)}
                    onProfileUpdated={(updatedUser) => setProfile({ ...profile, ...updatedUser })}
                />
            )}
            <style>{`
                .grid-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.4);
                    opacity: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: opacity 0.2s ease;
                }
                .grid-overlay:hover {
                    opacity: 1;
                }
            `}</style>
        </motion.div>
    );
};

export default Profile;
