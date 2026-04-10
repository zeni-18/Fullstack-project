import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Home, Search, PlusSquare, Heart, User, LogOut, Moon, Sun, Compass, Sparkles, Settings, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreatePost from './CreatePost';
import axios from 'axios';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (!user) return;
            try {
                const res = await axios.get('/notifications');
                const count = res.data.filter(n => !n.isRead).length;
                setUnreadCount(count);
            } catch (err) {
                console.error('Error fetching unread count:', err);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { icon: Home, path: '/', title: 'Home', label: 'Home' },
        { icon: Compass, path: '/explore', title: 'Explore', label: 'Explore' },
        { icon: Heart, path: '/notifications', title: 'Notifications', label: 'Notifications', badge: unreadCount },
        { icon: MessageSquare, path: '/messages', title: 'Messages', label: 'Messages' },
        { icon: User, path: `/profile/${user?.username}`, title: 'Profile', label: 'Profile' },
    ];

    if (!user) return null;

    return (
        <>
            {/* Vertical Sidebar */}
            <motion.nav
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                className="glass-heavy"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: isCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 'var(--spacing-lg)',
                    borderRight: '1px solid var(--glass-border)',
                    transition: 'width var(--transition-base)',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                {/* Logo Section */}
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                    marginBottom: 'var(--spacing-2xl)',
                    padding: 'var(--spacing-sm) 0'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-glow)',
                        flexShrink: 0
                    }}>
                        <Sparkles size={28} color="white" strokeWidth={2.5} />
                    </div>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontWeight: '900',
                                fontSize: '1.75rem',
                                background: 'var(--gradient-primary)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                letterSpacing: '-0.04em'
                            }}
                        >
                            ConnectX
                        </motion.div>
                    )}
                </Link>

                {/* Navigation Items */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-sm)'
                }}>
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            title={item.title}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-md)',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-lg)',
                                background: isActive(item.path)
                                    ? 'var(--gradient-primary)'
                                    : 'transparent',
                                color: isActive(item.path) ? 'white' : 'var(--text-main)',
                                transition: 'all var(--transition-base)',
                                position: 'relative',
                                fontWeight: isActive(item.path) ? '700' : '500',
                                fontSize: '0.95rem',
                                fontFamily: 'var(--font-heading)',
                                boxShadow: isActive(item.path) ? 'var(--shadow-glow)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.background = 'var(--bg-secondary)';
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }
                            }}
                        >
                            <item.icon
                                size={24}
                                strokeWidth={isActive(item.path) ? 2.5 : 2}
                            />
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {item.label}
                                </motion.span>
                            )}
                            {item.badge > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    backgroundColor: 'var(--error)',
                                    color: 'white',
                                    borderRadius: 'var(--radius-full)',
                                    minWidth: '20px',
                                    height: '20px',
                                    fontSize: '0.7rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    padding: '0 6px',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    {item.badge > 9 ? '9+' : item.badge}
                                </div>
                            )}
                        </Link>
                    ))}

                    {/* Create Post Button */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary"
                        style={{
                            marginTop: 'var(--spacing-md)',
                            width: '100%',
                            justifyContent: 'center',
                            padding: 'var(--spacing-md)',
                            fontSize: '0.95rem'
                        }}
                    >
                        <PlusSquare size={20} />
                        {!isCollapsed && <span>Create Post</span>}
                    </button>
                </div>

                {/* Bottom Section */}
                <div style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: 'var(--spacing-lg)',
                    paddingBottom: 'var(--spacing-xl)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-sm)'
                }}>
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        title="Toggle Theme"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-md)',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--bg-secondary)',
                            width: '100%',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}
                    >
                        {isDarkMode ? <Sun size={20} color="white" /> : <Moon size={20} />}
                        {!isCollapsed && <span style={{ color: isDarkMode ? 'white' : 'var(--text-main)' }}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button>

                    {/* User Profile */}
                    <Link
                        to={`/profile/${user?.username}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-md)',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--bg-secondary)',
                            transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--bg-secondary)';
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--gradient-primary)',
                            padding: '2px',
                            flexShrink: 0,
                            overflow: 'hidden'
                        }}>
                            <img
                                src={user?.profileImage ? user.profileImage : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
                                alt={user?.username}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 'var(--radius-sm)',
                                    objectFit: 'cover'
                                }}
                                onError={(e) => {
                                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`;
                                }}
                            />
                        </div>
                        {!isCollapsed && (
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {user?.username}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    View Profile
                                </div>
                            </div>
                        )}
                    </Link>

                    {/* Settings Button */}
                    <Link
                        to="/settings"
                        title="Settings"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-md)',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-lg)',
                            background: 'transparent',
                            color: 'var(--text-main)',
                            width: '100%',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-secondary)';
                            e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        <Settings size={20} />
                        {!isCollapsed && <span>Settings</span>}
                    </Link>
                </div>

                <style>{`
                    nav::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
            </motion.nav>

            {/* Mobile Overlay */}
            <style>{`
                @media (max-width: 1023px) {
                    nav {
                        transform: translateX(-100%) !important;
                    }
                }
            `}</style>

            <AnimatePresence>
                {isCreateModalOpen && (
                    <CreatePost
                        onClose={() => setIsCreateModalOpen(false)}
                        onPostCreated={(newPost) => {
                            if (window.location.pathname === '/') {
                                window.location.reload();
                            } else {
                                navigate('/');
                            }
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
