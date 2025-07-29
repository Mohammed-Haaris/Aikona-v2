/** @format */

require("dotenv").config(); //dotenv is a library that allows you to use environment variables
const express = require("express"); //express is a library that allows you to create a server
const cors = require("cors"); //cors is a middleware that allows you to connect to the frontend
const sentiment = require("sentiment"); //sentiment is a library that analyzes the sentiment of a text
const mongoose = require("mongoose"); //mongoose is a library that allows you to connect to the database
const bcrypt = require("bcryptjs"); //bcrypt is a library that allows you to hash and compare passwords
const jwt = require("jsonwebtoken"); //jwt is a library that allows you to create and verify tokens
const User = require("./models/User"); // user is a model that allows you to create a user
const Message = require("./models/Message"); // message is a model that allows you to create a message
const multer = require("multer"); // multer is a library that allows you to upload files
const path = require("path"); // path is a library that allows you to join paths

const app = express(); // express is a library that allows you to create a server
const PORT = process.env.PORT || 5000; // port is the port that the server will run on

// Rate limiting for Groq API
const rateLimit = {
  requests: 0,
  resetTime: Date.now() + 60000, // 1 minute
  maxRequests: 50, // Increased limit for better user experience
};

function checkRateLimit() {
  const now = Date.now();
  if (now > rateLimit.resetTime) {
    rateLimit.requests = 0;
    rateLimit.resetTime = now + 60000;
  }

  if (rateLimit.requests >= rateLimit.maxRequests) {
    throw new Error(
      "Rate limit exceeded. Please wait a moment before trying again."
    );
  }

  rateLimit.requests++;
  return true;
}

// Retry mechanism for API calls
async function makeGroqRequest(messages, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(

        
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: messages,
            temperature: 0.7,
            max_tokens: 500, // Reduced to prevent payload issues
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          if (attempt < retries) {
            console.log(
              `Rate limit hit, retrying in ${attempt * 2} seconds...`
            );
            await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
            continue;
          }
          throw new Error(
            "Rate limit exceeded. Please wait a moment before trying again."
          );
        } else if (response.status === 413) {
          throw new Error("Message too long. Please try a shorter message.");
        } else if (response.status === 420) {
          throw new Error("API request format error. Please try again.");
        } else if (
          response.status === 500 ||
          response.status === 502 ||
          response.status === 503
        ) {
          if (attempt < retries) {
            console.log(
              `Server error ${response.status}, retrying in ${
                attempt * 2
              } seconds...`
            );
            await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
            continue;
          }
          throw new Error(
            "AI service temporarily unavailable. Please try again in a moment."
          );
        } else {
          throw new Error(`Groq API responded with status: ${response.status}`);
        }
      }

      const completion = await response.json();
      if (
        !completion.choices ||
        !completion.choices[0] ||
        !completion.choices[0].message
      ) {
        throw new Error("Invalid response format from AI service");
      }

      return completion.choices[0].message.content;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.log(`API call attempt ${attempt} failed:`, error.message);
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
}

// Enable CORS for all routes
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://aikona-frontend.onrender.com", "http://localhost:5173"]
        : "*",
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Sentiment analyzer
const sentimentAnalyzer = new sentiment();

// Function to get emotional context based on sentiment score
function getEmotionalContext(score) {
  if (score <= -5)
    return "I sense you're feeling quite negative. I'm here to support you.";
  if (score < 0)
    return "I notice you might be feeling a bit down. Would you like to talk about it?";
  if (score === 0) return "I'm here to listen and chat with you.";
  if (score <= 5)
    return "I sense some positivity in your message. Would you like to share more?";
  return "I can tell you're feeling quite positive! That's wonderful!";
}

// Test endpoint
app.get("/api/test", async (req, res) => {
  try {
    const testResponse = await makeGroqRequest([
      { role: "user", content: "Hello" },
    ]);

    console.log("API Test successful");
    res.json({
      status: "ok",
      message: "Backend server and API are running properly!",
    });
  } catch (error) {
    console.error("API Test Error:", error.message);

    // Check if it's an API key issue
    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      res.status(500).json({
        status: "api_key_missing",
        message: "API key not configured or invalid",
        error: "Please check your GROQ_API_KEY configuration",
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "API test failed",
        error: error.message,
      });
    }
  }
});

// Chat endpoint (authenticated, stores messages)
app.post("/api/chat", authenticateToken, async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    const userId = req.user.id;

    // Save user message
    await Message.create({ user: userId, text: message, type: "user" });

    // Check for creator question
    const lowerMessage = message.toLowerCase();
    if (
      lowerMessage.includes("who is your creator") ||
      lowerMessage.includes("who created you") ||
      lowerMessage.includes("your creator") ||
      lowerMessage.includes("who made you")
    ) {
      await Message.create({
        user: userId,
        text: "Mohammed Haaris is my creator. 👨‍💻✨",
        type: "ai",
      });
      return setTimeout(() => {
        res.json({ response: "Mohammed Haaris is my creator. 👨‍💻✨" });
      }, 1500); // Reduced delay
    }
    // Check for creator profession questions
    if (
      lowerMessage.includes("what does your creator do") ||
      lowerMessage.includes("tell me about your creator") ||
      lowerMessage.includes("who is mohammed haaris") ||
      lowerMessage.includes("about your creator")
    ) {
      await Message.create({
        user: userId,
        text: "He is my creator. He is a software developer. 💻🚀",
        type: "ai",
      });
      return setTimeout(() => {
        res.json({
          response: "He is my creator. He is a software developer. 💻🚀",
        });
      }, 1500); // Reduced delay
    }

    // Analyze sentiment
    const sentimentResult = sentimentAnalyzer.analyze(message);
    const emotionalContext = getEmotionalContext(sentimentResult.score);
    
    // Limit chat history to last 10 messages to prevent payload too large
    const limitedChatHistory = chatHistory.slice(-10);
    const messages = limitedChatHistory.map((msg) => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.text,
    }));
    
    messages.unshift({
      role: "system",
      content: `You are Aikona, an empathetic AI counselor. Be warm, understanding, and supportive. Use emojis naturally to enhance emotional connection. Current context: ${emotionalContext}`,
    });
    messages.push({ role: "user", content: message });
    // Check rate limit before making API call
    checkRateLimit();

    // Call Groq API with retry mechanism
    const aiResponse = await makeGroqRequest(messages);

    // Save AI message
    await Message.create({ user: userId, text: aiResponse, type: "ai" });

    // Reduced delay for better user experience
    setTimeout(() => {
      res.json({ response: aiResponse });
    }, 1500);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat history for logged-in user
app.get("/api/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({ user: userId }).sort({
      timestamp: 1,
    });
    res.json({ history: messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear chat history for logged-in user
app.delete("/api/clear-chat", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await Message.deleteMany({ user: userId });
    res.json({ message: "Chat history cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + "-" + Date.now() + ext);
  },
});

// File filter for multer
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Upload profile picture endpoint
app.post(
  "/api/upload-profile-pic",
  authenticateToken,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "No file uploaded. Please select an image file." });
      }

      // Validate file type
      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          error: "Only image files are allowed (JPEG, PNG, GIF, etc.)",
        });
      }

      // Validate file size
      if (req.file.size > 5 * 1024 * 1024) {
        return res
          .status(400)
          .json({ error: "File size must be less than 5MB" });
      }

      const url = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;

      // Update user's profilePic
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.profilePic = url;
      await user.save();

      console.log(`Profile picture updated for user ${user.username}: ${url}`);
      res.json({ profilePic: user.profilePic });
    } catch (err) {
      console.error("Profile picture upload error:", err);
      res
        .status(500)
        .json({ error: err.message || "Upload failed. Please try again." });
    }
  }
);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/aikona", {
  ssl: true,
  sslValidate: false,
  retryWrites: true,
  w: 'majority'
});

// JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// Signup endpoint
app.post("/api/signup", async (req, res) => {
  const { username, email, password, profilePic } = req.body;
  if (!username || !email || !password)
    return res
      .status(400)
      .json({ error: "Username, email and password required" });
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res
        .status(400)
        .json({ error: "Email or username already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed, profilePic });
    await user.save();
    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { username, email, password } = req.body;
  if ((!username && !email) || !password)
    return res
      .status(400)
      .json({ error: "Username or email and password required" });
  try {
    const user = await User.findOne(username ? { username } : { email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );
    res.json({ token, username: user.username, profilePic: user.profilePic });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
