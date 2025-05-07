import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ResourcesAndGuides.css';

const ResourcesAndGuides = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResources, setFilteredResources] = useState([]);

  // Sample resources data
  const resourcesData = [
    {
      id: 1,
      title: 'Getting Started Guide',
      description: 'Everything you need to know to set up your support system',
      content: 'This comprehensive guide walks you through the initial setup process, from creating your account to configuring your first support workflow.',
      icon: 'fas fa-rocket',
      category: 'beginner'
    },
    {
      id: 2,
      title: 'AI Assistant Configuration',
      description: 'Maximize the potential of our AI-powered support tools',
      content: 'Learn how to train and customize our AI assistant to handle your specific customer inquiries and provide accurate, helpful responses.',
      icon: 'fas fa-robot',
      category: 'advanced'
    },
    {
      id: 3,
      title: 'Ticket Management Best Practices',
      description: 'Optimize your support workflow for efficiency',
      content: 'Discover proven strategies for categorizing, prioritizing, and resolving support tickets to minimize response time and maximize customer satisfaction.',
      icon: 'fas fa-tasks',
      category: 'intermediate'
    },
    {
      id: 4,
      title: 'Analytics & Reporting Guide',
      description: 'Turn support data into actionable insights',
      content: 'This guide shows you how to use our reporting tools to identify trends, measure team performance, and make data-driven decisions to improve your support operations.',
      icon: 'fas fa-chart-line',
      category: 'advanced'
    },
    {
      id: 5,
      title: 'Integration with CRM Systems',
      description: 'Connect your support platform with your customer database',
      content: 'Step-by-step instructions for integrating our platform with popular CRM systems to create a seamless customer experience across all touchpoints.',
      icon: 'fas fa-plug',
      category: 'advanced'
    },
    {
      id: 6,
      title: 'Customer Communication Templates',
      description: 'Pre-written responses for common scenarios',
      content: 'A collection of customizable templates for various support situations, helping your team respond quickly and consistently to customer inquiries.',
      icon: 'fas fa-comment-dots',
      category: 'beginner'
    }
  ];

  useEffect(() => {
    // Set visible after component mounts to trigger animation
    setIsVisible(true);
    // Initialize filtered resources with all resources
    setFilteredResources(resourcesData);
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchTerm.trim() === '') {
      setFilteredResources(resourcesData);
      return;
    }
    
    const filtered = resourcesData.filter(resource => 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredResources(filtered);
  };

  return (
    <div className="rg-container">
      <div className={`rg-header ${isVisible ? 'animate-intro' : ''}`}>
        <div className="rg-header-content">
          <h1 className="animate-item">Resources & Guides</h1>
          <p className="animate-item">Comprehensive documentation to help you get the most out of our platform</p>
        </div>
      </div>

      <div className="rg-main">
      <section className="rg-section search-section">
        <div className="rg-section-header">
          <h2>Find What You Need</h2>
          <div className="rg-section-divider"></div>
        </div>
        
        <form className="search-bar" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search for guides, tutorials, and more..." 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button type="submit" className="search-button">Search</button>
        </form>
        
        <div className="rg-category-filters">
          <button className="rg-category-filter active" onClick={() => setFilteredResources(resourcesData)}>
            All
          </button>
          <button className="rg-category-filter" onClick={() => setFilteredResources(resourcesData.filter(r => r.category === 'beginner'))}>
            Beginner
          </button>
          <button className="rg-category-filter" onClick={() => setFilteredResources(resourcesData.filter(r => r.category === 'intermediate'))}>
            Intermediate
          </button>
          <button className="rg-category-filter" onClick={() => setFilteredResources(resourcesData.filter(r => r.category === 'advanced'))}>
            Advanced
          </button>
        </div>
      </section>

        <section className="rg-section resources-list">
          <div className="rg-section-header">
            <h2>Available Resources</h2>
            <div className="rg-section-divider"></div>
          </div>
          
          {filteredResources.length > 0 ? (
            <div className="rg-resources-grid">
              {filteredResources.map((resource) => (
                <div className="rg-resource-card" key={resource.id}>
                  <div className="rg-resource-icon">
                    <i className={resource.icon}></i>
                  </div>
                  <h3>{resource.title}</h3>
                  <div className="rg-resource-description">{resource.description}</div>
                  <div className="rg-resource-content">{resource.content}</div>
                  <div className="rg-resource-footer">
                    <span className={`rg-resource-category ${resource.category}`}>
                      {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                    </span>
                    <Link to={`/resources/${resource.id}`} className="rg-resource-link">
                      Read More <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rg-no-resources">
              <i className="fas fa-search"></i>
              <h3>No resources found</h3>
              <p>Try adjusting your search terms or browse all resources</p>
              <button className="rg-reset-search" onClick={() => {
                setSearchTerm('');
                setFilteredResources(resourcesData);
              }}>
                View All Resources
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ResourcesAndGuides;
