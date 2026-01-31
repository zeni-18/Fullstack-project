import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User, Lock, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Settings = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('profile');
    const [loading, setLoading] = useState(false);

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error("Passwords don't match");
        }
        setLoading(true);
        try {
            await axios.put('/auth/updatepassword', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success('Password updated successfully');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating password');
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { id: 'profile', label: 'Edit Profile', icon: User },
        { id: 'password', label: 'Change Password', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell, disabled: true },
        { id: 'privacy', label: 'Privacy and Security', icon: Shield, disabled: true },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="App">
            <Navbar />
            <div className="container" style={{ paddingTop: '40px', maxWidth: '935px' }}>
                <div className="card flex" style={{ padding: 0, minHeight: '70vh', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ width: '280px', borderRight: '1px solid var(--border)', backgroundColor: 'var(--card-bg)' }}>
                        <div style={{ padding: '32px 24px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '4px' }}>Settings</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage your account preferences</p>
                        </div>
                        <div className="flex column">
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    disabled={item.disabled}
                                    onClick={() => setActiveSection(item.id)}
                                    className="flex-between"
                                    style={{
                                        width: '100%',
                                        padding: '16px 24px',
                                        gap: '12px',
                                        borderLeft: activeSection === item.id ? '3px solid var(--primary)' : '3px solid transparent',
                                        backgroundColor: activeSection === item.id ? 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.05)' : 'transparent',
                                        color: activeSection === item.id ? 'var(--primary)' : (item.disabled ? 'var(--text-secondary)' : 'var(--text-main)'),
                                        fontWeight: activeSection === item.id ? '700' : '500',
                                        opacity: item.disabled ? 0.5 : 1,
                                        cursor: item.disabled ? 'not-allowed' : 'pointer',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    <div className="flex gap-sm">
                                        <item.icon size={20} />
                                        {item.label}
                                    </div>
                                    {activeSection === item.id && <ChevronRight size={16} />}
                                </button>
                            ))}
                            <div style={{ marginTop: '20px', padding: '0 24px' }}>
                                <button
                                    onClick={() => { logout(); navigate('/login'); }}
                                    className="flex gap-sm"
                                    style={{
                                        width: '100%',
                                        padding: '16px 0',
                                        color: 'var(--error)',
                                        fontWeight: '700',
                                        borderTop: '1px solid var(--border)',
                                        marginTop: '10px'
                                    }}
                                >
                                    <LogOut size={20} /> Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, padding: '48px 60px', backgroundColor: 'var(--card-bg)' }}>
                        {activeSection === 'password' ? (
                            <motion.form
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onSubmit={handlePasswordUpdate}
                                style={{ maxWidth: '440px' }}
                            >
                                <h2 style={{ marginBottom: '32px', fontWeight: '700', fontSize: '1.75rem' }}>Change Password</h2>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.9rem' }}>Current Password</label>
                                    <input
                                        type="password"
                                        style={{ width: '100%' }}
                                        value={passwords.currentPassword}
                                        onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                        required
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.9rem' }}>New Password</label>
                                    <input
                                        type="password"
                                        style={{ width: '100%' }}
                                        value={passwords.newPassword}
                                        onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        required
                                        placeholder="Minimum 6 characters"
                                    />
                                </div>
                                <div style={{ marginBottom: '32px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.9rem' }}>Confirm New Password</label>
                                    <input
                                        type="password"
                                        style={{ width: '100%' }}
                                        value={passwords.confirmPassword}
                                        onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        required
                                        placeholder="Repeat new password"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loading}
                                    style={{ width: '100%' }}
                                >
                                    {loading ? <div className="spinner" style={{ borderTopColor: 'white' }}></div> : 'Update Password'}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="flex-between" style={{ marginBottom: '32px' }}>
                                    <h2 style={{ fontWeight: '700', fontSize: '1.75rem' }}>Edit Profile</h2>
                                    <div style={{ backgroundColor: 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: '700' }}>
                                        Active
                                    </div>
                                </div>
                                <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg)', borderStyle: 'dashed' }}>
                                    <p style={{ color: 'var(--text-main)', fontWeight: '500', lineHeight: '1.6' }}>
                                        To modify your public identity, including your bio, full name, and profile picture, please head to your
                                        public profile page and click the **Edit Profile** button.
                                    </p>
                                    <button
                                        className="btn-primary"
                                        style={{ marginTop: '24px' }}
                                        onClick={() => navigate(`/profile/${user?.username}`)}
                                    >
                                        Go to My Profile
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Settings;
