require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAllModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // List of models we saw in discovery
    const modelsToTest = [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro"
    ];

    console.log('Testing models for available quota...');

    for (const modelName of modelsToTest) {
        try {
            console.log(`Checking ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'Ready'");
            const response = await result.response;
            console.log(`✅ ${modelName} is working: "${response.text().trim()}"`);
            process.exit(0); // Found a working model!
        } catch (err) {
            console.log(`❌ ${modelName} failed: ${err.message}`);
        }
    }
    console.log('No working models found with current quota.');
}

testAllModels();
