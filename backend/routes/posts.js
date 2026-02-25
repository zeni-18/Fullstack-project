const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Feed route
router.get('/feed', protect, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const following = req.user.following || [];
        const authorIds = [...following, req.user._id];

        const posts = await Post.find({ author: { $in: authorIds } })
            .populate('author', 'username profileImage')
            .populate({
                path: 'comments',
                populate: { path: 'user', select: 'username' }
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        res.json(posts || []);
    } catch (error) {
        console.error('Feed error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Explore route
router.get('/explore', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username profileImage')
            .populate({
                path: 'comments',
                populate: { path: 'user', select: 'username' }
            })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(posts || []);
    } catch (error) {
        console.error('Explore error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Search posts
router.get('/search', async (req, res) => {
    try {
        const { tag } = req.query;
        if (!tag) return res.json([]);
        const posts = await Post.find({
            tags: { $regex: tag, $options: 'i' }
        })
            .populate('author', 'username profileImage')
            .limit(20);
        res.json(posts || []);
    } catch (error) {
        console.error('Post search error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create post
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        console.log('Post creation request received');
        console.log('Body:', req.body);
        console.log('File:', req.file);

        const { caption, tags, location, mediaType } = req.body;
        if (!req.file) {
            console.log('Upload failed: No file received');
            return res.status(400).json({ message: 'Please upload an image or video' });
        }

        // Detect media type from file if not provided
        const detectedMediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

        const post = await Post.create({
            caption,
            imageUrl: `/uploads/${req.file.filename}`,
            mediaUrl: `/uploads/${req.file.filename}`,
            mediaType: mediaType || detectedMediaType,
            author: req.user._id,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            location
        });
        const populatedPost = await Post.findById(post._id).populate('author', 'username profileImage');
        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Specific parameterized routes below
router.post('/:id/comment', protect, async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const comment = await Comment.create({
            post: req.params.id,
            user: req.user._id,
            text
        });
        post.comments.push(comment._id);
        await post.save();

        if (post.author.toString() !== req.user._id.toString()) {
            const Notification = require('../models/Notification');
            await Notification.create({
                recipient: post.author,
                sender: req.user._id,
                type: 'comment',
                post: post._id
            });
        }
        const populatedComment = await Comment.findById(comment._id).populate('user', 'username profileImage');
        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const likeIndex = post.likes.indexOf(req.user._id);
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(req.user._id);
            if (post.author.toString() !== req.user._id.toString()) {
                const Notification = require('../models/Notification');
                await Notification.create({
                    recipient: post.author,
                    sender: req.user._id,
                    type: 'like',
                    post: post._id
                });
            }
        }
        await post.save();
        res.json({ likesCount: post.likes.length, isLiked: likeIndex === -1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/save', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const user = await User.findById(req.user._id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        const saveIndex = user.savedPosts.indexOf(post._id);
        if (saveIndex > -1) {
            user.savedPosts.splice(saveIndex, 1);
        } else {
            user.savedPosts.push(post._id);
        }
        await user.save();
        res.json({ isSaved: saveIndex === -1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        await post.deleteOne();
        res.json({ message: 'Post removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
