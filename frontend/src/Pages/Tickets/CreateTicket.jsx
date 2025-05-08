import React, { useState } from 'react';
import './CreateTicket.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const CreateTicket = () => {
  const [formData, setFormData] = useState({
    fullName: 'John Anderson',
    email: 'john.anderson@company.com',
    phone: '',
    company: 'Anderson Enterprises',
    subject: '',
    category: '',
    product: '',
    description: '',
    priority: 'medium',
    attachments: []
  });

  const [activeSection, setActiveSection] = useState('contact');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAttachmentAdd = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData({
        ...formData,
        attachments: [...formData.attachments, ...files]
      });
    }
  };

  const removeAttachment = (index) => {
    const updatedAttachments = [...formData.attachments];
    updatedAttachments.splice(index, 1);
    setFormData({
      ...formData,
      attachments: updatedAttachments
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
    // You can add API call to submit the ticket
  };

  const nextSection = () => {
    if (activeSection === 'contact') setActiveSection('ticket');
    else if (activeSection === 'ticket') setActiveSection('details');
    else if (activeSection === 'details') setActiveSection('attachments');
  };

  const prevSection = () => {
    if (activeSection === 'attachments') setActiveSection('details');
    else if (activeSection === 'details') setActiveSection('ticket');
    else if (activeSection === 'ticket') setActiveSection('contact');
  };

  return (
    <div className="support-ticket-page">
      <div className="support-ticket-container">
        <div className="support-panels-container">
          <div className="support-left-panel">
            <div className="support-ticket-illustration">
              <i className="fas fa-headset"></i>
            </div>
            <div className="support-panel-content">
              <h3>Need assistance?</h3>
              <p>Our support team is here to help you with any issues you might encounter.</p>
              <div className="support-progress-steps">
                <div className={`support-step ${activeSection === 'contact' ? 'active' : ''} ${activeSection !== 'contact' ? 'completed' : ''}`}>
                  <i className="fas fa-user"></i>
                  <span>Contact</span>
                </div>
                <div className={`support-step ${activeSection === 'ticket' ? 'active' : ''} ${activeSection === 'details' || activeSection === 'attachments' ? 'completed' : ''}`}>
                  <i className="fas fa-ticket-alt"></i>
                  <span>Ticket</span>
                </div>
                <div className={`support-step ${activeSection === 'details' ? 'active' : ''} ${activeSection === 'attachments' ? 'completed' : ''}`}>
                  <i className="fas fa-info-circle"></i>
                  <span>Details</span>
                </div>
                <div className={`support-step ${activeSection === 'attachments' ? 'active' : ''}`}>
                  <i className="fas fa-paperclip"></i>
                  <span>Files</span>
                </div>
              </div>
            </div>
          </div>

          <div className="support-right-panel">
            <div className="support-ticket-form-wrapper">
              <h2>Submit a Support Ticket</h2>
              <p className="support-form-subtitle">Please provide the details below to help us assist you better</p>
              
              <form className="support-ticket-form" onSubmit={handleSubmit}>
                {/* Contact Information Section */}
                <div className={`support-form-section ${activeSection === 'contact' ? 'active' : ''}`}>
                  <h3>Contact Information</h3>
                  
                  <div className="support-form-group">
                    <div className="support-input-field">
                      <i className="fas fa-user"></i>
                      <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName} 
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="support-form-group">
                    <div className="support-input-field">
                      <i className="fas fa-envelope"></i>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email} 
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="support-form-group">
                    <div className="support-input-field">
                      <i className="fas fa-phone"></i>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number (optional)" 
                      />
                    </div>
                  </div>
                  
                  <div className="support-form-group">
                    <div className="support-input-field">
                      <i className="fas fa-building"></i>
                      <input 
                        type="text" 
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Company/Organization"
                      />
                    </div>
                  </div>
                  
                  <div className="support-form-actions">
                    <button type="button" className="support-btn support-next-btn" onClick={nextSection}>Next <i className="fas fa-arrow-right"></i></button>
                  </div>
                </div>
                
                {/* Ticket Information Section */}
                <div className={`support-form-section ${activeSection === 'ticket' ? 'active' : ''}`}>
                  <h3>Ticket Information</h3>
                  
                  <div className="support-form-group">
                    <div className="support-input-field">
                      <i className="fas fa-tag"></i>
                      <input 
                        type="text" 
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Subject" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="support-form-group">
                    <div className="support-select-field">
                      <i className="fas fa-folder"></i>
                      <select 
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="technical">Technical Support</option>
                        <option value="billing">Billing & Payments</option>
                        <option value="account">Account Management</option>
                        <option value="feature">Feature Request</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="support-form-group">
                    <div className="support-select-field">
                      <i className="fas fa-cube"></i>
                      <select
                        name="product"
                        value={formData.product}
                        onChange={handleInputChange}
                      >
                        <option value="">Select a product/service</option>
                        <option value="payment_gateway">Payment Gateway</option>
                        <option value="crm">CRM Software</option>
                        <option value="ecommerce">E-commerce Platform</option>
                        <option value="api">API Integration</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="support-form-group">
                    <label>Priority Level</label>
                    <div className="support-priority-options">
                      <div className="support-priority-option">
                        <input 
                          type="radio" 
                          id="low" 
                          name="priority" 
                          value="low"
                          checked={formData.priority === 'low'}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="low">Low</label>
                      </div>
                      <div className="support-priority-option">
                        <input 
                          type="radio" 
                          id="medium" 
                          name="priority" 
                          value="medium"
                          checked={formData.priority === 'medium'}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="medium">Medium</label>
                      </div>
                      <div className="support-priority-option">
                        <input 
                          type="radio" 
                          id="high" 
                          name="priority" 
                          value="high"
                          checked={formData.priority === 'high'}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="high">High</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="support-form-actions">
                    <button type="button" className="support-btn support-back-btn" onClick={prevSection}><i className="fas fa-arrow-left"></i> Back</button>
                    <button type="button" className="support-btn support-next-btn" onClick={nextSection}>Next <i className="fas fa-arrow-right"></i></button>
                  </div>
                </div>
                
                {/* Issue Details Section */}
                <div className={`support-form-section ${activeSection === 'details' ? 'active' : ''}`}>
                  <h3>Issue Details</h3>
                  
                  <div className="support-form-group">
                    <label>Describe Your Issue</label>
                    <div className="support-rich-text-editor">
                      <div className="support-editor-toolbar">
                        <button type="button"><i className="fas fa-bold"></i></button>
                        <button type="button"><i className="fas fa-italic"></i></button>
                        <button type="button"><i className="fas fa-list-ul"></i></button>
                        <button type="button"><i className="fas fa-list-ol"></i></button>
                        <button type="button"><i className="fas fa-link"></i></button>
                      </div>
                      <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Please provide as much detail as possible about your issue..." 
                        required
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="support-form-actions">
                    <button type="button" className="support-btn support-back-btn" onClick={prevSection}><i className="fas fa-arrow-left"></i> Back</button>
                    <button type="button" className="support-btn support-next-btn" onClick={nextSection}>Next <i className="fas fa-arrow-right"></i></button>
                  </div>
                </div>
                
                {/* Attachments Section */}
                <div className={`support-form-section ${activeSection === 'attachments' ? 'active' : ''}`}>
                  <h3>Attachments</h3>
                  
                  <div className="support-form-group">
                    <div className="support-attachment-dropzone">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>Drag files here or click to browse</p>
                      <input 
                        type="file" 
                        id="file-upload"
                        onChange={handleAttachmentAdd}
                        multiple
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="file-upload" className="support-upload-btn">Choose Files</label>
                    </div>
                    <p className="support-form-note">Accepted file types: JPG, PNG, PDF, TXT, DOC, DOCX (Max 5MB per file)</p>
                  </div>
                  
                  <div className="support-attachment-list">
                    {formData.attachments.map((file, index) => (
                      <div className="support-attachment-item" key={index}>
                        <i className="fas fa-file"></i>
                        <span className="support-file-name">{file.name}</span>
                        <button 
                          type="button" 
                          className="support-remove-btn"
                          onClick={() => removeAttachment(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="support-form-actions">
                    <button type="button" className="support-btn support-back-btn" onClick={prevSection}><i className="fas fa-arrow-left"></i> Back</button>
                    <button type="submit" className="support-btn support-submit-btn">Submit Ticket</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;
