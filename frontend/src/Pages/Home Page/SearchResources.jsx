import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SearchResources.css';

const resourcesData = [
  { 
    id: 1,
    title: 'Tesla Model 3 Troubleshooting Guide', 
    description: 'Common issues and solutions for Tesla Model 3 owners',
    content: 'This comprehensive guide covers the most frequent technical issues reported by Tesla Model 3 owners, including touchscreen responsiveness, battery optimization, regenerative braking adjustments, and software update troubleshooting. Learn step-by-step solutions that can resolve many problems without requiring service center visits.',
    imageSrc: '/tesla-eg1.png',
    icon: 'fas fa-car',
    category: 'troubleshooting'
  },
  { 
    id: 2,
    title: 'Maximizing Tesla Battery Life', 
    description: 'Best practices for extending your Tesla battery longevity',
    content: 'Discover proven techniques to maximize your Tesla battery lifespan, including optimal charging habits (20-80% daily charging), temperature management during extreme weather, and how to properly prepare your vehicle for long-term storage. This guide includes real data from long-term Tesla owners who have maintained over 90% battery capacity after 100,000 miles.',
    imageSrc: '/tesla-eg2.png',
    icon: 'fas fa-battery-full',
    category: 'maintenance'
  },
  { 
    id: 3,
    title: 'Tesla Autopilot & FSD Features Explained', 
    description: 'Understanding Tesla\'s driver assistance technologies',
    content: 'Navigate the differences between Tesla\'s Autopilot, Enhanced Autopilot, and Full Self-Driving capabilities with this detailed breakdown. Learn how to properly use each feature, understand their limitations, troubleshoot common issues, and stay updated with the latest software improvements. Includes safety tips and regulatory information that every Tesla owner should know.',
    imageSrc: '/tesla-eg3.jpg',
    icon: 'fas fa-robot',
    category: 'features'
  },
  { 
    id: 4,
    title: 'Tesla Home Charging Setup Guide', 
    description: 'Everything you need to know about setting up home charging',
    content: 'This complete guide walks you through selecting the right home charging solution for your Tesla, from standard outlet adapters to Wall Connectors. Learn about electrical requirements, installation considerations, cost comparisons, and troubleshooting common charging issues. Includes information on optimizing charging schedules to take advantage of time-of-use electricity rates and solar integration.',
    imageSrc: '/tesla-eg4.jpg',
    icon: 'fas fa-plug',
    category: 'installation'
  },
];

const ResourcesAndGuides = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResources, setFilteredResources] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set visible after component mounts to trigger animation
    setIsVisible(true);
    // Initialize filtered resources with all resources
    setFilteredResources(resourcesData);
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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
      (resource.category && resource.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredResources(filtered);
  };

  return (
    <section className="resources-guides-section">
      <div className="section-header">
        <h2>Resources & Guides</h2>
        <div className="section-divider"></div>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search resources and guides"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      {filteredResources.length > 0 ? (
        <div className="resources-grid">
          {filteredResources.map((resource) => (
            <div className="resource-card" key={resource.id}>
              <div className="resource-icon">
                <i className={resource.icon}></i>
              </div>
              <div className="resource-photo">
                <img src={resource.imageSrc} alt={resource.title} />
              </div>
              <h3>{resource.title}</h3>
              <div className="resource-description">{resource.description}</div>
              <div className="resource-content">{resource.content}</div>
              <div className="resource-footer">
                {resource.category && (
                  <span className={`resource-category ${resource.category}`}>
                    {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                  </span>
                )}
                <Link to={`/resources/${resource.id}`} className="resource-link">
                  Read More <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-resources">
          <i className="fas fa-search"></i>
          <h3>No resources found</h3>
          <p>Try adjusting your search terms or browse all resources</p>
          <button className="reset-search" onClick={() => {
            setSearchTerm('');
            setFilteredResources(resourcesData);
          }}>
            View All Resources
          </button>
        </div>
      )}
    </section>
  );
};

export default ResourcesAndGuides;
