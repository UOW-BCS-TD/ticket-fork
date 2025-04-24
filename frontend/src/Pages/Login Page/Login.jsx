import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    // Here you would typically make an API call to authenticate the user
    console.log('Login attempt with:', { email, password });
    
    // Redirect to home page after successful login
    navigate('/');
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!regEmail || !regPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (regPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Here you would typically make an API call to register the user
    console.log('Registration attempt with:', { email: regEmail, password: regPassword });
    
    // Redirect to home page after successful registration
    navigate('/');
  };

  const handleSocialLogin = (provider) => {
    // Here you would implement the social media authentication
    console.log(`Attempting to login with ${provider}`);
    // After successful authentication, redirect to home page
    // navigate('/');
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError('');
  };

  return (
    <div className="login-page">
      <div className={`login-container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
        <div className="forms-container">
          <div className="signin-signup">
            <form className="sign-in-form" onSubmit={handleLoginSubmit}>
              <h2 className="title">Sign in</h2>
              {error && <div className="error-message">{error}</div>}
              <div className="input-field">
                <i className="fas fa-user"></i>
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="input-field">
                <i className="fas fa-lock"></i>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="form-options">
                <div className="remember-me">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
              </div>
              <button type="submit" className="btn solid">Login</button>

              <div className="social-login">
                <p className="social-text">Or sign in with</p>
                <div className="social-media">
                  <button 
                    type="button" 
                    className="social-icon google"
                    onClick={() => handleSocialLogin('Google')}
                  >
                    <i className="fab fa-google"></i>
                  </button>
                  <button 
                    type="button" 
                    className="social-icon facebook"
                    onClick={() => handleSocialLogin('Facebook')}
                  >
                    <i className="fab fa-facebook-f"></i>
                  </button>
                  <button 
                    type="button" 
                    className="social-icon apple"
                    onClick={() => handleSocialLogin('Apple')}
                  >
                    <i className="fab fa-apple"></i>
                  </button>
                </div>
              </div>
            </form>

            <form className="sign-up-form" onSubmit={handleRegisterSubmit}>
              <h2 className="title">Sign up</h2>
              {error && <div className="error-message">{error}</div>}
              <div className="input-field">
                <i className="fas fa-envelope"></i>
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="input-field">
                <i className="fas fa-lock"></i>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="input-field">
                <i className="fas fa-lock"></i>
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="btn solid">Sign up</button>

              <div className="social-login">
                <p className="social-text">Or sign up with</p>
                <div className="social-media">
                  <button 
                    type="button" 
                    className="social-icon google"
                    onClick={() => handleSocialLogin('Google')}
                  >
                    <i className="fab fa-google"></i>
                  </button>
                  <button 
                    type="button" 
                    className="social-icon facebook"
                    onClick={() => handleSocialLogin('Facebook')}
                  >
                    <i className="fab fa-facebook-f"></i>
                  </button>
                  <button 
                    type="button" 
                    className="social-icon apple"
                    onClick={() => handleSocialLogin('Apple')}
                  >
                    <i className="fab fa-apple"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New here?</h3>
              <p>Create an account and start your journey with us today!</p>
              <button className="btn transparent" onClick={toggleMode} id="sign-up-btn">Sign up</button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>One of us?</h3>
              <p>Sign in to access your account and continue your experience.</p>
              <button className="btn transparent" onClick={toggleMode} id="sign-in-btn">Sign in</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;