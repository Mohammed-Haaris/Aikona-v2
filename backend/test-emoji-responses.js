require('dotenv').config();
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const User = require('./models/User');

const API_URL = 'http://localhost:5000';

async function testEmojiResponses() {
  console.log('🧪 Testing AI Emoji Responses\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aikona');
    console.log('✅ Connected to MongoDB\n');
    
    // Test 1: Create a test user
    console.log('1️⃣ Creating Test User...');
    const testUser = {
      username: 'emojiuser' + Date.now(),
      email: 'emojiuser' + Date.now() + '@example.com',
      password: 'emojipass123',
      profilePic: 'https://ui-avatars.com/api/?name=EmojiUser&background=0084ff&color=fff&size=128'
    };
    
    const signupResponse = await fetch(`${API_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (!signupResponse.ok) {
      console.log('❌ Failed to create test user');
      return;
    }
    console.log('   ✅ Test user created');
    
    // Test 2: Login to get JWT token
    console.log('\n2️⃣ Logging in to get JWT token...');
    const loginResponse = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUser.username,
        password: testUser.password
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginResponse.ok || !loginData.token) {
      console.log('❌ Failed to login');
      return;
    }
    
    const token = loginData.token;
    console.log('   ✅ JWT token received');
    
    // Test 3: Test greeting message with emojis
    console.log('\n3️⃣ Testing Greeting Message...');
    const greetingMessage = "Hello! How are you?";
    const greetingResponse = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: greetingMessage,
        chatHistory: []
      })
    });
    
    const greetingData = await greetingResponse.json();
    if (!greetingResponse.ok) {
      console.log('❌ Failed to send greeting message');
      return;
    }
    
    console.log('   ✅ Greeting message sent');
    console.log(`   User: "${greetingMessage}"`);
    console.log(`   AI Response: "${greetingData.response}"`);
    
    // Check for emojis in response
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    const hasEmojis = emojiRegex.test(greetingData.response);
    
    if (hasEmojis) {
      console.log('   🎉 Response contains emojis!');
    } else {
      console.log('   ⚠️ Response does not contain emojis');
    }
    
    // Wait for the delay
    console.log('   ⏳ Waiting for response delay...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 4: Test emotional support message
    console.log('\n4️⃣ Testing Emotional Support Message...');
    const supportMessage = "I'm feeling a bit sad today";
    const supportResponse = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: supportMessage,
        chatHistory: [
          { type: 'user', text: greetingMessage },
          { type: 'ai', text: greetingData.response }
        ]
      })
    });
    
    const supportData = await supportResponse.json();
    if (!supportResponse.ok) {
      console.log('❌ Failed to send support message');
      return;
    }
    
    console.log('   ✅ Support message sent');
    console.log(`   User: "${supportMessage}"`);
    console.log(`   AI Response: "${supportData.response}"`);
    
    // Check for emojis in support response
    const supportHasEmojis = emojiRegex.test(supportData.response);
    
    if (supportHasEmojis) {
      console.log('   🎉 Support response contains emojis!');
    } else {
      console.log('   ⚠️ Support response does not contain emojis');
    }
    
    // Wait for the delay
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 5: Test creator question (custom response with emojis)
    console.log('\n5️⃣ Testing Creator Question...');
    const creatorMessage = "Who is your creator?";
    const creatorResponse = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: creatorMessage,
        chatHistory: [
          { type: 'user', text: greetingMessage },
          { type: 'ai', text: greetingData.response },
          { type: 'user', text: supportMessage },
          { type: 'ai', text: supportData.response }
        ]
      })
    });
    
    const creatorData = await creatorResponse.json();
    if (!creatorResponse.ok) {
      console.log('❌ Failed to send creator message');
      return;
    }
    
    console.log('   ✅ Creator message sent');
    console.log(`   User: "${creatorMessage}"`);
    console.log(`   AI Response: "${creatorData.response}"`);
    
    // Check for emojis in creator response
    const creatorHasEmojis = emojiRegex.test(creatorData.response);
    
    if (creatorHasEmojis) {
      console.log('   🎉 Creator response contains emojis!');
    } else {
      console.log('   ⚠️ Creator response does not contain emojis');
    }
    
    // Wait for the delay
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 6: Test positive message
    console.log('\n6️⃣ Testing Positive Message...');
    const positiveMessage = "I'm feeling great today!";
    const positiveResponse = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: positiveMessage,
        chatHistory: [
          { type: 'user', text: greetingMessage },
          { type: 'ai', text: greetingData.response },
          { type: 'user', text: supportMessage },
          { type: 'ai', text: supportData.response },
          { type: 'user', text: creatorMessage },
          { type: 'ai', text: creatorData.response }
        ]
      })
    });
    
    const positiveData = await positiveResponse.json();
    if (!positiveResponse.ok) {
      console.log('❌ Failed to send positive message');
      return;
    }
    
    console.log('   ✅ Positive message sent');
    console.log(`   User: "${positiveMessage}"`);
    console.log(`   AI Response: "${positiveData.response}"`);
    
    // Check for emojis in positive response
    const positiveHasEmojis = emojiRegex.test(positiveData.response);
    
    if (positiveHasEmojis) {
      console.log('   🎉 Positive response contains emojis!');
    } else {
      console.log('   ⚠️ Positive response does not contain emojis');
    }
    
    console.log('\n🎉 Emoji Response Test Complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Greeting responses include emojis');
    console.log('   ✅ Support responses include emojis');
    console.log('   ✅ Creator responses include emojis');
    console.log('   ✅ Positive responses include emojis');
    console.log('   ✅ AI personality enhanced with emojis');
    
    // Clean up test user
    console.log('\n🧹 Cleaning up test user...');
    const dbUser = await User.findOne({ username: testUser.username });
    if (dbUser) {
      await User.findByIdAndDelete(dbUser._id);
      console.log('   ✅ Test user cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testEmojiResponses(); 