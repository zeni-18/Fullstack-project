const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage, reactToMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:conversationId', getMessages);
router.post('/', upload.single('media'), sendMessage);
router.put('/:messageId/react', reactToMessage);

module.exports = router;
