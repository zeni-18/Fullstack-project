const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');


exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: { $in: [req.user.id] }
        })
            .populate('participants', 'username profileImage fullName')
            .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (err) {
        console.error('Error in getConversations:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};


exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .populate('sender', 'username profileImage')
            .populate('reactions.user', 'username profileImage')
            .sort({ createdAt: 1 });


        await Message.updateMany(
            { conversationId, sender: { $ne: req.user.id }, read: false },
            { $set: { read: true } }
        );


        await Conversation.updateOne(
            { _id: conversationId, 'lastMessage.sender': { $ne: req.user.id } },
            { $set: { 'lastMessage.read': true } }
        );

        res.status(200).json(messages);
    } catch (err) {
        console.error('Error in getMessages:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};


exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, text } = req.body;
        const senderId = req.user.id;


        let imageUrl = '';
        let videoUrl = '';

        if (req.file) {
            const mimetype = req.file.mimetype;
            if (mimetype.startsWith('image/')) {
                imageUrl = '/uploads/' + req.file.filename;
            } else if (mimetype.startsWith('video/')) {
                videoUrl = '/uploads/' + req.file.filename;
            }
        }

        // Determine preview text for lastMessage
        let lastMessageText = text;
        if (!text && imageUrl) lastMessageText = '📷 Image';
        if (!text && videoUrl) lastMessageText = '🎥 Video';


        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, recipientId],
                lastMessage: {
                    text: lastMessageText,
                    sender: senderId,
                    read: false
                }
            });
        } else {
            conversation.lastMessage = {
                text: lastMessageText,
                sender: senderId,
                read: false
            };
            await conversation.save();
        }

        const newMessage = await Message.create({
            conversationId: conversation._id,
            sender: senderId,
            text: text || '',
            imageUrl,
            videoUrl
        });

        const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'username profileImage');

        res.status(201).json(populatedMessage);
    } catch (err) {
        console.error('Error in sendMessage:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.reactToMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user.id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user already reacted with this emoji
        const existingReactionIndex = message.reactions.findIndex(
            r => r.user.toString() === userId && r.emoji === emoji
        );

        if (existingReactionIndex > -1) {
            // Remove reaction
            message.reactions.splice(existingReactionIndex, 1);
        } else {
            // Add reaction
            message.reactions.push({ user: userId, emoji });
        }

        await message.save();

        const updatedMessage = await Message.findById(messageId)
            .populate('sender', 'username profileImage')
            .populate('reactions.user', 'username profileImage');

        res.status(200).json(updatedMessage);
    } catch (err) {
        console.error('Error in reactToMessage:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};
