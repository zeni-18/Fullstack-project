import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState('foryou'); // 'foryou' or 'following'
    const observer = useRef();

    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        setPosts([]);
        setPage(1);
        setHasMore(true);
    }, [activeTab]);

    useEffect(() => {
        document.title = 'ConnectX - Discover Amazing Content';
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/posts/feed?page=${page}&limit=5&tab=${activeTab}`);
                setPosts(prevPosts => {
                    const newPosts = res.data.filter(np => !prevPosts.find(p => p._id === np._id));
                    return [...prevPosts, ...newPosts];
                });
                setHasMore(res.data.length === 5);
            } catch (err) {
                console.error('Error fetching feed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [page, activeTab]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <Navbar />

            <div className="page-content-centered">
                {/* Header Section */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}
                >
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '900',
                        marginBottom: 'var(--spacing-sm)',
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)'
                    }}>
                        <Sparkles size={36} style={{ color: 'var(--primary)' }} />
                        Discover
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.1rem',
                        fontWeight: '500'
                    }}>
                        Explore amazing content from creative minds
                    </p>
                </motion.div>

                {/* Tab Switcher */}
                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass"
                    style={{
                        display: 'inline-flex',
                        padding: '6px',
                        borderRadius: 'var(--radius-full)',
                        marginBottom: 'var(--spacing-xl)',
                        gap: '6px'
                    }}
                >
                    <button
                        onClick={() => setActiveTab('foryou')}
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-lg)',
                            borderRadius: 'var(--radius-full)',
                            background: activeTab === 'foryou' ? 'var(--gradient-primary)' : 'transparent',
                            color: activeTab === 'foryou' ? 'white' : 'var(--text-main)',
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            fontFamily: 'var(--font-heading)',
                            transition: 'all var(--transition-base)',
                            boxShadow: activeTab === 'foryou' ? 'var(--shadow-glow)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-xs)'
                        }}
                    >
                        <Sparkles size={16} />
                        For You
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-lg)',
                            borderRadius: 'var(--radius-full)',
                            background: activeTab === 'following' ? 'var(--gradient-primary)' : 'transparent',
                            color: activeTab === 'following' ? 'white' : 'var(--text-main)',
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            fontFamily: 'var(--font-heading)',
                            transition: 'all var(--transition-base)',
                            boxShadow: activeTab === 'following' ? 'var(--shadow-glow)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-xs)'
                        }}
                    >
                        <TrendingUp size={16} />
                        Following
                    </button>
                </motion.div>

                {/* Main Content Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 'var(--spacing-xl)',
                    width: '100%',
                    maxWidth: '680px'
                }}>
                    {/* Posts Feed */}
                    <div>
                        {posts.map((post, index) => (
                            <div ref={posts.length === index + 1 ? lastPostElementRef : null} key={post._id}>
                                <PostCard post={post} />
                            </div>
                        ))}

                        {loading && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                                <PostSkeleton />
                                <PostSkeleton />
                            </div>
                        )}

                        {!loading && posts.length === 0 && (
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="card glass-heavy"
                                style={{
                                    padding: 'var(--spacing-2xl)',
                                    textAlign: 'center',
                                    borderStyle: 'dashed',
                                    borderWidth: '2px'
                                }}
                            >
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto var(--spacing-lg)',
                                    boxShadow: 'var(--shadow-glow)'
                                }}>
                                    <Sparkles size={40} color="white" />
                                </div>
                                <h2 style={{
                                    marginBottom: 'var(--spacing-md)',
                                    fontSize: '1.75rem',
                                    fontWeight: '800'
                                }}>
                                    Welcome to ConnectX
                                </h2>
                                <p style={{
                                    color: 'var(--text-secondary)',
                                    maxWidth: '400px',
                                    margin: '0 auto',
                                    fontSize: '1.05rem',
                                    lineHeight: '1.6'
                                }}>
                                    Your feed is empty. Follow some creative people to see their latest updates and start discovering amazing content!
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Home;
