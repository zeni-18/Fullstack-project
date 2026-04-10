const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const sendEmail = require('../utils/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
        expiresIn: '30d'
    });
};

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const logVerificationCode = (email, code) => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 DEVELOPMENT VERIFICATION CODE');
    console.log(`📧 User: ${email}`);
    console.log(`🔑 Code: ${code}`);
    console.log('='.repeat(50) + '\n');
};

router.post('/register', upload.single('profileImage'), async (req, res) => {
    try {
        const { username, email, password, bio, fullName } = req.body;
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({
                message: userExists.email === email ? 'Email already registered' : 'Username already taken'
            });
        }

        const profileImageUrl = req.file ? `/uploads/${req.file.filename}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
        const user = await User.create({
            username,
            email,
            password,
            fullName,
            bio,
            profileImage: profileImageUrl,
            isVerified: true // Automatically verify for now
        });

        if (user) {
            res.status(201).json({
                message: 'Registration successful',
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        if (user.verificationCodeExpire < Date.now()) {
            return res.status(400).json({ message: 'Verification code expired' });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpire = undefined;
        await user.save();

        res.json({
            message: 'Email verified successfully',
            _id: user._id,
            username: user.username,
            email: user.email,
            profileImage: user.profileImage,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/resend-code', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        const verificationCode = generateVerificationCode();
        user.verificationCode = verificationCode;
        user.verificationCodeExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        logVerificationCode(user.email, verificationCode);

        await sendEmail({
            email: user.email,
            subject: 'New Verification Code - ConnectX',
            message: `Your new verification code is: ${verificationCode}. It expires in 10 minutes.`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>New Verification Code</h2>
                    <p>You requested a new verification code. Please use the code below:</p>
                    <div style="font-size: 24px; font-weight: bold; color: #8B5CF6; padding: 10px; border: 1px solid #ddd; display: inline-block; border-radius: 8px;">
                        ${verificationCode}
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                </div>
            `
        });

        res.json({ message: 'Verification code resent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            // isVerified check disabled as requested for development

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Login
router.post('/google-login', async (req, res) => {
    try {
        const { credential } = req.body;
        
        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required' });
        }

        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            // Create new user if not exists
            const baseUsername = email.split('@')[0];
            const uniqueUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
            
            user = await User.create({
                username: uniqueUsername,
                email,
                fullName: name || uniqueUsername,
                profileImage: picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + uniqueUsername,
                googleId,
                isVerified: true
            });
        } else {
            // Update existing user with googleId if missing
            if (!user.googleId) {
                user.googleId = googleId;
                user.isVerified = true;
                await user.save();
            }
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            profileImage: user.profileImage,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(500).json({ message: 'Invalid Google token or internal server error' });
    }
});

router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('followers', 'username')
            .populate('following', 'username');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/updatepassword', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');
        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/forgotpassword', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Test Email Route
router.post('/test-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        await sendEmail({
            email,
            subject: 'Test Email - ConnectX',
            message: 'This is a test email to verify your email service configuration.',
            html: '<h1>Email Service Working!</h1><p>If you received this, your EMAIL_USER and EMAIL_PASS are configured correctly.</p>'
        });

        res.json({ message: 'Test email sent successfully' });
    } catch (error) {
        console.error('Test Email error:', error);
        res.status(500).json({ message: 'Failed to send test email', error: error.message });
    }
});

module.exports = router;
