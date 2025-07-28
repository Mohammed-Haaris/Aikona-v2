const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
  profilePic: { type: String, default: 'https://ui-avatars.com/api/?name=User&background=0084ff&color=fff&size=128' },
});

module.exports = mongoose.model('User', userSchema); 