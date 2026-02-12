import React, { useState } from 'react';
import CustomRoleSelect from './CustomRoleSelect';
import { User as UserIcon, Eye, EyeOff } from 'lucide-react';
import './LoginScreen.css';
import apiService from '../services/api';

export function LoginScreen({ onLogin, devMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('doctor');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Prevent page from being covered by TopBar/Sidebar by using absolute/fixed positioning only for those, not here
  // Remove any 100vh/viewport height that causes zooming or overflow

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Use email and password for real login
      const data = await apiService.login({ email: username, password });
      onLogin(data.user || { name: username, role: selectedRole });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Dev mode: bypass login
  const handleDevLogin = () => {
    onLogin({ id: 'dev-user', name: username || 'Dev User', role: selectedRole });
  };

  const roleLabels = {
    nurse: 'Nurse',
    doctor: 'Doctor',
    admin: 'Admin',
    pharmacy: 'Pharmacy'
  };

  return (
    <div className="login-container">
      {/* Main Container */}
      <div className="login-card">
        {/* Left Side - Illustration */}
        <div className="login-illustration">
          <img 
            src="/home-page-image.png" 
            alt="Medical Team Illustration"
            loading="eager"
          />
        </div>
        {/* Right Side - Login Form */}
        <div className="login-form-container">
          {/* Hospital Header removed as requested */}
          {/* Welcome Header */}
          <div className="welcome-header">
            <h2 className="welcome-title">
              Welcome Back {roleLabels[selectedRole]}!
            </h2>
            <p className="welcome-subtitle">Lets get you Logged in</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            
            {/* Username Input */}
            <div>
              <div className="input-container">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="max.alan@hkgeneral.com"
                    className="form-input"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center', height: '100%' }}>
                    <UserIcon className="input-icon" style={{ color: '#9ca3af', width: '1.25rem', height: '1.25rem' }} />
                  </div>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="form-input password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff className="input-icon" /> : <Eye className="input-icon" />}
                  </button>
              </div>
            </div>

            {/* Role Dropdown */}
            <div>
              <div className="input-container">
                <div>
                  <UserIcon className="input-icon" />
                </div>
                <div style={{ width: '100%' }}>
                  <CustomRoleSelect
                    value={selectedRole}
                    onChange={setSelectedRole}
                    options={Object.entries(roleLabels).map(([role, label]) => ({ value: role, label }))}
                  />
                </div>
              </div>
            </div>

            {/* Remember Me & Need Help */}
            <div className="remember-section">
              <label className="remember-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="remember-checkbox"
                />
                <span className="remember-text">Remember Me !</span>
              </label>
              <button type="button" className="need-help-button">
                Need Help?
              </button>
            </div>


            {/* Error Message */}
            {error && <div className="login-error">{error}</div>}

            {/* Login Button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            {/* Dev Mode Bypass */}
            {devMode && (
              <button
                type="button"
                className="login-button dev-login"
                style={{ marginTop: 8, background: '#888' }}
                onClick={handleDevLogin}
              >
                Dev Login (Bypass Auth)
              </button>
            )}

            {/* Alternative Login Options */}
            <div className="alternative-login">
              <p className="alternative-login-text">Alternative Login Options</p>
              <div className="alternative-buttons">
                <button
                  type="button"
                  className="alternative-button"
                >
                  <svg className="alternative-button-icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="alternative-button-text">Login with Google</span>
                </button>
                <button
                  type="button"
                  className="alternative-button"
                >
                  <svg className="alternative-button-icon twitter-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span className="alternative-button-text">Login with Twitter</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
