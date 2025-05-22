import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Engineer.css';

const CreateSupportTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    product: '',
    type: '',
    urgency: 'MEDIUM',
    customerId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create ticket');
      }

      const data = await response.json();
      navigate('/engineer/assigned-tickets', { 
        state: { success: true, message: 'Ticket created successfully!' } 
      });
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="engineer-page">
      <div className="engineer-header">
        <h1>Create Support Ticket</h1>
        <p>Create a new support ticket for a customer</p>
      </div>
      
      {error && (
        <div className="engineer-error animate-fade-in">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={`ticket-form ${isSubmitting ? 'form-submitting' : ''}`}>
        <div className="engineer-form-group animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="engineer-form-group animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            required
            disabled={loading}
          ></textarea>
        </div>
        
        <div className="engineer-form-group animate-slide-in" style={{ animationDelay: '0.3s' }}>
          <label htmlFor="product">Product</label>
          <select
            id="product"
            name="product"
            value={formData.product}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select Product</option>
            <option value="SOFTWARE">Software</option>
            <option value="HARDWARE">Hardware</option>
            <option value="NETWORK">Network</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        
        <div className="engineer-form-group animate-slide-in" style={{ animationDelay: '0.4s' }}>
          <label htmlFor="type">Ticket Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select Type</option>
            <option value="INCIDENT">Incident</option>
            <option value="REQUEST">Request</option>
            <option value="PROBLEM">Problem</option>
            <option value="CHANGE">Change</option>
          </select>
        </div>
        
        <div className="engineer-form-group animate-slide-in" style={{ animationDelay: '0.5s' }}>
          <label htmlFor="urgency">Urgency</label>
          <select
            id="urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
        
        <div className="engineer-form-group animate-slide-in" style={{ animationDelay: '0.6s' }}>
          <label htmlFor="customerId">Customer ID</label>
          <input
            type="text"
            id="customerId"
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <div className="engineer-form-hint">Enter the customer's unique identifier</div>
        </div>
        
        <div className="form-actions animate-slide-in" style={{ animationDelay: '0.7s' }}>
          <button type="submit" className="engineer-btn-primary" disabled={loading}>
            {loading ? (
              <span className="button-loading">
                <span className="loading-spinner"></span>
                Creating...
              </span>
            ) : 'Create Ticket'}
          </button>
          <button 
            type="button" 
            className="engineer-btn-secondary"
            onClick={() => navigate('/engineer/assigned-tickets')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
      
      {loading && (
        <div className="form-overlay">
          <div className="engineer-loading">
            <div className="engineer-loader"></div>
            <p>Creating ticket...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSupportTicket;
