const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const sentiment = require('sentiment');
require('dotenv').config();

const app = express();

// Enable CORS for the frontend URL
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5174',
  'http://localhost:5173',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
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

const sentimentAnalyzer = new sentiment();

// Helper function to generate emotional context for AI
const getEmotionalContext = (sentimentScore) => {
  if (sentimentScore <= -4) {
    return "The user is expressing severe distress or negative emotions. Respond with maximum empathy, support, and if necessary, encourage seeking professional help.";
  } else if (sentimentScore <= -2) {
    return "The user is expressing moderate distress or negative emotions. Provide emotional support, validation, and gentle coping suggestions.";
  } else if (sentimentScore < 0) {
    return "The user is expressing mild negative emotions. Show understanding and offer gentle encouragement while validating their feelings.";
  } else if (sentimentScore === 0) {
    return "The user's emotional state is neutral or unclear. Help explore their feelings and encourage deeper expression.";
  } else if (sentimentScore <= 2) {
    return "The user is expressing mild positive emotions. Reinforce these positive feelings and explore what's working well.";
  } else if (sentimentScore <= 4) {
    return "The user is expressing moderate positive emotions. Celebrate their positive state and encourage reflection on what led to these good feelings.";
  } else {
    return "The user is expressing strong positive emotions. Share in their joy while helping them anchor and build upon these positive experiences.";
  }
};

// Test endpoint with API check
app.get('/api/test', async (req, res) => {
  try {
    // Test the Groq API connection
    const completion = await openai.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5
    });
    console.log('API Test Response:', completion);
    res.json({ status: 'ok', message: 'Backend server and API are running properly!' });
  } catch (error) {
    console.error('API Test Error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'API test failed',
      error: error.message 
    });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received chat request:', req.body);
    const { message, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Analyze sentiment
    const sentimentResult = sentimentAnalyzer.analyze(message);
    console.log('Sentiment analysis:', sentimentResult);
    const emotionalContext = getEmotionalContext(sentimentResult.score);

    // Format chat history for Groq
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    // Create system message with emotional context
    const systemMessage = {
      role: 'system',
      content: `You are an empathetic AI counselor named Kona, specialized in providing emotional support and guidance. 
                ${emotionalContext}
                Focus on: 
                1. Active listening and validation
                2. Emotional support and understanding
                3. Gentle guidance and coping strategies when appropriate
                4. Open-ended questions to encourage expression
                5. Maintaining a warm, supportive tone
                Always prioritize the user's emotional well-being and safety.
                Keep responses concise but meaningful, around 2-3 sentences.`
    };

    console.log('Preparing Groq API request with messages:', {
      systemMessage,
      history: formattedHistory,
      userMessage: message
    });

    console.log('Sending request to Groq...');
    // Get response from Groq
    const completion = await openai.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        systemMessage,
        ...formattedHistory,
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    console.log('Raw Groq API response:', completion);
    const aiResponse = completion.choices[0].message.content;
    console.log('Processed response from Groq:', aiResponse);

    res.json({
      response: aiResponse,
      sentiment: sentimentResult.score
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack
    });
    
    // Send appropriate error message based on the type of error
    if (error.response?.status === 429) {
      res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    } else if (error.response?.status === 401) {
      res.status(401).json({ error: 'Invalid Groq API key. Please check your configuration.' });
    } else if (error.message.includes('api_key')) {
      res.status(401).json({ error: 'Groq API key error: Please ensure your API key is properly configured.' });
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
      res.status(503).json({ error: 'Unable to connect to Groq API. Please try again later.' });
    } else if (error.message.includes('model')) {
      res.status(400).json({ error: 'Invalid model configuration. Please check the model name and try again.' });
    } else {
      res.status(500).json({ 
        error: 'An error occurred while processing your request',
        details: error.message 
      });
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for origins:`, allowedOrigins);
}); 