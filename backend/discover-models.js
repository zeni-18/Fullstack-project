require('dotenv').config();
const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('No API key found in .env');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            if (result.error) {
                console.error('API Error:', result.error.message);
                return;
            }
            console.log('Available Models:');
            result.models.forEach(model => {
                const name = model.name.split('/').pop();
                const methods = model.supportedGenerationMethods.join(', ');
                console.log(`- ${name} (Methods: ${methods})`);
            });
        } catch (e) {
            console.error('Parse Error:', e.message);
            console.log('Raw Data:', data);
        }
    });
}).on('error', (err) => {
    console.error('Request Error:', err.message);
});
