/** @format */
import "./MoodInput.css";
import { useState, useEffect, useRef } from "react";
import axios from 'axios';

// Get the API URL from environment variables or fallback to localhost
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const MoodInput2 = () => {
  const [moodText, setMoodText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([
    { type: 'ai', text: "Hello! I'm AI-Kona, your AI emotional support companion. How are you feeling today? I'm here to listen and chat with you." }
  ]);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  // Check backend connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/test`);
        if (response.data.status === 'ok') {
          setIsConnected(true);
          setError("");
          setApiKeyMissing(false);
        } else if (response.data.status === 'api_key_missing') {
          setApiKeyMissing(true);
          setIsConnected(false);
          setError("OpenAI API key not configured. Please check server configuration.");
        }
      } catch (err) {
        setIsConnected(false);
        if (err.response?.data?.status === 'api_key_missing') {
          setApiKeyMissing(true);
          setError("OpenAI API key not configured. Please check server configuration.");
        } else {
          setError("Cannot connect to AI service. Please try again later.");
        }
        console.error("Connection error:", err);
      }
    };

    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isConnected) {
      setError("Cannot connect to AI service. Please try again later.");
      return;
    }

    if (moodText.trim() === "") {
      setError("Please share your thoughts or feelings with me so I can help");
      setSuccess("");
      return;
    }

    // Add user message to chat immediately
    const userMessage = { type: 'user', text: moodText };
    setChatMessages(prev => [...prev, userMessage]);
    setMoodText(""); // Clear input right away for better UX

    try {
      setIsLoading(true);
      setError("");
      
      // Call backend API
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: userMessage.text,
        chatHistory: chatMessages
      });

      if (response.data.response) {
        // Add AI response to chat
        const aiMessage = { type: 'ai', text: response.data.response };
        setChatMessages(prev => [...prev, aiMessage]);
        setSuccess(""); // Clear success message for cleaner chat
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.error || error.message || "I'm having trouble responding right now. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  function clear() {
    setMoodText("");
    setError("");
    setSuccess("");
    setChatMessages([
      { type: 'ai', text: "Hello! I'm AI-Kona, your AI emotional support companion. How are you feeling today? I'm here to listen and chat with you." }
    ]);
  }

  // Handle Enter key to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      <div className="container text-center mt-5">
        <h3 className="mb-3">Chat with AI-Kona</h3>
        {apiKeyMissing && (
          <div className="alert alert-danger">
            <strong>Configuration Required:</strong> OpenAI API key is not set up. 
            Please add your API key to the backend .env file to enable AI chat functionality.
          </div>
        )}
        {!isConnected && !apiKeyMissing && (
          <div className="alert alert-warning">
            Trying to connect to AI service...
          </div>
        )}
        
        <div className="chat-container">
          <div className="messages-container">
            {chatMessages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.type === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-content">
                  <p style={{ whiteSpace: 'pre-line', textAlign: message.type === 'user' ? 'right' : 'left' }}>
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai-message">
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSubmit}>
            <textarea
              rows={2}
              className="form-control chat-input"
              value={moodText}
              onChange={(e) => setMoodText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here... (Press Enter to send)"
              disabled={isLoading || !isConnected}
            ></textarea>
            {error && <p className="text-danger error-msg">{error}</p>}
            {success && <p className="text-success">{success}</p>}
            
            <div className="chat-buttons mt-2">
              <button 
                type="submit " 
                disabled={isLoading || !isConnected}
                className={isLoading ? 'loading' : 'button'} 
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
              <button 
                type="button" 
             
                className="button ms-3" 
                onClick={clear} 
                disabled={isLoading}
              >
                Clear Chat
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default MoodInput2;
