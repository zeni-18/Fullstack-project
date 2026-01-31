import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChevronLeft, Lock } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/auth/forgotpassword', { email });
            setSubmitted(true);
            toast.success('Reset link sent to your email');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error sending reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center column" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--bg) 0%, hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.05) 100%)', padding: '24px' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card"
                style={{
                    maxWidth: '400px',
                    width: '100%',
                    textAlign: 'center',
                    padding: '48px 40px',
                    boxShadow: 'var(--shadow-lg)'
                }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12 }}
                    style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        border: '2px solid var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px auto',
                        backgroundColor: 'var(--bg)'
                    }}
                >
                    <Lock size={32} strokeWidth={1.5} />
                </motion.div>

                {!submitted ? (
                    <>
                        <h2 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: '800' }}>Trouble logging in?</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px', lineHeight: '1.5' }}>
                            Enter your email and we'll send you a link to reset your password and get back into your account.
                        </p>
                        <form onSubmit={handleSubmit} className="flex column gap-md">
                            <input
                                type="email"
                                placeholder="Email address"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '14px' }}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                                style={{ width: '100%', padding: '14px' }}
                            >
                                {loading ? <div className="spinner" style={{ borderTopColor: 'white' }}></div> : 'Send Login Link'}
                            </button>
                        </form>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: '800' }}>Email Sent!</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px', lineHeight: '1.5' }}>
                            We've sent a secure recovery link to <br /><strong>{email}</strong>
                        </p>
                        <button
                            onClick={() => setSubmitted(false)}
                            style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.95rem' }}
                        >
                            didn't get a link? Resend
                        </button>
                    </motion.div>
                )}

                <div style={{ marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                    <Link to="/login" className="flex-center" style={{ gap: '6px', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        <ChevronLeft size={18} /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
