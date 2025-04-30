import React, { useState, useEffect } from 'react';
import './AboutUs.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const AboutUs = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set visible after component mounts to trigger animation
    setIsVisible(true);
  }, []);

  // Team members data
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      bio: 'With over 15 years of experience in customer support solutions, Sarah founded TechCare with a vision to transform how businesses handle customer inquiries.',
      image: '/team/sarah.jpg',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      bio: 'Michael leads our technology team, bringing 12 years of experience in AI and machine learning to create our innovative support platform.',
      image: '/team/michael.jpg',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      name: 'Jessica Williams',
      role: 'Head of Customer Success',
      bio: 'Jessica ensures our clients achieve their support goals through strategic implementation of our platform.',
      image: '/team/jessica.jpg',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      name: 'David Rodriguez',
      role: 'Lead Developer',
      bio: 'David architects our core systems, focusing on scalability and performance to handle millions of support tickets daily.',
      image: '/team/david.jpg',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    }
  ];

  // Company values
  const companyValues = [
    {
      title: 'Customer First',
      description: 'We believe that exceptional customer support is the foundation of business success.',
      icon: 'fas fa-users'
    },
    {
      title: 'Innovation',
      description: 'We continuously push the boundaries of what is possible in customer support technology.',
      icon: 'fas fa-lightbulb'
    },
    {
      title: 'Reliability',
      description: 'Our platform is built for 99.99% uptime, ensuring your support never stops.',
      icon: 'fas fa-shield-alt'
    },
    {
      title: 'Transparency',
      description: 'We believe in open communication with our customers and within our team.',
      icon: 'fas fa-comments'
    }
  ];

  // Milestones
  const milestones = [
    {
      year: '2018',
      title: 'Company Founded',
      description: 'TechCare was established with a mission to revolutionize customer support.'
    },
    {
      year: '2019',
      title: 'First Major Client',
      description: 'Secured our first enterprise client, validating our innovative approach.'
    },
    {
      year: '2020',
      title: 'AI Integration',
      description: 'Launched our AI-powered ticket routing and resolution suggestion system.'
    },
    {
      year: '2021',
      title: 'Global Expansion',
      description: 'Opened offices in Europe and Asia to better serve our international clients.'
    },
    {
      year: '2022',
      title: '1 Million Tickets',
      description: 'Celebrated processing our millionth support ticket through the platform.'
    },
    {
      year: '2023',
      title: 'Next Generation Platform',
      description: 'Released our completely redesigned platform with enhanced AI capabilities.'
    }
  ];

  return (
    <div className="about-us-container">
      <div className={`about-us-header ${isVisible ? 'animate-intro' : ''}`}>
        <div className="about-us-header-content">
          <h1 className="animate-item">About TechCare</h1>
          <p className="animate-item">Transforming customer support through innovation and excellence</p>
        </div>
      </div>

      <div className="about-us-main">
        <section className="about-us-section our-story">
          <div className="section-header">
            <h2>Our Story</h2>
            <div className="section-divider"></div>
          </div>
          <div className="our-story-content">
            <div className="our-story-image">
              <img src="/office.png" alt="TechCare Office" />
            </div>
            <div className="our-story-text">
              <p>
                Founded in 2018, TechCare emerged from a simple observation: customer support systems were failing both businesses and their customers. Our founder, Sarah Johnson, experienced firsthand the frustration of using outdated ticketing systems that created more problems than they solved.
              </p>
              <p>
                We set out to build a platform that would make customer support more efficient, more intelligent, and more human. Today, TechCare serves over 500 businesses worldwide, processing millions of support tickets monthly with our AI-enhanced platform.
              </p>
              <p>
                Our mission remains unchanged: to transform customer support from a business cost center to a relationship-building opportunity. We believe that every support interaction is a chance to strengthen customer loyalty and gather valuable insights.
              </p>
            </div>
          </div>
        </section>

        <section className="about-us-section our-values">
          <div className="section-header">
            <h2>Our Values</h2>
            <div className="section-divider"></div>
          </div>
          <div className="values-container">
            {companyValues.map((value, index) => (
              <div className="value-card" key={index}>
                <div className="value-icon">
                  <i className={value.icon}></i>
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-us-section our-team">
          <div className="section-header">
            <h2>Our Team</h2>
            <div className="section-divider"></div>
          </div>
          <p className="team-intro">
            Meet the passionate individuals behind TechCare who are dedicated to revolutionizing customer support.
          </p>
          <div className="team-members">
            {teamMembers.map((member, index) => (
              <div className="team-member-card" key={index}>
                <div className="member-image">
                  <img src={member.image} alt={member.name} onError={(e) => {
                    // e.target.onerror = null;
                    // e.target.src = 'https://via.placeholder.com/150?text=Team+Member';
                  }} />
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <span className="member-role">{member.role}</span>
                  <p>{member.bio}</p>
                  <div className="member-social">
                    <a href={member.social.linkedin} aria-label="LinkedIn">
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a href={member.social.twitter} aria-label="Twitter">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href={member.social.github} aria-label="GitHub">
                      <i className="fab fa-github"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="about-us-section our-journey">
          <div className="section-header">
            <h2>Our Journey</h2>
            <div className="section-divider"></div>
          </div>
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <div className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`} key={index}>
                <div className="timeline-content">
                  <div className="timeline-year">{milestone.year}</div>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="about-us-section our-stats">
          <div className="section-header">
            <h2>Our Impact</h2>
            <div className="section-divider"></div>
          </div>
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Businesses Served</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">5M+</div>
              <div className="stat-label">Tickets Processed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Customer Satisfaction</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">30+</div>
              <div className="stat-label">Countries</div>
            </div>
          </div>
        </section>

        <section className="about-us-section contact-cta">
          <div className="cta-content">
            <h2>Ready to transform your customer support?</h2>
            <p>Join hundreds of businesses that trust TechCare for their support needs.</p>
            <div className="cta-buttons">
              <button className="primary-btn">Request Demo</button>
              <button className="secondary-btn">Contact Us</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
