require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAI() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('ERROR: GEMINI_API_KEY is not set in .env');
            process.exit(1);
        }

        console.log('Using API Key (first 4 chars):', apiKey.substring(0, 4) + '...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log('Sending test prompt: "Say hello!"');
        const result = await model.generateContent("Say hello!");
        const response = await result.response;
        console.log('AI Response:', response.text());
        console.log('SUCCESS: AI integration is working!');
    } catch (error) {
        console.error('ERROR during AI test:', error.message);
        process.exit(1);
    }
}

testAI();
