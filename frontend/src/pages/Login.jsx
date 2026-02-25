import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            return toast.error('Please fill in all fields');
        }

        setIsSubmitting(true);
        const result = await login(email, password);
        setIsSubmitting(false);

        if (result.success) {
            toast.success('Welcome back!');
            navigate('/');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="flex-center column" style={{ minHeight: '100vh', padding: 'var(--spacing-md)', background: 'linear-gradient(135deg, var(--bg) 0%, hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.05) 100%)' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="card"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '48px 40px',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-lg)',
                    borderRadius: 'var(--radius-lg)'
                }}
            >
                <motion.h1
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: '900',
                        fontSize: '3rem',
                        marginBottom: '8px',
                        background: 'linear-gradient(135deg, var(--text-main) 30%, var(--primary) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.06em'
                    }}
                >
                    ConnectX
                </motion.h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontWeight: '500' }}>
                    Connect with the world's creators.
                </p>

                <form onSubmit={handleSubmit} className="flex column gap-md">
                    <div className="flex column gap-xs" style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', paddingLeft: '4px' }}>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)' }}
                        />
                    </div>
                    <div className="flex column gap-xs" style={{ textAlign: 'left' }}>
                        <div className="flex-between">
                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', paddingLeft: '4px' }}>Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>Forgot?</Link>
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                        style={{ width: '100%', padding: '14px', marginTop: '8px' }}
                    >
                        {isSubmitting ? <div className="spinner" style={{ borderTopColor: 'white' }}></div> : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    New here? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '800' }}>Create account</Link>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ marginTop: '40px', display: 'flex', gap: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}
            >
                <span>About</span>
                <span>Privacy</span>
                <span>Terms</span>
                <span>English (US)</span>
            </motion.div>
        </div>
    );
};

export default Login;
