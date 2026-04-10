const { GoogleGenerativeAI } = require('@google/generative-ai');
const AIConversation = require('../models/AIConversation');

const generatePostContent = async (req, res) => {
    try {
        const { prompt, image } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'Gemini API key is not configured.' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let result;
        if (image) {
            // vision-based generation
            const imageData = image.split(',')[1];
            result = await model.generateContent([
                prompt || "Write a creative and engaging caption for this image.",
                { inlineData: { data: imageData, mimeType: "image/jpeg" } }
            ]);
        } else {
            result = await model.generateContent(prompt);
        }

        const response = await result.response;
        res.json({ content: response.text() });
    } catch (error) {
        console.error('AI generation error:', error);
        res.status(500).json({ message: 'AI generation failed', error: error.message });
    }
};

const getChatResponse = async (req, res) => {
    try {
        const { message, history, conversationId } = req.body;
        const userId = req.user._id;

        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const aiText = response.text();

        // Persist to DB
        let conversation;
        if (conversationId) {
            conversation = await AIConversation.findById(conversationId);
        }

        if (!conversation) {
            // If no ID or ID not found, create new
            conversation = new AIConversation({
                user: userId,
                messages: [],
                title: message.substring(0, 30) + (message.length > 30 ? '...' : '')
            });
        }

        conversation.messages.push({ role: 'user', parts: [{ text: message }] });
        conversation.messages.push({ role: 'model', parts: [{ text: aiText }] });
        await conversation.save();

        res.json({ response: aiText, conversationId: conversation._id });
    } catch (error) {
        console.error('AI chat error:', error.message);
        res.status(500).json({ message: 'AI connection error', error: error.message });
    }
};

const getConversations = async (req, res) => {
    try {
        const conversations = await AIConversation.find({ user: req.user._id })
            .select('title createdAt updatedAt')
            .sort({ updatedAt: -1 });
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
};

const getConversationById = async (req, res) => {
    try {
        const conversation = await AIConversation.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch conversation' });
    }
};

const createConversation = async (req, res) => {
    try {
        const conversation = new AIConversation({
            user: req.user._id,
            title: 'New Chat',
            messages: []
        });
        await conversation.save();
        res.status(201).json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create conversation' });
    }
};

module.exports = {
    generatePostContent,
    getChatResponse,
    getConversations,
    getConversationById,
    createConversation
};
