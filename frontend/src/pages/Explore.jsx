import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Search as SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [activeTag, setActiveTag] = useState(null);

    const fetchExplorePosts = async (tag = null) => {
        setLoading(true);
        try {
            const endpoint = tag ? `/posts/search?tag=${tag}` : '/posts/explore';
            const res = await axios.get(endpoint);
            setPosts(res.data);
            setActiveTag(tag);
        } catch (err) {
            console.error('Error fetching explore posts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Explore • Blogger';
        fetchExplorePosts();
    }, []);

    useEffect(() => {
        const handleSearch = async () => {
            if (searchQuery.length < 1) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                let endpoint = `/users/search?q=${searchQuery}`;
                if (searchQuery.startsWith('#')) {
                    endpoint = `/posts/search?tag=${searchQuery.substring(1)}`;
                }
                const res = await axios.get(endpoint);
                setSearchResults(res.data);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(handleSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="App">
            <Navbar />
            <div className="container" style={{ paddingTop: '30px' }}>
                <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto 40px auto' }}>
                    <div style={{ position: 'relative' }}>
                        <SearchIcon
                            size={18}
                            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
                        />
                        <input
                            type="text"
                            placeholder="Search creative people or #tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 16px 14px 48px',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--card-bg)',
                                outline: 'none',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        />
                    </div>

                    <AnimatePresence>
                        {searchQuery.length >= 2 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="card glass"
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    zIndex: 10,
                                    marginTop: '8px',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    padding: '8px',
                                    boxShadow: 'var(--shadow-lg)'
                                }}
                            >
                                {isSearching ? (
                                    <div className="flex-center" style={{ padding: '20px' }}>
                                        <div className="spinner"></div>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(item => (
                                        <Link
                                            to={searchQuery.startsWith('#') ? `/explore` : `/profile/${item.username}`}
                                            key={item._id}
                                            className="flex"
                                            style={{
                                                gap: '12px',
                                                padding: '12px',
                                                alignItems: 'center',
                                                borderRadius: 'var(--radius-sm)',
                                                transition: 'background 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            onClick={() => {
                                                if (searchQuery.startsWith('#')) {
                                                    fetchExplorePosts(searchQuery.substring(1));
                                                }
                                                setSearchQuery('');
                                            }}
                                        >
                                            <img
                                                src={searchQuery.startsWith('#') ? item.imageUrl : item.profileImage}
                                                style={{ width: '44px', height: '44px', borderRadius: searchQuery.startsWith('#') ? '8px' : '50%', objectFit: 'cover' }}
                                                alt="search result"
                                            />
                                            <div>
                                                <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{searchQuery.startsWith('#') ? `#${searchQuery.substring(1)}` : item.username}</p>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {searchQuery.startsWith('#') ? 'Explore Tag' : item.fullName}
                                                </p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No results found.</p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {activeTag && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>#{activeTag}</h2>
                        <button
                            onClick={() => fetchExplorePosts(null)}
                            style={{
                                color: 'var(--primary)',
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                padding: '4px 12px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)'
                            }}
                        >
                            Reset
                        </button>
                    </motion.div>
                )}

                {loading ? (
                    <div className="flex-center" style={{ height: '40vh' }}>
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <motion.div
                        layout
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}
                    >
                        {posts.map(post => (
                            <Link to={`/profile/${post.author.username}`} key={post._id} style={{ aspectRatio: '1/1', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.4 }}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    <img src={post.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="explore post" />
                                    <div className="explore-overlay">
                                        <div className="flex" style={{ gap: '20px', color: 'white', fontWeight: '800' }}>
                                            <div className="flex align-center gap-xs"><Heart size={20} fill="white" strokeWidth={0} /> {post.likes.length}</div>
                                            <div className="flex align-center gap-xs"><MessageCircle size={20} fill="white" strokeWidth={0} /> {post.comments.length}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </div>
            <style>{`
                .explore-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.3);
                    display: flex; align-items: center; justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                a:hover .explore-overlay { opacity: 1; }
            `}</style>
        </motion.div>
    );
};

export default Explore;
