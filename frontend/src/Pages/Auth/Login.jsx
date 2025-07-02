import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import auth from '../../Services/auth';

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(
    new URLSearchParams(location.search).get('signup') === 'true'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (auth.isLoggedIn()) {
      const user = auth.getCurrentUser();
      console.log('Already logged in user:', user); // Debug log
      
      if (user && user.role) {
        console.log('Redirecting already logged in user with role:', user.role); // Debug log
        switch (user.role) {
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'MANAGER':
            navigate('/manager/dashboard');
            break;
          case 'ENGINEER':
            navigate('/tickets/assigned');
            break;
          case 'CUSTOMER':
            navigate('/view-tickets');
            break;
          default:
            console.log('No specific role match for already logged in user, going to profile'); // Debug log
            navigate('/profile');
            break;
        }
      } else {
        console.log('No user or role found for already logged in user, going to profile'); // Debug log
        navigate('/profile');
      }
    }
    
    // Force a refresh of the Header component when this component mounts
    window.dispatchEvent(new Event('authChange'));
  }, [navigate]);

  // In handleLoginSubmit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', email); // Debug log
      
      // Use the auth service's Login function
      const response = await auth.login(email, password);
      console.log('Login response:', response); // Debug log
      
      if (response.success) {
        console.log('Login successful!'); // Debug log
        
        // If remember me is checked, store email in localStorage
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        window.dispatchEvent(new Event('authChange'));
        
        // Get user role from response data directly (more reliable)
        const user = response.user || auth.getCurrentUser();
        console.log('User after login:', user); // Debug log
        
        if (user && user.role) {
          console.log('Redirecting user with role:', user.role); // Debug log
          switch (user.role) {
            case 'ADMIN':
              navigate('/admin/dashboard');
              break;
            case 'MANAGER':
              navigate('/manager/dashboard');
              break;
            case 'ENGINEER':
              navigate('/tickets/assigned');
              break;
            case 'CUSTOMER':
              navigate('/view-tickets');
              break;
            default:
              console.log('No specific role match, going to profile'); // Debug log
              navigate('/profile');
              break;
          }
        } else {
          console.log('No user or role found, going to profile'); // Debug log
          navigate('/profile');
        }
      } else {
        // Handle unsuccessful login
        console.log('Login failed:', response.message); // Debug log
        setError(response.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // In handleRegisterSubmit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!regName || !regEmail || !regPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (regPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (regPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      
      // Create userData object as expected by the auth.register function
      const userData = {
        name: regName,
        email: regEmail,
        password: regPassword,
        confirmPassword: confirmPassword
      };
      
      // Pass the userData object to register
      const response = await auth.register(userData);
      
      if (response.success) {
        setSuccessMessage('Registration successful! Logging you in...');
        
        // The enhanced register function should handle auto-login
        // Just need to dispatch auth change event and redirect
        window.dispatchEvent(new Event('authChange'));
        
        // Get user role and redirect accordingly
        setTimeout(() => {
          const user = auth.getCurrentUser();
          console.log('User after registration:', user); // Debug log
          
          if (user && user.role) {
            console.log('Redirecting registered user with role:', user.role); // Debug log
            switch (user.role) {
              case 'ADMIN':
                navigate('/admin/dashboard');
                break;
              case 'MANAGER':
                navigate('/manager/dashboard');
                break;
              case 'ENGINEER':
                navigate('/tickets/assigned');
                break;
              case 'CUSTOMER':
                navigate('/view-tickets');
                break;
              default:
                console.log('No specific role match for registered user, going to profile'); // Debug log
                navigate('/profile');
                break;
            }
          } else {
            console.log('No user or role found for registered user, going to profile'); // Debug log
            navigate('/profile');
          }
        }, 500);
      } else {
        // Handle unsuccessful registration
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError('');
  };

  const handleSocialLogin = (provider) => {
    // Implementation would go here
    console.log(`Social login with ${provider} not implemented yet`);
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="login-page">
      <div className={`login-container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
        <div className="forms-container">
          <div className="signin-signup">
            <form className="sign-in-form" onSubmit={handleLoginSubmit}>
              <h2 className="title">Sign in</h2>
              {error && <div className="error-message">{error}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}
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
                  <input 
                    type="checkbox" 
                    id="remember" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
              </div>
              <button type="submit" className="login-btn solid" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

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
              {successMessage && <div className="success-message">{successMessage}</div>}
              <div className="input-field">
                <i className="fas fa-user"></i>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required 
                />
              </div>
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
              <div className="password-requirements">
                <small>Password must be at least 8 characters long</small>
              </div>
              <button type="submit" className="login-btn solid" disabled={isLoading}>
                {isLoading ? 'Signing up...' : 'Sign up'}
              </button>
  
              {/* <div className="social-login">
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
              </div> */}
            </form>
          </div>
        </div>
  
        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New here?</h3>
              <p>Create an account and start your journey with us today!</p>
              <button className="login-btn transparent" onClick={toggleMode} id="sign-up-btn">Sign up</button>
            </div>
          </div>
  
          <div className="panel right-panel">
            <div className="content">
              <h3>One of us?</h3>
              <p>Sign in to access your account and continue your experience.</p>
              <button className="login-btn transparent" onClick={toggleMode} id="sign-in-btn">Sign in</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
