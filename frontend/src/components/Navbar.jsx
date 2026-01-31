import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Home, Search, PlusSquare, Heart, User, LogOut, Moon, Sun, Compass } from 'lucide-react';
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
        { icon: Home, path: '/', title: 'Home' },
        { icon: Compass, path: '/explore', title: 'Explore' },
        { icon: PlusSquare, action: () => setIsCreateModalOpen(true), title: 'New Post' },
        { icon: Heart, path: '/notifications', title: 'Notifications', badge: unreadCount },
        { icon: User, path: `/profile/${user?.username}`, title: 'Profile' },
    ];

    return (
        <>
            <nav className="glass" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '64px',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid var(--border)'
            }}>
                <div className="container flex-between">
                    <Link to="/" style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: '800',
                        fontSize: '1.6rem',
                        color: 'var(--text-main)',
                        letterSpacing: '-0.04em'
                    }}>
                        Blogger
                    </Link>

                    {user && (
                        <div className="flex" style={{ gap: 'var(--spacing-md)', alignItems: 'center' }}>
                            {navItems.map((item, index) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    {item.path ? (
                                        <Link
                                            to={item.path}
                                            title={item.title}
                                            style={{
                                                padding: '8px',
                                                borderRadius: 'var(--radius-sm)',
                                                backgroundColor: isActive(item.path) ? 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)' : 'transparent',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <item.icon
                                                size={24}
                                                strokeWidth={isActive(item.path) ? 2.5 : 2}
                                                color={isActive(item.path) ? 'var(--primary)' : 'var(--text-main)'}
                                            />
                                            {item.badge > 0 && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    backgroundColor: 'var(--error)',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: '16px',
                                                    height: '16px',
                                                    fontSize: '9px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: '800',
                                                    border: '2px solid var(--card-bg)'
                                                }}>
                                                    {item.badge > 9 ? '9+' : item.badge}
                                                </div>
                                            )}
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={item.action}
                                            title={item.title}
                                            style={{ padding: '8px' }}
                                        >
                                            <item.icon size={24} color="var(--text-main)" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)', margin: '0 8px' }} />

                            <button onClick={toggleTheme} title="Toggle Theme" style={{ padding: '8px' }}>
                                {isDarkMode ? <Sun size={20} color="var(--text-main)" /> : <Moon size={20} color="var(--text-main)" />}
                            </button>

                            <button title="Logout" onClick={handleLogout} style={{ padding: '8px', color: 'var(--text-secondary)' }}>
                                <LogOut size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </nav>

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
