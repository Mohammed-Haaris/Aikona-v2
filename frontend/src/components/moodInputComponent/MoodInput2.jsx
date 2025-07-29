/** @format */
import "./MoodInput.css";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import avatarImg from "../../assets/images/haaris3.jpg";
// import aiAvatar from "../../assets/images/ai-avatar.png";
const aiAvatar =
  "https://ui-avatars.com/api/?name=AI&background=141e30&color=fff&size=128";

// Get the API URL from environment variables or fallback to localhost
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const MoodInput2 = () => {
  const [moodText, setMoodText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "User";
  const profilePic =
    localStorage.getItem("profilePic") ||
    "https://ui-avatars.com/api/?name=User&background=0084ff&color=fff&size=128";

  // Check backend connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/test`);
        if (response.data.status === "ok") {
          setIsConnected(true);
          setError("");
          setApiKeyMissing(false);
        } else if (response.data.status === "api_key_missing") {
          setApiKeyMissing(true);
          setIsConnected(false);
          setError(
            "Groq API key not configured. Please check server configuration."
          );
        }
      } catch (err) {
        setIsConnected(false);
        if (err.response?.data?.status === "api_key_missing") {
          setApiKeyMissing(true);
          setError(
            "Groq API key not configured. Please check server configuration."
          );
        } else {
          setError("Cannot connect to AI service. Please try again later.");
        }
        console.error("Connection error:", err);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load chat history on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    axios
      .get(`${API_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.history) {
          setChatMessages(
            res.data.history.map((msg) => ({
              type: msg.type === "ai" ? "ai" : "user",
              text: msg.text,
            }))
          );
        }
      })
      .catch((err) => {
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      });
  }, [navigate]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showMenu &&
        !event.target.closest(".mobile-menu-button") &&
        !event.target.closest(".mobile-menu-dropdown")
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (!isConnected) {
      setError("Cannot connect to AI service. Please try again later.");
      return;
    }
    if (moodText.trim() === "") {
      setError("Please share your thoughts or feelings with me so I can help");
      setSuccess("");
      return;
    }
    const userMessage = { type: "user", text: moodText };
    setChatMessages((prev) => [...prev, userMessage]);
    setMoodText("");
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.post(
        `${API_URL}/api/chat`,
        {
          message: userMessage.text,
          chatHistory: chatMessages,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.response) {
        const aiMessage = { type: "ai", text: response.data.response };
        setChatMessages((prev) => [...prev, aiMessage]);
        setSuccess("");
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        localStorage.removeItem("token");
        navigate("/login");
      } else if (error.response?.data?.error?.includes("Rate limit")) {
        setError("AI service is busy. Please wait a moment and try again.");
      } else if (
        error.response?.data?.error?.includes("temporarily unavailable")
      ) {
        setError(
          "AI service is temporarily unavailable. Please try again in a few moments."
        );
      } else if (
        error.code === "ECONNABORTED" ||
        error.message.includes("timeout")
      ) {
        setError(
          "Request timed out. Please check your connection and try again."
        );
      } else {
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "I'm having trouble responding right now. Please try again.";
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  function clear() {
    setMoodText("");
    setError("");
    setSuccess("");
    setChatMessages([]);
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    setShowMenu(false);
    navigate("/login");
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleSettingsClick = () => {
    setShowMenu(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      <div
        className="container text-center mt-5"
        style={{ padding: 0, margin: 0, maxWidth: "100%" }}
      >
        <div
          className="chat-header"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(20,30,48,0.95)",
            color: "blanchedalmond",
            padding: "12px 20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flex: 1,
              minWidth: 0,
              overflow: "visible",
            }}
          >
            <img
              src={profilePic}
              alt={username}
              className="chat-header-avatar"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid blanchedalmond",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                minWidth: 0,
                overflow: "visible",
              }}
            >
              <span
                className="chat-header-title"
                style={{
                  fontWeight: 600,
                  fontSize: 20,
                  whiteSpace: "normal",
                  overflow: "visible",
                  textOverflow: "clip",
                  maxWidth: "none",
                  wordBreak: "break-word",
                  hyphens: "auto",
                }}
              >
                {username}
              </span>
              <span
                className="status-dot online"
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  background: "#00e676",
                  borderRadius: "50%",
                  flexShrink: 0,
                  boxShadow: "0 0 0 2px rgba(0, 230, 118, 0.2)",
                }}
              ></span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Desktop buttons - hidden on mobile */}

            {/* Three-dot menu button - positioned on the right */}
            <div className="mobile-menu-button" style={{ display: "block" }}>
              <button
                onClick={handleMenuToggle}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "blanchedalmond",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  minWidth: "40px",
                  height: "40px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.2)";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.1)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                ⋯
              </button>
            </div>
          </div>
        </div>

        {/* Three-dot Menu Dropdown */}
        {showMenu && (
          <div
            className="mobile-menu-dropdown"
            style={{
              position: "fixed",
              top: "70px",
              right: "15px",
              zIndex: 999,
              background: "rgba(20,30,48,0.98)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              padding: "8px 0",
              minWidth: "160px",
              animation: "slideDown 0.3s ease",
              display: "block",
            }}
          >
            <Link
              to="/settings"
              onClick={handleSettingsClick}
              style={{
                display: "block",
                padding: "12px 16px",
                color: "whitesmoke",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
              }}
            >
              ⚙️ Settings
            </Link>
            <button
              onClick={handleLogout}
              style={{
                display: "block",
                width: "100%",
                padding: "12px 16px",
                color: "#ff6b6b",
                background: "none",
                border: "none",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,107,107,0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
              }}
            >
              Logout
            </button>
          </div>
        )}

        {apiKeyMissing && (
          <div className="alert alert-danger">
            <strong>Configuration Required:</strong> Groq API key is not set up.
            Please add your GROQ_API_KEY to the backend .env file to enable AI
            chat functionality.
          </div>
        )}
        {!isConnected && !apiKeyMissing && (
          <div className="alert alert-warning">
            Trying to connect to AI service...
          </div>
        )}
        <div
          className="chat-container"
          style={{ marginTop: "80px", borderRadius: 0, boxShadow: "none" }}
        >
          <div className="messages-container">
            {chatMessages.length === 0 && (
              <div className="message ai-message">
                <div className="message-row">
                  <img
                    src={aiAvatar}
                    alt="AI-Kona"
                    className="avatar"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1.5px solid #0084ff",
                    }}
                  />
                  <div className="message-content">
                    <p>
                      Hello! 😊 I'm AI-Kona, your AI emotional support
                      companion. How are you feeling today? 🤗 I'm here to
                      listen and chat with you. 💙
                    </p>
                  </div>
                </div>
              </div>
            )}
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.type === "user" ? "user-message" : "ai-message"
                }`}
                style={{ marginBottom: 8 }}
              >
                <div
                  className="message-row"
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 8,
                    flexDirection:
                      message.type === "user" ? "row-reverse" : "row",
                  }}
                >
                  <img
                    src={message.type === "user" ? profilePic : aiAvatar}
                    alt={message.type === "user" ? username : "AI-Kona"}
                    className="avatar"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1.5px solid #0084ff",
                    }}
                  />
                  <div
                    className="message-content"
                    style={{
                      maxWidth: "85%",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    <p
                      style={{
                        whiteSpace: "pre-line",
                        textAlign: message.type === "user" ? "right" : "left",
                        margin: 0,
                        wordBreak: "break-word",
                      }}
                    >
                      {message.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai-message">
                <div
                  className="message-row"
                  style={{ display: "flex", alignItems: "flex-end", gap: 8 }}
                >
                  <img
                    src={aiAvatar}
                    alt="AI-Kona"
                    className="avatar"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1.5px solid #0084ff",
                    }}
                  />
                  <div
                    className="message-content typing-indicator"
                    style={{
                      background: "#232b3b",
                      borderRadius: 16,
                      padding: "10px 16px",
                      minWidth: 60,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: "#fff",
                    }}
                  >
                    <span
                      className="dot"
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        background: "#0084ff",
                        borderRadius: "50%",
                        animation: "typing 1s infinite alternate",
                      }}
                    ></span>
                    <span
                      className="dot"
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        background: "#0084ff",
                        borderRadius: "50%",
                        animation: "typing 1s infinite alternate 0.2s",
                      }}
                    ></span>
                    <span
                      className="dot"
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        background: "#0084ff",
                        borderRadius: "50%",
                        animation: "typing 1s infinite alternate 0.4s",
                      }}
                    ></span>
                  </div>
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
              style={{
                resize: "none",
                minHeight: "44px",
                maxHeight: "100px",
                width: "100%",
                boxSizing: "border-box",
              }}
            ></textarea>
            {error && <p className="text-danger error-msg">{error}</p>}
            {success && <p className="text-success">{success}</p>}
            <div className="chat-buttons mt-2">
              <button
                type="submit "
                disabled={isLoading || !isConnected}
                className={isLoading ? "loading" : "button"}
              >
                {isLoading ? "Sending..." : "Send"}
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
