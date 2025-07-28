import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Fade, Slide } from 'react-awesome-reveal';
import './Auth.css';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const aiAvatar = "https://ui-avatars.com/api/?name=AI&background=141e30&color=fff&size=128";

const Settings = () => {
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || 'https://ui-avatars.com/api/?name=User&background=0084ff&color=fff&size=128');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePic(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('profilePic', selectedFile);

    try {
      const res = await fetch(`${API_URL}/api/upload-profile-pic`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      
      if (res.ok && data.profilePic) {
        setProfilePic(data.profilePic);
        localStorage.setItem('profilePic', data.profilePic);
        setSuccess('Profile picture updated successfully!');
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('profile-pic-input');
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.error || 'Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('profilePic');
    navigate('/login');
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
              <h2 className="auth-title">Profile Settings</h2>
              <p className="auth-subtitle">Update your profile picture</p>
            </div>
          </Slide>

          <Fade delay={300} duration={800} triggerOnce>
            <div className="auth-form">
              <div className="profile-preview-container" style={{textAlign: 'center', marginBottom: '24px'}}>
                <img 
                  src={profilePic} 
                  alt="Profile Preview" 
                  style={{
                    width: 120, 
                    height: 120, 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '4px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                  }} 
                />
                <p style={{marginTop: '12px', color: '#bfc9da', fontSize: '14px'}}>
                  Current Profile Picture
                </p>
              </div>

              <div className="input-group">
                <input
                  id="profile-pic-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="auth-input"
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                />
                <div className="input-icon">📷</div>
              </div>

              {selectedFile && (
                <Fade duration={500}>
                  <div style={{
                    background: 'rgba(0,132,255,0.1)',
                    border: '1px solid rgba(0,132,255,0.3)',
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '16px'
                  }}>
                    <p style={{margin: 0, color: '#0084ff', fontSize: '14px'}}>
                      📁 Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                </Fade>
              )}

              <button 
                type="button" 
                className={`auth-button ${isLoading ? 'loading' : ''}`}
                onClick={handleUpload}
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  'Upload Picture'
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
            </div>
          </Fade>

          <Slide direction="up" delay={600} duration={800} triggerOnce>
            <div className="auth-footer">
              <div style={{
                display: 'flex', 
                gap: '16px', 
                justifyContent: 'center', 
                alignItems: 'center',
                flexDirection: 'row',
                marginTop: '8px',
                width: '100%',
                minHeight: '40px'
              }}>
                <Link 
                  to="/moodinput" 
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
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    marginTop:'16px'
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
                  ← Back to Chat
                </Link>
                <button 
                  onClick={handleLogout} 
                  style={{
                    background: 'rgba(255,107,107,0.1)',
                    border: '1px solid rgba(255,107,107,0.3)',
                    color: '#ff6b6b',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,107,107,0.2)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,107,107,0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </Slide>
        </div>
      </Fade>
    </div>
  );
};

export default Settings; 