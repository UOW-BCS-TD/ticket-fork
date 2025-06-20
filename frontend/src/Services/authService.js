import axios from 'axios';

export const requestPasswordReset = async (email) => {
    try {
        const response = await axios.post('/api/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error('Failed to send reset link. Please try again later.');
        }
    }
};

export const resetPassword = async (token, newPassword) => {
    try {
        const response = await axios.post('/api/auth/reset-password', { token, newPassword });
        return response.data;
    } catch (error) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error('Failed to reset password. Please try again later.');
        }
    }
}; 