import React, { useState } from 'react';
import { requestPasswordReset } from '../Services/authService';
import { useNavigate, Link } from 'react-router-dom';
import './Auth/Login.css'; // Fixed import path

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        
        try {
            await requestPasswordReset(email);
            setMessage('If an account exists with this email, you will receive a password reset link.');
        } catch (err) {
            // Handle different types of errors
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Failed to send reset link. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="forms-container">
                    <div className="signin-signup">
                        <form className="sign-in-form" onSubmit={handleSubmit}>
                            <h2 className="title">Reset Password</h2>
                            <p className="subtitle">Enter your email address and we'll send you a link to reset your password.</p>
                            
                            {message && (
                                <div className="success-message">
                                    <i className="fas fa-check-circle"></i>
                                    {message}
                                </div>
                            )}

                            {error && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {error}
                                </div>
                            )}

                            <div className="input-field">
                                <i className="fas fa-envelope"></i>
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="login-btn solid" 
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <div className="form-footer">
                                <Link to="/login" className="back-to-login">
                                    <i className="fas fa-arrow-left"></i> Back to Login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="panels-container">
                    <div className="panel left-panel">
                        <div className="content">
                            <h3>Forgot your password?</h3>
                            <p>Don't worry! It happens. Please enter your email address and we'll send you a link to reset your password.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword; 