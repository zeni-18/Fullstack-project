import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

// Premium Login Page with Glassmorphism and modern aesthetics
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
            toast.error(result.message);
        }
    };

    const isGoogleEnabled = import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_GOES_HERE";

    return (
        <div className="login-container" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top right, #1e1e2d 0%, #0c0c14 100%)',
            padding: '20px'
        }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="glass login-card" 
                style={{
                    width: '100%',
                    maxWidth: '450px',
                    padding: '40px',
                    borderRadius: '24px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <motion.div 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="logo-icon"
                        style={{
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: 'white'
                        }}
                    >
                        X
                    </motion.div>
                    <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Welcome Back</h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '15px' }}>Enter your credentials to access your account</p>
                </div>

                {isGoogleEnabled && (
                    <div style={{ marginBottom: '24px' }}>
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
                            onError={() => toast.error('Google Login Failed')}
                            theme="filled_blue"
                            shape="rectangular"
                            width="100%"
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
                            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '600' }}>OR CONTINUE WITH EMAIL</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '15px',
                                transition: 'all 0.3s'
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '600' }}>Password</label>
                            <Link to="/forgot-password" style={{ color: '#6366f1', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>Forgot password?</Link>
                        </div>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '15px'
                            }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            marginTop: '8px',
                            boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'white', fontWeight: '700', textDecoration: 'none' }}>Sign up</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
