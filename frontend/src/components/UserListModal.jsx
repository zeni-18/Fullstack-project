import React from 'react';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const UserListModal = ({ title, users, onClose }) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="card"
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    maxHeight: '75vh',
                    background: 'var(--bg-secondary)',
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: 'var(--spacing-md)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>{title}</h3>
                    <button
                        onClick={onClose}
                        style={{ color: 'var(--text-main)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Search */}
                <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search
                            size={18}
                            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                        />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px 10px 40px',
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-main)',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                </div>

                {/* List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-sm)' }}>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <Link
                                key={user._id}
                                to={`/profile/${user.username}`}
                                onClick={onClose}
                                className="user-item"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-md)',
                                    padding: 'var(--spacing-md)',
                                    borderRadius: 'var(--radius-md)',
                                    transition: 'all 0.2s',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    marginBottom: '4px'
                                }}
                            >
                                <img
                                    src={user.profileImage || 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/v1/user_profile_default.png'}
                                    alt={user.username}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid var(--border-light)',
                                        background: 'var(--bg-tertiary)'
                                    }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>{user.username}</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.fullName}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div style={{ padding: 'var(--spacing-3xl) var(--spacing-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <div style={{ opacity: 0.5, marginBottom: 'var(--spacing-sm)' }}>
                                <Search size={40} strokeWidth={1} style={{ margin: '0 auto' }} />
                            </div>
                            <p style={{ fontWeight: '500' }}>No users found</p>
                        </div>
                    )}
                </div>
            </motion.div>
            <style>{`
                .user-item:hover {
                    background: var(--bg-tertiary) !important;
                    transform: translateX(4px);
                }
            `}</style>
        </motion.div>
    );
};

export default UserListModal;
