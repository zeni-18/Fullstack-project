require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);

        // This is a bit of a hack to see available models since the SDK doesn't always expose listModels directly in the core
        // But we can try to use a simple prompt on a common model to verify connectivity
        const testModels = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

        for (const modelName of testModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                console.log(`Checking ${modelName}...`);
                const result = await model.generateContent("test");
                const response = await result.response;
                console.log(`✅ ${modelName} is working!`);
            } catch (err) {
                console.log(`❌ ${modelName} failed: ${err.message}`);
            }
        }
    } catch (error) {
        console.error('List models error:', error.message);
    }
}

listModels();
