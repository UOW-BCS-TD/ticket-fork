import React, { useState, useEffect } from 'react';
import './Manager.css';

const ManageEngineers = () => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEngineer, setNewEngineer] = useState({
    name: '',
    email: '',
    specialization: '',
    phone: ''
  });

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await axios.get('/api/engineers');
        setEngineers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch engineers');
        setLoading(false);
        console.error(err);
      }
    };

    fetchEngineers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEngineer({
      ...newEngineer,
      [name]: value
    });
  };

  const handleAddEngineer = async (e) => {
    e.preventDefault();
    try {
      // Replace with your actual API endpoint
      const response = await axios.post('/api/engineers', newEngineer);
      setEngineers([...engineers, response.data]);
      setNewEngineer({
        name: '',
        email: '',
        specialization: '',
        phone: ''
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add engineer:', err);
      alert('Failed to add engineer. Please try again.');
    }
  };

  const handleDeleteEngineer = async (id) => {
    if (window.confirm('Are you sure you want to delete this engineer?')) {
      try {
        // Replace with your actual API endpoint
        await axios.delete(`/api/engineers/${id}`);
        setEngineers(engineers.filter(engineer => engineer.id !== id));
      } catch (err) {
        console.error('Failed to delete engineer:', err);
        alert('Failed to delete engineer. Please try again.');
      }
    }
  };

  // Filter engineers based on search term
  const filteredEngineers = engineers.filter(engineer => 
    engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engineer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engineer.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="empty-state">Loading engineers...</div>;
  if (error) return <div className="empty-state">Error: {error}</div>;

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h1 className="manager-title">Engineer Management</h1>
        <div className="manager-actions">
          <button 
            className="action-button edit-button"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add New Engineer'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="add-form" style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <h2 style={{ marginTop: 0 }}>Add New Engineer</h2>
          <form onSubmit={handleAddEngineer}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={newEngineer.name}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newEngineer.email}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={newEngineer.specialization}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={newEngineer.phone}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '15px' }}>
              <button 
                type="submit" 
                className="action-button edit-button"
                style={{ padding: '10px 15px' }}
              >
                Add Engineer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="search-filter">
        <input
          type="text"
          placeholder="Search engineers..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredEngineers.length === 0 ? (
        <div className="empty-state">No engineers found</div>
      ) : (
        <table className="manager-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Specialization</th>
              <th>Phone</th>
              <th>Active Tickets</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEngineers.map((engineer) => (
              <tr key={engineer.id}>
                <td>{engineer.name}</td>
                <td>{engineer.email}</td>
                <td>{engineer.specialization}</td>
                <td>{engineer.phone}</td>
                <td>{engineer.activeTickets}</td>
                <td>
                  <span className={`status-badge status-${engineer.status === 'Active' ? 'active' : 'inactive'}`}>
                    {engineer.status}
                  </span>
                </td>
                <td>
                  <button className="action-button view-button">View</button>
                  <button className="action-button edit-button">Edit</button>
                  <button 
                    className="action-button delete-button"
                    onClick={() => handleDeleteEngineer(engineer.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageEngineers;
