import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import loginSideImage from '../assets/login_side.png';

const VerifyEmail = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const { verifyEmail, resendCode } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        const newCode = [...code];
        newCode[index] = value.substring(value.length - 1);
        setCode(newCode);

        // Auto focus next input
        if (value && index < 5) {
            document.getElementById(`code-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            document.getElementById(`code-${index - 1}`).focus();
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            return toast.error('Please enter the 6-digit code');
        }

        setIsSubmitting(true);
        const result = await verifyEmail(email, fullCode);
        setIsSubmitting(false);

        if (result.success) {
            toast.success('Email verified successfully! Welcome to ConnectX.');
            navigate('/');
        } else {
            toast.error(result.message);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        
        const result = await resendCode(email);
        if (result.success) {
            toast.success('New code sent to your email');
            setResendCooldown(60); // 1 minute cooldown
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
                    <motion.h1 style={{ fontSize: '4rem', fontWeight: '900', color: 'white' }}>
                        Security <br /> <span style={{ color: 'var(--accent)' }}>First.</span>
                    </motion.h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                        We've sent a 6-digit verification code to your email. <br />
                        Please enter it to secure your account.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-center" style={{ flex: '1', padding: 'var(--spacing-xl)', background: 'var(--bg)' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}
                >
                    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Verify your email</h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                            A code was sent to <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex column gap-xl">
                        <div className="flex-center gap-sm">
                            {code.map((digit, idx) => (
                                <input
                                    key={idx}
                                    id={`code-${idx}`}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    style={{
                                        width: '50px',
                                        height: '60px',
                                        textAlign: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        borderRadius: 'var(--radius-md)',
                                        border: '2px solid var(--border)',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-main)'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Developer Hint */}
                        <div style={{ 
                            background: 'rgba(139, 92, 246, 0.1)', 
                            padding: '12px', 
                            borderRadius: 'var(--radius-md)',
                            border: '1px dashed var(--primary)',
                            fontSize: '0.85rem',
                            color: 'var(--primary)',
                            marginBottom: '8px'
                        }}>
                            <strong>Dev Tip:</strong> Using placeholder mail? Check the code in your <strong>server terminal</strong> window!
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSubmitting}
                            style={{ width: '100%', padding: '16px' }}
                        >
                            {isSubmitting ? <div className="spinner"></div> : 'Verify Account'}
                        </button>
                    </form>

                    <div style={{ marginTop: '32px' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            Didn't receive the code?
                        </p>
                        <button 
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            style={{ 
                                color: resendCooldown > 0 ? 'var(--text-tertiary)' : 'var(--primary)', 
                                fontWeight: '700',
                                marginTop: '4px',
                                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                        </button>
                    </div>

                    <Link to="/login" style={{ display: 'block', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        ← Back to Login
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default VerifyEmail;
