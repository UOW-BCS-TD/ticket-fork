import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTicket.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ticketAPI, productAPI, ticketTypeAPI, sessionAPI, userService, engineerAPI } from '../../services/api';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    product: { id: '' },
    type: { id: '' },
    session: { id: '' },
    urgency: 'MEDIUM',
    status: 'OPEN',
    engineer: { id: '' }
  });

  const [products, setProducts] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('contact');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const userResponse = await userService.getCurrentUserProfile();
        const user = userResponse.data || userResponse;
        setCurrentUser(user);
        console.log('Current user:', user);

        // Set default urgency based on customer role
        let defaultUrgency = 'LOW';
        if (user.role === 'VIP') defaultUrgency = 'HIGH';
        else if (user.role === 'PREMIUM') defaultUrgency = 'MEDIUM';
        else if (user.role === 'STANDARD') defaultUrgency = 'LOW';
        setFormData(prev => ({ ...prev, urgency: defaultUrgency }));
        setUserLoading(false);

        // Get products
        const productsResponse = await productAPI.getProducts();
        const productsData = productsResponse?.data ?? productsResponse;
        setProducts(productsData);
        console.log('Products:', productsData);

        // Get ticket types
        const ticketTypesResponse = await ticketTypeAPI.getTicketTypes();
        const ticketTypesData = ticketTypesResponse?.data ?? ticketTypesResponse;
        setTicketTypes(ticketTypesData);
        console.log('TicketTypes:', ticketTypesData);
      } catch (err) {
        setError('Failed to load initial data. Please try again.');
        setCurrentUser(null);
        setUserLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: { id: value || '' }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create a new session first
      const sessionResponse = await sessionAPI.createSession({ title: 'New Support Ticket', ticketSession: true });
      // Support both possible response formats
      const sessionId = sessionResponse?.data?.id || sessionResponse?.data?.data?.id;
      if (!sessionId) {
        setError('Failed to create session. Please try again.');
        setLoading(false);
        return;
      }

      // End the session right away
      await sessionAPI.endSession(sessionId);

      // Defensive fallback for possibly undefined objects
      const product = formData.product ?? { id: '' };
      const type = formData.type ?? { id: '' };

      // Fetch the product details to get the category
      let productCategory = null;
      if (product.id) {
        const selectedProduct = products.find(p => p.id == product.id);
        // Map product name to backend category enum
        const productNameToCategory = {
          "Model S": "MODEL_S",
          "Model 3": "MODEL_3",
          "Model X": "MODEL_X",
          "Model Y": "MODEL_Y",
          "Cybertruck": "CYBERTRUCK"
        };
        productCategory = productNameToCategory[selectedProduct?.name];
        console.log('Selected product:', selectedProduct);
        console.log('Product category:', productCategory);
      } else {
        console.log('No product selected');
      }

      // Find available level 1 engineer for the product's category
      let assignedEngineer = null;
      if (productCategory) {
        console.log('Calling engineerAPI.getAvailableLevel1Engineer with category:', productCategory);
        assignedEngineer = await engineerAPI.getAvailableLevel1Engineer(productCategory);
        console.log('Assigned engineer:', assignedEngineer);
      } else {
        console.log('No product category, skipping engineer API call');
      }
      // If no engineer is found, show error and stop
      if (!assignedEngineer) {
        setError('No available engineer found for this product category. Please try again later.');
        setLoading(false);
        return;
      }

      // Build the request body, assign engineer if found
      if (!currentUser?.customerId) {
        setError('Customer profile not found. Cannot create ticket.');
        setLoading(false);
        return;
      }
      const ticketBody = {
        title: formData.title,
        description: formData.description,
        product: { id: product.id || '' },
        type: { id: type.id || '' },
        session: { id: sessionId },
        urgency: formData.urgency,
        status: formData.status,
        engineer: { id: assignedEngineer.id },
        customer: { id: currentUser.customerId }
      };
      const response = await ticketAPI.createTicket(ticketBody);
      const ticketId = response?.id || response?.data?.id;
      if (!ticketId) {
        setError('Failed to create ticket. Please try again.');
        console.error('Ticket creation response:', response);
        setLoading(false);
        return;
      }
      alert('Ticket created successfully!');
      navigate(`/tickets/${ticketId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket. Please try again.');
      console.error('Error creating ticket:', err);
    } finally {
      setLoading(false);
    }
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

  if (userLoading) {
    return <div>Loading user info...</div>;
  }

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
              
              {error && <div className="error-message">{error}</div>}
              
              <form className="support-ticket-form" onSubmit={handleSubmit}>
                {/* Contact Information Section */}
                <div className={`support-form-section ${activeSection === 'contact' ? 'active' : ''}`}>
                  <h3>Contact Information</h3>
                  
                  <div className="support-form-group">
                    <div className="support-input-field">
                      <i className="fas fa-user"></i>
                      <input 
                        type="text" 
                        value={currentUser?.name || ''}
                        disabled
                        placeholder="Full Name"
                      />
                    </div>
                  </div>
                  
                  <div className="support-form-group">
                    <div className="support-input-field">
                      <i className="fas fa-envelope"></i>
                      <input 
                        type="email" 
                        value={currentUser?.email || ''}
                        disabled
                        placeholder="Email Address"
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
                        name="title"
                        value={formData.title || ''}
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
                        name="type"
                        value={formData.type?.id || ''}
                        onChange={handleSelectChange}
                        required
                      >
                        <option value="">Select a ticket type</option>
                        {Array.isArray(ticketTypes) && ticketTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="support-form-group">
                    <div className="support-select-field">
                      <i className="fas fa-cube"></i>
                      <select
                        name="product"
                        value={formData.product?.id || ''}
                        onChange={handleSelectChange}
                        required
                      >
                        <option value="">Select a product</option>
                        {Array.isArray(products) && products.map(product => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Priority Level Section */}
                  {currentUser?.role !== 'CUSTOMER' && (
                    <div className="support-form-group">
                      <label>Priority Level</label>
                      <div className="support-priority-options">
                        <div className="support-priority-option">
                          <input 
                            type="radio" 
                            id="low" 
                            name="urgency" 
                            value="LOW"
                            checked={formData.urgency === 'LOW'}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="low">Low</label>
                        </div>
                        <div className="support-priority-option">
                          <input 
                            type="radio" 
                            id="medium" 
                            name="urgency" 
                            value="MEDIUM"
                            checked={formData.urgency === 'MEDIUM'}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="medium">Medium</label>
                        </div>
                        <div className="support-priority-option">
                          <input 
                            type="radio" 
                            id="high" 
                            name="urgency" 
                            value="HIGH"
                            checked={formData.urgency === 'HIGH'}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="high">High</label>
                        </div>
                        <div className="support-priority-option">
                          <input 
                            type="radio" 
                            id="critical" 
                            name="urgency" 
                            value="CRITICAL"
                            checked={formData.urgency === 'CRITICAL'}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="critical">Critical</label>
                        </div>
                      </div>
                    </div>
                  )}
                  
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
                      <textarea 
                        name="description"
                        value={formData.description || ''}
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
                
                {/* Submit Section */}
                <div className={`support-form-section ${activeSection === 'attachments' ? 'active' : ''}`}>
                  <h3>Review and Submit</h3>
                  
                  <div className="support-form-group">
                    <div className="ticket-summary">
                      <h4>Ticket Summary</h4>
                      <p><strong>Title:</strong> {formData.title}</p>
                      <p><strong>Type:</strong> {Array.isArray(ticketTypes) && ticketTypes.find(t => t.id == formData.type?.id)?.name || 'Not selected'}</p>
                      <p><strong>Product:</strong> {Array.isArray(products) && products.find(p => p.id == formData.product?.id)?.name || 'Not selected'}</p>
                      <p><strong>Description:</strong> {formData.description}</p>
                    </div>
                  </div>
                  
                  <div className="support-form-actions">
                    <button type="button" className="support-btn support-back-btn" onClick={prevSection}><i className="fas fa-arrow-left"></i> Back</button>
                    <button 
                      type="submit" 
                      className="support-btn support-submit-btn"
                      disabled={loading}
                    >
                      {loading ? 'Creating Ticket...' : 'Submit Ticket'}
                    </button>
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
