import React, { useState } from 'react';
import './SearchResources.css';

const resourcesData = [
  { 
    title: 'Tesla Model 3 Troubleshooting Guide', 
    description: 'Common issues and solutions for Tesla Model 3 owners',
    content: 'This comprehensive guide covers the most frequent technical issues reported by Tesla Model 3 owners, including touchscreen responsiveness, battery optimization, regenerative braking adjustments, and software update troubleshooting. Learn step-by-step solutions that can resolve many problems without requiring service center visits.',
    imageSrc: '/tesla-eg1.png',
    icon: 'fas fa-car'
  },
  { 
    title: 'Maximizing Tesla Battery Life', 
    description: 'Best practices for extending your Tesla battery longevity',
    content: 'Discover proven techniques to maximize your Tesla battery lifespan, including optimal charging habits (20-80% daily charging), temperature management during extreme weather, and how to properly prepare your vehicle for long-term storage. This guide includes real data from long-term Tesla owners who have maintained over 90% battery capacity after 100,000 miles.',
    imageSrc: '/tesla-eg2.png',
    icon: 'fas fa-battery-full'
  },
  { 
    title: 'Tesla Autopilot & FSD Features Explained', 
    description: 'Understanding Tesla\'s driver assistance technologies',
    content: 'Navigate the differences between Tesla\'s Autopilot, Enhanced Autopilot, and Full Self-Driving capabilities with this detailed breakdown. Learn how to properly use each feature, understand their limitations, troubleshoot common issues, and stay updated with the latest software improvements. Includes safety tips and regulatory information that every Tesla owner should know.',
    imageSrc: '/tesla-eg3.jpg',
    icon: 'fas fa-robot'
  },
  { 
    title: 'Tesla Home Charging Setup Guide', 
    description: 'Everything you need to know about setting up home charging',
    content: 'This complete guide walks you through selecting the right home charging solution for your Tesla, from standard outlet adapters to Wall Connectors. Learn about electrical requirements, installation considerations, cost comparisons, and troubleshooting common charging issues. Includes information on optimizing charging schedules to take advantage of time-of-use electricity rates and solar integration.',
    imageSrc: '/tesla-eg4.jpg',
    icon: 'fas fa-plug'
  },
];

const ResourceCard = ({ title, description, content, imageSrc, icon }) => {
  return (
    <div className="resource-card">
      <div className="resource-icon">
        <i className={icon}></i>
      </div>
      <div className="resource-photo">
        <img src={imageSrc} alt={title} />
      </div>
      <h3>{title}</h3>
      <p className="resource-description">{description}</p>
      <p className="resource-content">{content}</p>
    </div>
  );
};

const ResourcesAndGuides = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredResources = resourcesData.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="resources-guides-section">
      <div className="section-header">
        <h2>Resources & Guides</h2>
        <div className="section-divider"></div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search resources and guides"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-button">Search</button>
      </div>

      <div className="resources-grid">
        {filteredResources.length > 0 ? (
          filteredResources.map((resource, index) => (
            <ResourceCard 
              key={index} 
              title={resource.title} 
              description={resource.description} 
              content={resource.content}
              imageSrc={resource.imageSrc}
              icon={resource.icon}
            />
          ))
        ) : (
          <p className="no-resources">No resources found. Try a different search term.</p>
        )}
      </div>
    </section>
  );
};

export default ResourcesAndGuides;
