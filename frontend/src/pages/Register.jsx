import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import loginSideImage from '../assets/login_side.png';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, googleLogin } = useAuth();
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
            toast.success(result.message);
            navigate('/verify-email', { state: { email: formData.email } });
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Left Side - Decorative Panel */}
            <div className="flex-center column" style={{ 
                flex: '1.2', 
                position: 'relative', 
                display: 'none',
                overflow: 'hidden',
                background: 'var(--bg-secondary)'
            }}>
                <style dangerouslySetInnerHTML={{ __html: `
                    @media (min-width: 1024px) {
                        .flex-center.column[style*="flex: 1.2"] { display: flex !important; }
                    }
                `}} />
                
                <motion.div 
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${loginSideImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: 1
                    }}
                />
                
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
                    zIndex: 2
                }} />

                <div style={{ position: 'relative', zIndex: 3, padding: 'var(--spacing-3xl)', color: 'white', textAlign: 'left', width: '100%' }}>
                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <h1 style={{ 
                            fontSize: '4.5rem', 
                            fontWeight: '900', 
                            lineHeight: '1', 
                            marginBottom: 'var(--spacing-md)',
                            letterSpacing: '-0.04em',
                            color: 'white'
                        }}>
                            Start Your <br />
                            <span style={{ color: 'var(--accent)' }}>Journey.</span>
                        </h1>
                        <p style={{ fontSize: '1.25rem', opacity: '0.9', maxWidth: '500px', fontWeight: '500' }}>
                            Become part of a global movement. Connect, share, and inspire millions with your unique voice.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="flex-center" style={{ flex: '1', padding: 'var(--spacing-xl)', background: 'var(--bg)' }}>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ width: '100%', maxWidth: '480px' }}
                >
                    <div className="flex column gap-sm" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            background: 'var(--gradient-primary)', 
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: '900',
                            marginBottom: 'var(--spacing-sm)'
                        }}>
                            X
                        </div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>Create account</h2>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Join us and start sharing your stories today.</p>
                    </div>

                    <div className="flex column gap-md" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                setIsSubmitting(true);
                                const result = await googleLogin({ credential: credentialResponse.credential });
                                setIsSubmitting(false);
                                if (result.success) {
                                    toast.success('Signed in with Google!');
                                    navigate('/');
                                } else {
                                    toast.error(result.message);
                                }
                            }}
                            onError={() => {
                                toast.error('Google Login Failed');
                            }}
                            useOneTap
                            theme="filled_blue"
                            shape="rectangular"
                            text="signup_with"
                            width="480"
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: '600' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex column gap-md">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="flex column gap-xs">
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
                            <div className="flex column gap-xs">
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

                        <div className="flex column gap-xs">
                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', paddingLeft: '4px' }}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ borderRadius: 'var(--radius-md)' }}
                            />
                        </div>

                        <div className="flex column gap-xs">
                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', paddingLeft: '4px' }}>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Min. 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{ borderRadius: 'var(--radius-md)' }}
                            />
                        </div>

                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '8px 0', lineHeight: '1.5' }}>
                            By signing up, you agree to our <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Terms</span>, <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Data Policy</span> and <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Cookies Policy</span>.
                        </p>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSubmitting}
                            style={{ width: '100%', padding: '16px', marginTop: '8px', borderRadius: 'var(--radius-md)' }}
                        >
                            {isSubmitting ? <div className="spinner" style={{ borderTopColor: 'white', width: '20px', height: '20px' }}></div> : 'Create Account'}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '800' }}>Log in</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
