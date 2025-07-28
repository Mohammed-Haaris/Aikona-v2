import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Fade, Slide } from 'react-awesome-reveal';
import './Auth.css';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const aiAvatar = "https://ui-avatars.com/api/?name=AI&background=141e30&color=fff&size=128";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('profilePic', data.profilePic);
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <Fade duration={1000} triggerOnce>
        <div className="auth-card">
          <Slide direction="down" duration={800} triggerOnce>
            <div className="auth-header">
              <div className="avatar-container">
                <img src={aiAvatar} alt="AI-Kona" className="auth-avatar" />
                <div className="avatar-glow"></div>
              </div>
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-subtitle">Sign in to continue your journey with AI-Kona</p>
            </div>
          </Slide>

          <Fade delay={300} duration={800} triggerOnce>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Username (optional)"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="auth-input"
                />
                <div className="input-icon">👤</div>
              </div>

              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="auth-input"
                />
                <div className="input-icon">📧</div>
              </div>

              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="auth-input"
                />
                <div className="input-icon">🔒</div>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <button 
                type="submit" 
                className={`auth-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              {error && (
                <Fade duration={500}>
                  <div className="auth-error">
                    <span className="error-icon">⚠️</span>
                    {error}
                  </div>
                </Fade>
              )}
            </form>
          </Fade>

          <Slide direction="up" delay={600} duration={800} triggerOnce>
            <div className="auth-footer">
              <p className="auth-link-text">
                Don't have an account? 
                <Link to="/signup" className="auth-link">
                  Create one here
                </Link>
              </p>
              <div style={{
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                marginTop: '16px',
                width: '100%'
              }}>
                <Link 
                  to="/" 
                  className="auth-link" 
                  style={{
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(0,132,255,0.1)',
                    border: '1px solid rgba(0,132,255,0.3)',
                    color: '#0084ff',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'inline-block',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0,132,255,0.2)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0,132,255,0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </Slide>
        </div>
      </Fade>
    </div>
  );
};

export default Login; 