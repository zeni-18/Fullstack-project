require('dotenv').config();
const mongoose = require('mongoose');
const AIConversation = require('./backend/models/AIConversation');
const User = require('./backend/models/User');

async function verifyFeatures() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const user = await User.findOne();
        if (!user) {
            console.log('No user found to test with.');
            return;
        }

        console.log(`Checking history for user: ${user.username}`);
        const conversation = await AIConversation.findOne({ user: user._id });

        if (conversation) {
            console.log('✅ Found persisted history!');
            console.log(`Messages count: ${conversation.messages.length}`);
        } else {
            console.log('ℹ️ No history found yet (normal if no chat sent yet).');
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error.message);
        process.exit(1);
    }
}

verifyFeatures();
