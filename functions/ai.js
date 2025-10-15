const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../data/config.json');

const genAI = new GoogleGenerativeAI(config.geminiKey);

module.exports = {
  chat: async (prompt, context) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro'});
    const chat = model.startChat({ history: context.map(c => ({ role: c.role, parts: [{ text: c.content }] })) });
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  },

  describeImage: async (imageUrl) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    const response = await model.generateContent(['Describe this image accurately and briefly for a LLM', imageUrl]);
    return response.response.text();
  }
};
