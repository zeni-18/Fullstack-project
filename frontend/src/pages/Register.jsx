import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { Camera, X } from 'lucide-react';

// Premium Register Page with Glassmorphism and Profile Picture Upload
const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        bio: ''
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, email, password } = formData;

        if (!username || !email || !password) {
            return toast.error('Please fill in all required fields');
        }

        setIsSubmitting(true);
        
        // Prepare FormData for profile picture upload
        const data = new FormData();
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('fullName', formData.fullName);
        data.append('bio', formData.bio);
        if (image) data.append('profileImage', image);

        const result = await register(data);
        setIsSubmitting(false);

        if (result.success) {
            toast.success('Registration successful! You can now log in.');
            navigate('/login');
        } else {
            toast.error(result.message);
        }
    };

    const isGoogleEnabled = import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_GOES_HERE";

    return (
        <div className="register-container" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top right, #1e1e2d 0%, #0c0c14 100%)',
            padding: '20px'
        }}>
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="glass login-card" 
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '40px',
                    borderRadius: '24px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div className="logo-icon"
                        style={{
                            width: '50px',
                            height: '50px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: 'white'
                        }}
                    >
                        X
                    </div>
                    <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Create Account</h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '15px' }}>Join the community and start creating today.</p>
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
                            onError={() => toast.error('Google registration failed')}
                            theme="filled_blue"
                            shape="rectangular"
                            width="100%"
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
                            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '600' }}>OR REGISTER WITH EMAIL</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Profile Picture Upload Section */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '2px dashed rgba(255, 255, 255, 0.2)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {preview ? (
                                    <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center' }}>
                                        <Camera size={24} style={{ marginBottom: '4px' }} />
                                        <div style={{ fontSize: '10px' }}>Upload Photo</div>
                                    </div>
                                )}
                            </div>
                            <label style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '30px',
                                height: '30px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                border: '2px solid rgba(0, 0, 0, 0.3)'
                            }}>
                                <PlusIcon size={16} color="white" />
                                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Full Name</label>
                            <input 
                                type="text"
                                name="fullName" 
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '10px',
                                    color: 'white',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Username *</label>
                            <input 
                                type="text"
                                name="username"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '10px',
                                    color: 'white',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Email Address *</label>
                        <input 
                            type="email"
                            name="email" 
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Password * (Min. 6 chars)</label>
                        <input 
                            type="password"
                            name="password" 
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '14px'
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
                        {isSubmitting ? 'Creating Account...' : 'Get Started'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                    Already have an account? <Link to="/login" style={{ color: 'white', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
                </div>
            </motion.div>
        </div>
    );
};

// Simple Plus Icon replacement of lucide-react if not found
const PlusIcon = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export default Register;
