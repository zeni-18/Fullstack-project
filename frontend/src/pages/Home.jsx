import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { motion } from 'framer-motion';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
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
        document.title = 'Blogger';
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/posts/feed?page=${page}&limit=5`);
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
    }, [page]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="App"
        >
            <Navbar />
            <div className="container" style={{ display: 'flex', gap: '40px', justifyContent: 'center', paddingTop: '32px' }}>
                <div style={{ width: '100%', maxWidth: '470px' }}>
                    <div className="flex column">
                        {posts.map((post, index) => (
                            <div ref={posts.length === index + 1 ? lastPostElementRef : null} key={post._id}>
                                <PostCard post={post} />
                            </div>
                        ))}
                    </div>

                    {loading && (
                        <div className="flex column" style={{ gap: '20px', paddingBottom: '20px' }}>
                            <PostSkeleton />
                            <PostSkeleton />
                        </div>
                    )}

                    {!loading && posts.length === 0 && (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="card flex-center column"
                            style={{ padding: 'var(--spacing-xl)', textAlign: 'center', borderStyle: 'dashed' }}
                        >
                            <h2 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>Welcome to Blogger</h2>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
                                Your feed is empty. Follow some creative people to see their latest updates!
                            </p>
                        </motion.div>
                    )}
                </div>

                <div className="desktop-sidebar" style={{ display: 'none', position: 'sticky', top: '96px', height: 'fit-content' }}>
                    <Sidebar />
                </div>
            </div>
            <style>{`
                @media (min-width: 1000px) {
                  .desktop-sidebar {
                    display: block !important;
                  }
                }
            `}</style>
        </motion.div>
    );
};

export default Home;
