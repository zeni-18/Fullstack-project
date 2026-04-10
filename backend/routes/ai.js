const express = require('express');
const router = express.Router();
const { generatePostContent, getChatResponse, getConversations, getConversationById, createConversation } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/generate-post', protect, generatePostContent);
router.post('/chat', protect, getChatResponse);
router.get('/conversations', protect, getConversations);
router.get('/conversations/:id', protect, getConversationById);
router.post('/conversations', protect, createConversation);

module.exports = router;
