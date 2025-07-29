import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Fade, Slide } from 'react-awesome-reveal';
import './Auth.css';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
console.log('API_URL:', API_URL);
console.log('Environment variables:', import.meta.env);
const aiAvatar = "https://ui-avatars.com/api/?name=AI&background=141e30&color=fff&size=128";

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
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
              <h2 className="auth-title">Join AI-Kona</h2>
              <p className="auth-subtitle">Create your account and start your emotional journey</p>
            </div>
          </Slide>

          <Fade delay={300} duration={800} triggerOnce>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
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
                  placeholder="Password (min 6 characters)"
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

              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="auth-input"
                />
                <div className="input-icon">🔐</div>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
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
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
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

              {success && (
                <Fade duration={500}>
                  <div className="auth-success">
                    <span className="success-icon">✅</span>
                    {success}
                  </div>
                </Fade>
              )}
            </form>
          </Fade>

          <Slide direction="up" delay={600} duration={800} triggerOnce>
            <div className="auth-footer">
              <p className="auth-link-text">
                Already have an account? 
                <Link to="/login" className="auth-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </Slide>
        </div>
      </Fade>
    </div>
  );
};

export default Signup; 