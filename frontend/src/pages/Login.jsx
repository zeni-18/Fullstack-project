import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import loginSideImage from '../assets/login_side.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, googleLogin } = useAuth();
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
            if (result.unverified) {
                toast.warning(result.message);
                navigate('/verify-email', { state: { email } });
            } else {
                toast.error(result.message);
            }
        }
    };

    return (
        <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Left Side - Decorative Panel */}
            <div className="flex-center column" style={{ 
                flex: '1.2', 
                position: 'relative', 
                display: 'none', // Hidden on mobile
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
                            Elevate Your <br />
                            <span style={{ color: 'var(--accent)' }}>Perspective.</span>
                        </h1>
                        <p style={{ fontSize: '1.25rem', opacity: '0.9', maxWidth: '500px', fontWeight: '500' }}>
                            Join the world's most innovative community of creators and thinkers. Share your story today.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        style={{ marginTop: 'var(--spacing-2xl)', display: 'flex', gap: 'var(--spacing-lg)' }}
                    >
                        <div className="glass" style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--radius-lg)', color: 'white' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>10k+</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Daily Readers</div>
                        </div>
                        <div className="glass" style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--radius-lg)', color: 'white' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>5k+</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Stories Shared</div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-center" style={{ flex: '1', padding: 'var(--spacing-xl)', background: 'var(--bg)' }}>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ width: '100%', maxWidth: '440px' }}
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
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>Welcome back</h2>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Please enter your details to sign in.</p>
                    </div>

                    <div className="flex column gap-md">
                        {/* Social Login Mockups */}
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
                            text="continue_with"
                            width="440"
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: '600' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex column gap-md">
                            <div className="flex column gap-xs">
                                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', paddingLeft: '4px' }}>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ borderRadius: 'var(--radius-md)' }}
                                />
                            </div>
                            <div className="flex column gap-xs">
                                <div className="flex-between">
                                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', paddingLeft: '4px' }}>Password</label>
                                    <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700' }}>Forgot password?</Link>
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ borderRadius: 'var(--radius-md)' }}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isSubmitting}
                                style={{ width: '100%', padding: '16px', marginTop: '8px', borderRadius: 'var(--radius-md)' }}
                            >
                                {isSubmitting ? <div className="spinner" style={{ borderTopColor: 'white', width: '20px', height: '20px' }}></div> : 'Sign In'}
                            </button>
                        </form>

                        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '800' }}>Sign up for free</Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
