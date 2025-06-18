import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../Services/authService';
import './Auth/Login.css'; // Fixed import path

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            await resetPassword(token, newPassword);
            setMessage('Password has been reset successfully');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            // Handle different types of errors
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Failed to reset password. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="login-page">
                <div className="login-container">
                    <div className="forms-container">
                        <div className="signin-signup">
                            <div className="sign-in-form">
                                <h2 className="title">Invalid Reset Link</h2>
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    The password reset link is invalid or has expired.
                                </div>
                                <div className="form-footer">
                                    <Link to="/forgot-password" className="back-to-login">
                                        <i className="fas fa-redo"></i> Request a new reset link
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="forms-container">
                    <div className="signin-signup">
                        <form className="sign-in-form" onSubmit={handleSubmit}>
                            <h2 className="title">Reset Password</h2>
                            <p className="subtitle">Please enter your new password below.</p>

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
                                <i className="fas fa-lock"></i>
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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

                            <button
                                type="submit"
                                className="login-btn solid"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'}
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
                            <h3>Set New Password</h3>
                            <p>Please enter your new password and confirm it to complete the reset process.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword; 