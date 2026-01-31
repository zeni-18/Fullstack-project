const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Get unread count
router.get('/unread', protect, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current user's notifications
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'username profileImage')
            .populate({
                path: 'post',
                select: 'imageUrl caption author',
                populate: { path: 'author', select: 'username' }
            })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications || []);
    } catch (error) {
        console.error('Fetch notifications error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Mark all as read
router.put('/read', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
