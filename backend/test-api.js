const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://api.groq.com/openai/v1'
});

async function testAPI() {
  try {
    console.log('Testing API connection...');
    const completion = await openai.chat.completions.create({
      model: 'mixtral-8x7b',
      messages: [{ role: 'user', content: 'Say hi!' }],
      max_tokens: 5
    });
    console.log('Success! Response:', completion.choices[0].message);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

testAPI(); 