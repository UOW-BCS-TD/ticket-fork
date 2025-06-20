import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Introduction.css';

const Introduction = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set visible after component mounts to trigger animation
    setIsVisible(true);
  }, []);

  const featuresData = [
    {
      id: 1,
      title: "AI-Powered Chatbot",
      description: "Our AI-driven chatbot is designed to provide instant responses to customer inquiries, handling common queries and assisting with troubleshooting around the clock.",
      benefit: "By automating routine interactions, the chatbot reduces wait times, enhances customer satisfaction, and allows support staff to focus on more complex issues.",
      imageSrc: "/ai-chat.jpg",
      icon: "fas fa-robot"
    },
    {
      id: 2,
      title: "Centralized Bug Tracking System",
      description: "We offer a comprehensive bug/problem tracking system that allows businesses to log, categorize, and monitor customer-reported issues in one centralized repository.",
      benefit: "This system ensures that no issues are overlooked and facilitates timely resolutions, which decreases customer frustration.",
      imageSrc: "/bug-tracking.jpg",
      icon: "fas fa-bug"
    },
    {
      id: 3,
      title: "Task Dispatch Workflow",
      description: "Our automated task dispatch workflow assigns bug resolution tasks to support engineers based on their skills and availability.",
      benefit: "By optimizing task allocation, we ensure an even distribution of workload and enhance resource utilization.",
      imageSrc: "/task-dispatch.jpg",
      icon: "fas fa-tasks"
    },
    {
      id: 4,
      title: "Customer Information Management System",
      description: "Our customer information management system centralizes customer profiles, interaction histories, and preferences, making it easy for support teams to access relevant data.",
      benefit: "With comprehensive customer insights at their fingertips, support teams can provide more personalized service, improving the overall customer experience.",
      imageSrc: "/customer-info.jpg",
      icon: "fas fa-users"
    }
  ];

  return (
    <div>
      <section className={`introduction-container ${isVisible ? 'animate-intro' : ''}`}>
        <main className="introduction">
          <h1 className="animate-item">Welcome to Techcare Support</h1>
          <p className="animate-item">Your trusted partner in technical solutions</p>
          <div className="button-container animate-item">
            <Link to="/create-ticket"><button className="support-button">Get Support</button></Link>
            <Link to="/chatbot"><button className="chat-button">Chat with AI</button></Link>
          </div>
        </main>
      </section>
        
      <section className="company-introduction">
        <div className="company-photo">
          <img src="/introduction.png" alt="Company" />
        </div>
        <div className="company-info">
          <h2>Elevating Customer Service</h2>
          <div className="section-divider-left"></div>
          <p>Techcare Consulting Services Limited specializes in delivering innovative 
            customer service solutions designed to enhance efficiency and satisfaction. 
            Our offerings include an AI-powered chatbot for instant query resolution, 
            a centralized bug tracking system for effective issue management, 
            and a comprehensive customer information management platform. 
            By integrating these advanced services, we empower businesses 
            to streamline operations, promote data-driven decision-making, and provide exceptional customer experiences.</p>
        </div>
      </section>
        
      <section className="features">
        <div className="section-header">
          <h2>Our Features</h2>
          <div className="section-divider"></div>
        </div>
        <div className="intro-features-grid">
          {featuresData.map((feature) => (
            <div className="intro-feature-card" key={feature.id}>
              <div className="intro-feature-icon">
                <i className={feature.icon}></i>
              </div>
              <div className="intro-feature-photo">
                <img src={feature.imageSrc} alt={feature.title} />
              </div>
              <h3>{feature.title}</h3>
              <p className="intro-feature-description">{feature.description}</p>
              <p className="intro-feature-benefit">{feature.benefit}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Introduction;