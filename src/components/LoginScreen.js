import React, { useState, useRef, useEffect } from 'react';
import CustomRoleSelect from './CustomRoleSelect';
import { User as UserIcon, Eye, EyeOff, LogIn as RegisterIcon } from 'lucide-react';
import './LoginScreen.css';
import apiService from '../services/api';

export function LoginScreen({ onLogin, devMode }) {
  const devLoginBtnRef = useRef(null);
  // Hide Dev Login button if needed
  useEffect(() => {
    if (devLoginBtnRef.current) {
      devLoginBtnRef.current.style.display = 'none';
    }
  }, []); // Run once on mount
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('doctor');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Prevent page from being covered by TopBar/Sidebar by using absolute/fixed positioning only for those, not here
  // Remove any 100vh/viewport height that causes zooming or overflow

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Registration state
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'doctor',
    department: '',
    phoneNumber: '',
    specialization: '',
    licenseNumber: ''
  });
  const [signupError, setSignupError] = useState(null);
  const [signupLoading, setSignupLoading] = useState(false);

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError(null);
    setSignupLoading(true);
    try {
      // Replace with your baseUrl
      const baseUrl = process.env.REACT_APP_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Registration failed');
      }
      setShowSignup(false);
      alert('Registration successful! You can now log in.');
    } catch (err) {
      setSignupError(err.message || 'Registration failed');
    } finally {
      setSignupLoading(false);
    }
  };

  // Login handlers
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
                className="login-button dev-login ai-style-change-1"
                style={{ marginTop: 8, background: '#888' }}
                onClick={handleDevLogin}
                ref={devLoginBtnRef}
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
                  onClick={() => setShowSignup(true)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <RegisterIcon style={{ width: 18, height: 18, marginRight: 4, color: '#14b8a6' }} />
                  <span className="alternative-button-text">Register</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* Signup Modal */}
      {showSignup && (
        <div className="signup-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.2)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          padding: '1rem',
        }}>
          <div
            className="signup-card"
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem 1.5rem',
              maxWidth: 420,
              width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#0d9488', fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em' }}>
              <RegisterIcon style={{ verticalAlign: 'middle', marginRight: 8, color: '#14b8a6', width: 28, height: 28 }} />
              Register
            </h2>
            <form
              onSubmit={handleSignupSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}
            >
              <input name="email" type="email" value={signupData.email} onChange={handleSignupChange} placeholder="Email" required className="form-input" />
              <input name="password" type="password" value={signupData.password} onChange={handleSignupChange} placeholder="Password" required className="form-input" />
              <input name="firstName" type="text" value={signupData.firstName} onChange={handleSignupChange} placeholder="First Name" required className="form-input" />
              <input name="lastName" type="text" value={signupData.lastName} onChange={handleSignupChange} placeholder="Last Name" required className="form-input" />
              <select name="role" value={signupData.role} onChange={handleSignupChange} className="form-input">
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="admin">Admin</option>
                <option value="pharmacy">Pharmacy</option>
              </select>
              <input name="department" type="text" value={signupData.department} onChange={handleSignupChange} placeholder="Department" className="form-input" />
              <input name="phoneNumber" type="text" value={signupData.phoneNumber} onChange={handleSignupChange} placeholder="Phone Number" className="form-input" />
              <input name="specialization" type="text" value={signupData.specialization} onChange={handleSignupChange} placeholder="Specialization" className="form-input" />
              <input name="licenseNumber" type="text" value={signupData.licenseNumber} onChange={handleSignupChange} placeholder="License Number" className="form-input" />
              {signupError && <div className="login-error">{signupError}</div>}
              <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', marginTop: 8, width: '100%' }}>
                <button
                  type="submit"
                  className="login-button"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderTopRightRadius: '0.75rem',
                    borderBottomRightRadius: '0.75rem',
                  }}
                  disabled={signupLoading}
                >
                  <RegisterIcon style={{ width: 20, height: 20, marginRight: 4 }} />
                  {signupLoading ? 'Registering...' : 'Register'}
                </button>
                <button
                  type="button"
                  className="login-button"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: '#888',
                    marginTop: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderTopLeftRadius: '0.75rem',
                    borderBottomLeftRadius: '0.75rem',
                    border: '1.5px solid #e5e7eb',
                  }}
                  onClick={() => setShowSignup(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}