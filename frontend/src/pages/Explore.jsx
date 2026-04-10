import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Search as SearchIcon, Sparkles, TrendingUp, Grid3x3, X, Play } from 'lucide-react';
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
        document.title = 'Explore • ConnectX';
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className=""
        >
            <Navbar />
            <div className="page-content">
                {/* Header Section */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{ marginBottom: 'var(--spacing-xl)' }}
                >
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '900',
                        marginBottom: 'var(--spacing-sm)',
                        background: 'var(--gradient-accent)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)'
                    }}>
                        <Grid3x3 size={36} style={{ color: 'var(--accent)' }} />
                        Explore
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.1rem',
                        fontWeight: '500'
                    }}>
                        Discover trending content and creative minds
                    </p>
                </motion.div>

                {/* Search Bar */}
                <div style={{ position: 'relative', maxWidth: '700px', margin: '0 0 var(--spacing-xl) 0' }}>
                    <div className="glass-heavy" style={{
                        position: 'relative',
                        borderRadius: 'var(--radius-full)',
                        padding: '4px',
                        boxShadow: 'var(--shadow-md)'
                    }}>
                        <SearchIcon
                            size={20}
                            style={{
                                position: 'absolute',
                                left: 'var(--spacing-lg)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-secondary)',
                                zIndex: 1
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search creative people or #tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-md) var(--spacing-lg) var(--spacing-md) 56px',
                                borderRadius: 'var(--radius-full)',
                                border: '2px solid var(--glass-border)',
                                backgroundColor: 'transparent',
                                outline: 'none',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                fontWeight: '500'
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                style={{
                                    position: 'absolute',
                                    right: 'var(--spacing-md)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    padding: 'var(--spacing-xs)',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-secondary)'
                                }}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                        {searchQuery.length >= 2 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="card glass-heavy"
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    zIndex: 10,
                                    marginTop: 'var(--spacing-sm)',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    padding: 'var(--spacing-sm)',
                                    boxShadow: 'var(--shadow-xl)'
                                }}
                            >
                                {isSearching ? (
                                    <div className="flex-center" style={{ padding: 'var(--spacing-xl)' }}>
                                        <div className="spinner"></div>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(item => (
                                        <Link
                                            to={searchQuery.startsWith('#') ? `/explore` : `/profile/${item.username}`}
                                            key={item._id}
                                            className="flex"
                                            style={{
                                                gap: 'var(--spacing-md)',
                                                padding: 'var(--spacing-md)',
                                                alignItems: 'center',
                                                borderRadius: 'var(--radius-md)',
                                                transition: 'all var(--transition-fast)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                                                e.currentTarget.style.transform = 'translateX(4px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.transform = 'translateX(0)';
                                            }}
                                            onClick={() => {
                                                if (searchQuery.startsWith('#')) {
                                                    fetchExplorePosts(searchQuery.substring(1));
                                                }
                                                setSearchQuery('');
                                            }}
                                        >
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: searchQuery.startsWith('#') ? 'var(--radius-md)' : 'var(--radius-full)',
                                                background: 'var(--gradient-primary)',
                                                padding: '2px',
                                                flexShrink: 0
                                            }}>
                                                <img
                                                    src={searchQuery.startsWith('#') ? item.imageUrl : item.profileImage}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        borderRadius: searchQuery.startsWith('#') ? 'var(--radius-sm)' : 'var(--radius-full)',
                                                        objectFit: 'cover'
                                                    }}
                                                    alt="search result"
                                                />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '700', fontSize: '0.95rem', fontFamily: 'var(--font-heading)' }}>
                                                    {searchQuery.startsWith('#') ? `#${searchQuery.substring(1)}` : item.username}
                                                </p>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {searchQuery.startsWith('#') ? 'Explore Tag' : item.fullName}
                                                </p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div style={{
                                        padding: 'var(--spacing-xl)',
                                        textAlign: 'center',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        <Sparkles size={32} style={{ opacity: 0.3, marginBottom: 'var(--spacing-sm)' }} />
                                        <p style={{ fontWeight: '600' }}>No results found</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Active Tag Filter */}
                {activeTag && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass"
                        style={{
                            marginBottom: 'var(--spacing-xl)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-md)',
                            padding: 'var(--spacing-md) var(--spacing-lg)',
                            borderRadius: 'var(--radius-full)'
                        }}
                    >
                        <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
                            #{activeTag}
                        </h2>
                        <button
                            onClick={() => fetchExplorePosts(null)}
                            className="btn-ghost"
                            style={{
                                padding: 'var(--spacing-xs) var(--spacing-md)',
                                fontSize: '0.85rem',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: '700'
                            }}
                        >
                            Clear
                        </button>
                    </motion.div>
                )}

                {/* Posts Grid */}
                {loading ? (
                    <div className="flex-center" style={{ height: '50vh' }}>
                        <div className="spinner"></div>
                    </div>
                ) : posts.length > 0 ? (
                    <motion.div
                        layout
                        className="bento-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: 'var(--spacing-lg)'
                        }}
                    >
                        {posts.map((post, index) => (
                            <motion.div
                                key={post._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -8 }}
                                className="bento-item"
                            >
                                <Link
                                    to={`/profile/${post.author.username}`}
                                    style={{
                                        display: 'block',
                                        aspectRatio: '1/1',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        borderRadius: 'var(--radius-xl)',
                                        boxShadow: 'var(--shadow-md)',
                                        transition: 'all var(--transition-base)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = 'var(--shadow-lg), var(--shadow-glow)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    }}
                                >
                                    {post.imageUrl ? (
                                        post.mediaType === 'video' || post.imageUrl?.match(/\.(mp4|webm|avi|mov|mkv)$/i) ? (
                                            <>
                                                <video
                                                    src={post.imageUrl}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: 'rgba(0,0,0,0.7)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    padding: '4px 8px',
                                                    backdropFilter: 'blur(8px)'
                                                }}>
                                                    <Play size={16} color="white" fill="white" />
                                                </div>
                                            </>
                                        ) : (
                                            <img
                                                src={post.imageUrl}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                                alt="explore post"
                                            />
                                        )
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                                            <Sparkles size={24} color="var(--text-tertiary)" />
                                        </div>
                                    )}
                                    <div className="explore-overlay">
                                        <div className="pill-container" style={{
                                            color: 'white',
                                            fontWeight: '700',
                                            fontSize: '0.9rem',
                                            backdropFilter: 'var(--glass-blur)',
                                            background: 'rgba(0,0,0,0.6)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Heart size={18} fill="white" strokeWidth={0} />
                                                {post.likes.length}
                                            </div>
                                            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.3)' }} />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <MessageCircle size={18} fill="white" strokeWidth={0} />
                                                {post.comments.length}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="card glass-heavy"
                        style={{
                            padding: 'var(--spacing-2xl)',
                            textAlign: 'center',
                            borderStyle: 'dashed',
                            borderWidth: '2px',
                            maxWidth: '700px',
                            margin: '0'
                        }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--gradient-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto var(--spacing-lg)',
                            boxShadow: 'var(--shadow-glow-accent)'
                        }}>
                            <Grid3x3 size={40} color="white" />
                        </div>
                        <h2 style={{
                            marginBottom: 'var(--spacing-md)',
                            fontSize: '1.75rem',
                            fontWeight: '800',
                            textAlign: 'center'
                        }}>
                            No Posts Found
                        </h2>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1.05rem',
                            lineHeight: '1.6'
                        }}>
                            {activeTag
                                ? `No posts found with #${activeTag}. Try searching for something else!`
                                : 'No posts to explore yet. Check back later for amazing content!'}
                        </p>
                    </motion.div>
                )}
            </div>
            <style>{`
                .explore-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
                    display: flex; 
                    align-items: flex-end; 
                    justify-content: center;
                    padding: var(--spacing-lg);
                    opacity: 0;
                    transition: opacity var(--transition-base);
                }
                a:hover .explore-overlay { opacity: 1; }
            `}</style>
        </motion.div >
    );
};

export default Explore;
