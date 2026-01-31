import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, email, password } = formData;

        if (!username || !email || !password) {
            return toast.error('Please fill in all required fields');
        }

        setIsSubmitting(true);
        const result = await register(formData);
        setIsSubmitting(false);

        if (result.success) {
            toast.success('Account created successfully!');
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
                    maxWidth: '440px',
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
                    Blogger.
                </motion.h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontWeight: '500' }}>
                    Join the community of stories.
                </p>

                <form onSubmit={handleSubmit} className="flex column gap-md">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="flex column gap-xs" style={{ textAlign: 'left' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', paddingLeft: '4px' }}>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                                style={{ borderRadius: 'var(--radius-md)' }}
                            />
                        </div>
                        <div className="flex column gap-xs" style={{ textAlign: 'left' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', paddingLeft: '4px' }}>Username</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                style={{ borderRadius: 'var(--radius-md)' }}
                            />
                        </div>
                    </div>

                    <div className="flex column gap-xs" style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', paddingLeft: '4px' }}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{ padding: '12px', borderRadius: 'var(--radius-md)' }}
                        />
                    </div>

                    <div className="flex column gap-xs" style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', paddingLeft: '4px' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Min. 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{ padding: '12px', borderRadius: 'var(--radius-md)' }}
                        />
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '8px 0', lineHeight: '1.4' }}>
                        By signing up, you agree to our **Terms**, **Data Policy** and **Cookies Policy**.
                    </p>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                        style={{ width: '100%', padding: '14px', marginTop: '8px' }}
                    >
                        {isSubmitting ? <div className="spinner" style={{ borderTopColor: 'white' }}></div> : 'Create Account'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '800' }}>Log in</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
