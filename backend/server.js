require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const sentiment = require('sentiment');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors({
  origin: '*', // In production, replace with your frontend URL
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Initialize OpenAI with Groq configuration
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
  maxRetries: 2,
  timeout: 60000
});

// Sentiment analyzer
const sentimentAnalyzer = new sentiment();

// Function to get emotional context based on sentiment score
function getEmotionalContext(score) {
  if (score <= -5) return "I sense you're feeling quite negative. I'm here to support you.";
  if (score < 0) return "I notice you might be feeling a bit down. Would you like to talk about it?";
  if (score === 0) return "I'm here to listen and chat with you.";
  if (score <= 5) return "I sense some positivity in your message. Would you like to share more?";
  return "I can tell you're feeling quite positive! That's wonderful!";
}

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    console.log('Testing API connection with key:', process.env.GROQ_API_KEY ? 'Key exists' : 'No key found');
    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5
    });
    console.log('API Test successful');
    res.json({ status: 'ok', message: 'Backend server and API are running properly!' });
  } catch (error) {
    console.error('API Test Error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'API test failed',
      error: error.message,
      details: {
        name: error.name,
        code: error.code,
        type: error.type
      }
    });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Processing chat request with message:', message);
    
    // Analyze sentiment
    const sentimentResult = sentimentAnalyzer.analyze(message);
    console.log('Sentiment analysis:', sentimentResult);
    const emotionalContext = getEmotionalContext(sentimentResult.score);

    // Format chat history
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    // Create system message
    const systemMessage = {
      role: 'system',
      content: `You are an empathetic AI counselor named Kona. Your goal is to provide emotional support and understanding. Current emotional context: ${emotionalContext}`
    };

    console.log('Sending request to Groq API...');
    // Get response from Groq
    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        systemMessage,
        ...formattedHistory,
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    console.log('Received response from Groq API');
    const response = completion.choices[0].message.content;
    res.json({ response });

  } catch (error) {
    console.error('Chat Error:', error.message);
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      type: error.type
    });
    
    // Send more detailed error response
    res.status(500).json({ 
      error: error.message,
      details: {
        type: error.type,
        code: error.code
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 