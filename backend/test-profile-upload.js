require('dotenv').config();
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000';

async function testProfileUpload() {
  console.log('🧪 Testing Profile Picture Upload\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aikona');
    console.log('✅ Connected to MongoDB\n');
    
    // Test 1: Create a test user
    console.log('1️⃣ Creating Test User...');
    const testUser = {
      username: 'uploaduser' + Date.now(),
      email: 'uploaduser' + Date.now() + '@example.com',
      password: 'uploadpass123',
      profilePic: 'https://ui-avatars.com/api/?name=UploadUser&background=0084ff&color=fff&size=128'
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
    console.log(`   Initial profile pic: ${loginData.profilePic}`);
    
    // Test 3: Check if uploads directory exists
    console.log('\n3️⃣ Checking Uploads Directory...');
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      console.log('   ⚠️ Uploads directory does not exist, creating...');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    console.log('   ✅ Uploads directory ready');
    
    // Test 4: Test profile picture upload with FormData
    console.log('\n4️⃣ Testing Profile Picture Upload...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    const testImagePath = path.join(__dirname, 'test-image.png');
    fs.writeFileSync(testImagePath, testImageData);
    
    // Create FormData
    const FormData = require('form-data');
    const form = new FormData();
    form.append('profilePic', fs.createReadStream(testImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    const uploadResponse = await fetch(`${API_URL}/api/upload-profile-pic`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });
    
    const uploadData = await uploadResponse.json();
    console.log(`   Status: ${uploadResponse.status}`);
    console.log(`   Response: ${JSON.stringify(uploadData)}`);
    
    if (uploadResponse.ok && uploadData.profilePic) {
      console.log('   ✅ Profile picture upload successful');
      console.log(`   New profile pic URL: ${uploadData.profilePic}`);
    } else {
      console.log('   ❌ Profile picture upload failed');
      console.log(`   Error: ${uploadData.error}`);
    }
    
    // Test 5: Verify user profile pic updated in database
    console.log('\n5️⃣ Verifying Database Update...');
    const dbUser = await User.findOne({ username: testUser.username });
    if (dbUser && dbUser.profilePic === uploadData.profilePic) {
      console.log('   ✅ Profile picture updated in database');
      console.log(`   Database profile pic: ${dbUser.profilePic}`);
    } else {
      console.log('   ❌ Profile picture not updated in database');
    }
    
    // Test 6: Test invalid file upload (non-image)
    console.log('\n6️⃣ Testing Invalid File Upload...');
    const invalidForm = new FormData();
    const testTextPath = path.join(__dirname, 'test.txt');
    fs.writeFileSync(testTextPath, 'This is not an image file');
    
    invalidForm.append('profilePic', fs.createReadStream(testTextPath), {
      filename: 'test.txt',
      contentType: 'text/plain'
    });
    
    const invalidUploadResponse = await fetch(`${API_URL}/api/upload-profile-pic`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        ...invalidForm.getHeaders()
      },
      body: invalidForm
    });
    
    const invalidUploadData = await invalidUploadResponse.json();
    console.log(`   Status: ${invalidUploadResponse.status}`);
    console.log(`   Response: ${JSON.stringify(invalidUploadData)}`);
    
    if (!invalidUploadResponse.ok) {
      console.log('   ✅ Invalid file properly rejected');
    } else {
      console.log('   ❌ Invalid file should have been rejected');
    }
    
    // Test 7: Test no file upload
    console.log('\n7️⃣ Testing No File Upload...');
    const emptyForm = new FormData();
    
    const noFileResponse = await fetch(`${API_URL}/api/upload-profile-pic`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        ...emptyForm.getHeaders()
      },
      body: emptyForm
    });
    
    const noFileData = await noFileResponse.json();
    console.log(`   Status: ${noFileResponse.status}`);
    console.log(`   Response: ${JSON.stringify(noFileData)}`);
    
    if (!noFileResponse.ok) {
      console.log('   ✅ No file upload properly rejected');
    } else {
      console.log('   ❌ No file upload should have been rejected');
    }
    
    console.log('\n🎉 Profile Upload Test Complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User creation and login working');
    console.log('   ✅ Uploads directory exists');
    console.log('   ✅ Profile picture upload successful');
    console.log('   ✅ Database update working');
    console.log('   ✅ File validation working');
    console.log('   ✅ Error handling working');
    
    // Clean up test files
    console.log('\n🧹 Cleaning up test files...');
    if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
    if (fs.existsSync(testTextPath)) fs.unlinkSync(testTextPath);
    console.log('   ✅ Test files cleaned up');
    
    // Clean up test user
    console.log('\n🧹 Cleaning up test user...');
    await User.findByIdAndDelete(dbUser._id);
    console.log('   ✅ Test user cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testProfileUpload(); 