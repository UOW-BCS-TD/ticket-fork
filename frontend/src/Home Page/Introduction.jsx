import React, { useEffect } from 'react';
import './Introduction.css';

const Introduction = () => {

  const imagePaths = [
    '/Techcare-Introduction.png',
    '/ai-chat.jpg',
    'bug-tracking.jpg',
    '/task-dispatch.jpg',
    '/customer-info.jpg'
  ];

  useEffect(() => {
    imagePaths.forEach(path => {
      const img = new Image();
      img.src = path;
    });
  }, []);

  const FeatureCard = ({ imageSrc, title, description, benefit }) => {
    return (
      <div className="feature-card">
        <div className="feature-photo">
          <img src={imageSrc} alt={title} />
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
        <p>{benefit}</p>
      </div>
    );
  };

  return (
    <div>
      <section className="introduction-container">
        <main className="introduction">
          <h1>Welcome to Techcare Support</h1>
          <p>Your trusted partner in technical solutions</p>
          <div className="button-container">
            <button className="support-button">Get Support</button>
            <button className="chat-button">Chat with Us</button>
          </div>
        </main>
      </section>
        
      <section className="company-introduction">
        <div className="company-photo">
          <img src="/Techcare-Introduction.png" alt="Company" />
        </div>
        <div className="company-info">
          <h2>Elevating Customer Service</h2>
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
        <h2>Our Features</h2>
        <div className="features-grid">
          <FeatureCard title="AI-Powered Chatbot" 
          description="Our AI-driven chatbot is designed to provide instant responses to customer inquiries, handling common queries and assisting with troubleshooting around the clock." 
          benefit="By automating routine interactions, the chatbot reduces wait times, enhances customer satisfaction, and allows support staff to focus on more complex issues. This leads to improved efficiency in customer service operations and higher overall client engagement." 
          imageSrc="/ai-chat.jpg"/>
          <FeatureCard title="Centralized Bug Tracking System" 
          description="We offer a comprehensive bug/problem tracking system that allows businesses to log, categorize, and monitor customer-reported issues in one centralized repository." 
          benefit="This system ensures that no issues are overlooked and facilitates timely resolutions, which decreases customer frustration. The centralized approach also improves collaboration among support teams, leading to more organized and efficient problem management" 
          imageSrc="bug-tracking.jpg"/>
          <FeatureCard title="Task Dispatch Workflow" 
          description="Our automated task dispatch workflow assigns bug resolution tasks to support engineers based on their skills and availability." 
          benefit="By optimizing task allocation, we ensure an even distribution of workload and enhance resource utilization. This results in quicker response times to customer issues and a more balanced workload for support staff, ultimately contributing to improved service quality." 
          imageSrc="/task-dispatch.jpg"/>
          <FeatureCard title="Customer Information Management System" 
          description="Our customer information management system centralizes customer profiles, interaction histories, and preferences, making it easy for support teams to access relevant data." 
          benefit="With comprehensive customer insights at their fingertips, support teams can provide more personalized service, improving the overall customer experience. The system also enables better tracking of customer interactions, fostering stronger relationships and long-term loyalty." 
          imageSrc="/customer-info.jpg"/>
        </div>
      </section>
    </div>
  );
};

export default Introduction;