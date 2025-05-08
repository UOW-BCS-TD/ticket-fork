import React, { useState } from 'react';
import './Admin.css';

const SystemSettings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Techcare Support System',
    siteDescription: 'Customer support and ticket management system',
    maintenanceMode: false,
    allowRegistration: true,
    defaultUserRole: 'CUSTOMER'
  });
  
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: 'support@example.com',
    smtpPassword: '********',
    fromEmail: 'support@example.com',
    fromName: 'Techcare Support'
  });
  
  const [ticketSettings, setTicketSettings] = useState({
    autoAssign: true,
    defaultPriority: 'MEDIUM',
    allowAttachments: true,
    maxAttachmentSize: 10,
    notifyAdmins: true
  });
  
  const handleGeneralSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleEmailSettingsChange = (e) => {
    const { name, value } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: value
    });
  };
  
  const handleTicketSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTicketSettings({
      ...ticketSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSaveSettings = (e) => {
    e.preventDefault();
    // Here you would call your API to save the settings
    alert('Settings saved successfully!');
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>System Settings</h1>
        <p>Configure system-wide settings and preferences</p>
      </div>

      <div className="admin-content">
        <div className="settings-container">
          <form onSubmit={handleSaveSettings}>
            <div className="settings-section">
              <h2>General Settings</h2>
              <div className="settings-grid">
                <div className="form-group">
                  <label htmlFor="siteName">Site Name</label>
                  <input 
                    type="text" 
                    id="siteName" 
                    name="siteName" 
                    value={generalSettings.siteName}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="siteDescription">Site Description</label>
                  <input 
                    type="text" 
                    id="siteDescription" 
                    name="siteDescription" 
                    value={generalSettings.siteDescription}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                
                <div className="form-group checkbox">
                  <label>
                    <input 
                      type="checkbox" 
                      name="maintenanceMode" 
                      checked={generalSettings.maintenanceMode}
                      onChange={handleGeneralSettingsChange}
                    />
                    Maintenance Mode
                  </label>
                  <small>When enabled, only administrators can access the site</small>
                </div>
                
                <div className="form-group checkbox">
                  <label>
                    <input 
                      type="checkbox" 
                      name="allowRegistration" 
                      checked={generalSettings.allowRegistration}
                      onChange={handleGeneralSettingsChange}
                    />
                    Allow User Registration
                  </label>
                  <small>Allow new users to register accounts</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="defaultUserRole">Default User Role</label>
                  <select 
                    id="defaultUserRole" 
                    name="defaultUserRole" 
                    value={generalSettings.defaultUserRole}
                    onChange={handleGeneralSettingsChange}
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="ENGINEER">Engineer</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                  <small>Role assigned to new users upon registration</small>
                </div>
              </div>
            </div>
            
            <div className="settings-section">
              <h2>Email Settings</h2>
              <div className="settings-grid">
                <div className="form-group">
                  <label htmlFor="smtpServer">SMTP Server</label>
                  <input 
                    type="text" 
                    id="smtpServer" 
                    name="smtpServer" 
                    value={emailSettings.smtpServer}
                    onChange={handleEmailSettingsChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="smtpPort">SMTP Port</label>
                  <input 
                    type="number" 
                    id="smtpPort" 
                    name="smtpPort" 
                    value={emailSettings.smtpPort}
                    onChange={handleEmailSettingsChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="smtpUsername">SMTP Username</label>
                  <input 
                    type="text" 
                    id="smtpUsername" 
                    name="smtpUsername" 
                    value={emailSettings.smtpUsername}
                    onChange={handleEmailSettingsChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="smtpPassword">SMTP Password</label>
                  <input 
                    type="password" 
                    id="smtpPassword" 
                    name="smtpPassword" 
                    value={emailSettings.smtpPassword}
                    onChange={handleEmailSettingsChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="fromEmail">From Email</label>
                  <input 
                    type="email" 
                    id="fromEmail" 
                    name="fromEmail" 
                    value={emailSettings.fromEmail}
                    onChange={handleEmailSettingsChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="fromName">From Name</label>
                  <input 
                    type="text" 
                    id="fromName" 
                    name="fromName" 
                    value={emailSettings.fromName}
                    onChange={handleEmailSettingsChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="settings-section">
              <h2>Ticket Settings</h2>
              <div className="settings-grid">
                <div className="form-group checkbox">
                  <label>
                    <input 
                      type="checkbox" 
                      name="autoAssign" 
                      checked={ticketSettings.autoAssign}
                      onChange={handleTicketSettingsChange}
                    />
                    Auto-assign Tickets
                  </label>
                  <small>Automatically assign new tickets to available engineers</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="defaultPriority">Default Priority</label>
                  <select 
                    id="defaultPriority" 
                    name="defaultPriority" 
                    value={ticketSettings.defaultPriority}
                    onChange={handleTicketSettingsChange}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                
                <div className="form-group checkbox">
                  <label>
                  <input 
                      type="checkbox" 
                      name="allowAttachments" 
                      checked={ticketSettings.allowAttachments}
                      onChange={handleTicketSettingsChange}
                    />
                    Allow Attachments
                  </label>
                  <small>Allow users to attach files to tickets</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="maxAttachmentSize">Max Attachment Size (MB)</label>
                  <input 
                    type="number" 
                    id="maxAttachmentSize" 
                    name="maxAttachmentSize" 
                    value={ticketSettings.maxAttachmentSize}
                    onChange={handleTicketSettingsChange}
                  />
                </div>
                
                <div className="form-group checkbox">
                  <label>
                    <input 
                      type="checkbox" 
                      name="notifyAdmins" 
                      checked={ticketSettings.notifyAdmins}
                      onChange={handleTicketSettingsChange}
                    />
                    Notify Administrators
                  </label>
                  <small>Send email notifications to admins for new tickets</small>
                </div>
              </div>
            </div>
            
            <div className="settings-actions">
              <button type="button" className="cancel-btn">Cancel</button>
              <button type="submit" className="save-btn">Save Settings</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;

