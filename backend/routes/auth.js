const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
        expiresIn: '30d'
    });
};

router.post('/register', upload.single('profileImage'), async (req, res) => {
    try {
        const { username, email, password, bio } = req.body;
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({
                message: userExists.email === email ? 'Email already registered' : 'Username already taken'
            });
        }
        const profileImageUrl = req.file ? `/uploads/${req.file.filename}` : '';
        const user = await User.create({
            username,
            email,
            password,
            bio,
            profileImage: profileImageUrl
        });
        if (user) {
            res.status(201).json({
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

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
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

module.exports = router;
