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
      alert('Ticket created successfully!');
      navigate('/engineer/assigned-tickets');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="engineer-container">
      <h2>Create Support Ticket</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="ticket-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="product">Product</label>
          <select
            id="product"
            name="product"
            value={formData.product}
            onChange={handleChange}
            required
          >
            <option value="">Select Product</option>
            <option value="SOFTWARE">Software</option>
            <option value="HARDWARE">Hardware</option>
            <option value="NETWORK">Network</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="type">Ticket Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="INCIDENT">Incident</option>
            <option value="REQUEST">Request</option>
            <option value="PROBLEM">Problem</option>
            <option value="CHANGE">Change</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="urgency">Urgency</label>
          <select
            id="urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
            required
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="customerId">Customer ID</label>
          <input
            type="text"
            id="customerId"
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate('/engineer/assigned-tickets')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSupportTicket;
