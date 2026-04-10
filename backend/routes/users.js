const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');


router.get('/suggestions', protect, async (req, res) => {
    try {
        const following = req.user.following || [];
        const users = await User.find({
            _id: { $nin: [...following, req.user._id] }
        })
            .select('username fullName profileImage')
            .limit(5);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json([]);
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query, $options: 'i' } }
            ]
        })
            .select('username fullName profileImage')
            .limit(10);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/username/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password')
            .populate('followers', 'username')
            .populate('following', 'username');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.put('/profile', protect, upload.single('image'), async (req, res) => {
    try {
        console.log('Profile update request received');
        console.log('Body:', req.body);
        console.log('File:', req.file);
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { bio, fullName } = req.body;
        if (bio !== undefined) user.bio = bio;
        if (fullName !== undefined) user.fullName = fullName;

        if (req.file) {
            user.profileImage = `/uploads/${req.file.filename}`;
        }

        await user.save();

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            fullName: user.fullName,
            profileImage: user.profileImage,
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: error.message });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('followers', 'username')
            .populate('following', 'username');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id/posts', async (req, res) => {
    try {
        const posts = await Post.find({ author: req.params.id })
            .populate('author', 'username profileImage')
            .populate({
                path: 'comments',
                populate: { path: 'user', select: 'username profileImage' }
            })
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/follow', protect, async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);
        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }
        const followingIndex = currentUser.following.indexOf(userToFollow._id);
        const followerIndex = userToFollow.followers.indexOf(currentUser._id);
        if (followingIndex > -1) {
            currentUser.following.splice(followingIndex, 1);
            userToFollow.followers.splice(followerIndex, 1);
        } else {
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
            const Notification = require('../models/Notification');
            await Notification.create({
                recipient: userToFollow._id,
                sender: currentUser._id,
                type: 'follow'
            });
        }
        await currentUser.save();
        await userToFollow.save();
        const updatedUser = await User.findById(userToFollow._id)
            .select('-password')
            .populate('followers', 'username')
            .populate('following', 'username');
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id/followers', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('followers', 'username fullName profileImage bio');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.followers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id/following', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('following', 'username fullName profileImage bio');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.following);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id/saved', protect, async (req, res) => {
    try {
        if (req.params.id !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const user = await User.findById(req.params.id).populate({
            path: 'savedPosts',
            populate: [
                { path: 'author', select: 'username profileImage' },
                {
                    path: 'comments',
                    populate: { path: 'user', select: 'username profileImage' }
                }
            ]
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.savedPosts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
