const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');

const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.GOOGLE_AI_API_KEY
  })],
  model: 'googleai/gemini-2.0-flash',
});

module.exports = { ai };
