import React, { useState, useEffect } from 'react';
import './Engineer.css';

const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // New state for input before search
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Mock data for knowledge base articles
  useEffect(() => {
    // In a real application, this would be an API call
    const mockArticles = [
      {
        id: 1,
        title: 'Common Network Troubleshooting Steps',
        category: 'network',
        content: `
          <h3>Network Troubleshooting Guide</h3>
          <p>Follow these steps to diagnose common network issues:</p>
          <ol>
            <li>Check physical connections (cables, ports)</li>
            <li>Verify network settings (IP address, subnet mask)</li>
            <li>Ping the default gateway</li>
            <li>Check DNS resolution</li>
            <li>Trace the route to identify where connection fails</li>
          </ol>
          <p>For persistent issues, check for:</p>
          <ul>
            <li>Firewall blocking connections</li>
            <li>Router/switch configuration issues</li>
            <li>ISP outages</li>
          </ul>
        `,
        tags: ['troubleshooting', 'connectivity']
      },
      {
        id: 2,
        title: 'Software Installation Best Practices',
        category: 'software',
        content: `
          <h3>Software Installation Guidelines</h3>
          <p>Follow these best practices when installing software for clients:</p>
          <ol>
            <li>Verify system requirements before installation</li>
            <li>Close all running applications</li>
            <li>Run installation as administrator</li>
            <li>Choose custom installation to control components</li>
            <li>Document any custom settings used</li>
            <li>Test functionality after installation</li>
          </ol>
          <p>Common issues to watch for:</p>
          <ul>
            <li>Insufficient disk space</li>
            <li>Missing dependencies</li>
            <li>Conflicting software</li>
            <li>Antivirus blocking installation</li>
          </ul>
        `,
        tags: ['installation', 'best practices']
      },
      {
        id: 3,
        title: 'Hardware Diagnostics Guide',
        category: 'hardware',
        content: `
          <h3>Hardware Diagnostics Procedures</h3>
          <p>Use this guide to diagnose common hardware issues:</p>
          <h4>Memory Issues</h4>
          <p>Run memtest86+ to check for RAM errors. Look for:</p>
          <ul>
            <li>Address line failures</li>
            <li>Stuck bits</li>
            <li>Pattern sensitivity</li>
          </ul>
          <h4>Storage Issues</h4>
          <p>Use S.M.A.R.T. diagnostics to check drive health:</p>
          <ul>
            <li>Reallocated sectors count</li>
            <li>Spin retry count</li>
            <li>Uncorrectable sector count</li>
          </ul>
          <h4>CPU Issues</h4>
          <p>Monitor temperatures and run stress tests to identify:</p>
          <ul>
            <li>Thermal throttling</li>
            <li>Stability under load</li>
            <li>Cooling system effectiveness</li>
          </ul>
        `,
        tags: ['diagnostics', 'troubleshooting']
      },
      {
        id: 4,
        title: 'Customer Communication Templates',
        category: 'customer-service',
        content: `
          <h3>Effective Customer Communication</h3>
          <p>Use these templates when communicating with customers:</p>
          
          <h4>Initial Response Template</h4>
          <pre>
Dear [Customer Name],

Thank you for contacting our support team. I understand you're experiencing an issue with [brief description].

I'll be personally handling your case and will work with you to resolve this as quickly as possible.

To help me better understand the situation, could you please provide:
- When did you first notice this issue?
- Are you able to reproduce the problem consistently?
- Have you made any recent changes to your system?

In the meantime, I've created ticket #[Ticket ID] for tracking this issue.

Best regards,
[Your Name]
Support Engineer
          </pre>
          
          <h4>Resolution Template</h4>
          <pre>
Dear [Customer Name],

I'm pleased to inform you that we've resolved the [brief description] issue you reported.

The solution involved [brief explanation of what was done].

To prevent this from happening again, we recommend:
- [Recommendation 1]
- [Recommendation 2]

Please test this on your end and let me know if everything is working as expected. If you're satisfied with the resolution, you can close this ticket, or I can do that for you.

Thank you for your patience throughout this process.

Best regards,
[Your Name]
Support Engineer
          </pre>
        `,
        tags: ['templates', 'communication']
      },
      {
        id: 5,
        title: 'Security Incident Response Protocol',
        category: 'security',
        content: `
          <h3>Security Incident Response</h3>
          <p>Follow this protocol when handling security incidents:</p>
          
          <h4>1. Identification</h4>
          <ul>
            <li>Document how the incident was detected</li>
            <li>Determine affected systems</li>
            <li>Assess the scope and impact</li>
          </ul>
          
          <h4>2. Containment</h4>
          <ul>
            <li>Isolate affected systems</li>
            <li>Preserve evidence</li>
            <li>Change credentials for affected accounts</li>
          </ul>
          
          <h4>3. Eradication</h4>
          <ul>
            <li>Remove malware or unauthorized access</li>
            <li>Patch vulnerabilities</li>
            <li>Verify system integrity</li>
          </ul>
          
          <h4>4. Recovery</h4>
          <ul>
            <li>Restore from clean backups</li>
            <li>Implement additional security controls</li>
            <li>Monitor for signs of persistent threats</li>
          </ul>
          
          <h4>5. Lessons Learned</h4>
          <ul>
            <li>Document the incident</li>
            <li>Update security policies</li>
            <li>Conduct training if necessary</li>
          </ul>
        `,
        tags: ['incident response', 'protocol']
      }
    ];
    
    // Simulate API delay
    setTimeout(() => {
      setArticles(mockArticles);
      setLoading(false);
    }, 400);
  }, []);

  const filteredArticles = articles.filter(article => {
    // Filter by category
    if (category !== 'all' && article.category !== category) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !article.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    
    return true;
  });

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
  };

  const handleBackClick = () => {
    setSelectedArticle(null);
  };

  // Handle search when icon is clicked
  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setSearchTerm(searchInput);
    }
  };

  if (loading) {
    return (
      <div className="engineer-loading animate-fade-in">
        <div className="engineer-loader"></div>
        <p>Loading knowledge base articles...</p>
      </div>
    );
  }

  return (
    <div className="engineer-page knowledge-base animate-fade-in">
      <div className="engineer-header">
        <h1>Knowledge Base</h1>
        <p>Access technical resources and solutions</p>
      </div>
      
      {selectedArticle ? (
        <div className="article-detail animate-fade-in">
          <button className="engineer-btn-back animate-slide-in" onClick={handleBackClick}>
            &larr; Back to Articles
          </button>
          
          <div className="article-header animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <h3>{selectedArticle.title}</h3>
            <div className="article-meta">
              <span className="article-category">{selectedArticle.category}</span>
              <div className="article-tags">
                {selectedArticle.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          
          <div 
            className="article-content animate-slide-in"
            style={{ animationDelay: '0.2s' }}
            dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
          />
        </div>
      ) : (
        <>
          <div className="kb-controls animate-slide-in">
            <div className="search-bars">
              <div className="engineer-search">
                <input
                  type="text"
                  placeholder="Search knowledge base..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="animate-slide-in"
                />
                <button className="engineer-search-btn" onClick={handleSearch}>
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
            
            <div className="category-filter">
              <label htmlFor="category-select">Filter by Category:</label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="animate-slide-in"
              >
                <option value="all">All Categories</option>
                <option value="network">Network</option>
                <option value="software">Software</option>
                <option value="hardware">Hardware</option>
                <option value="customer-service">Customer Service</option>
                <option value="security">Security</option>
              </select>
            </div>
          </div>
          
          {filteredArticles.length === 0 ? (
            <div className="no-articles animate-fade-in">No articles found matching your criteria.</div>
          ) : (
            <div className="articles-list">
              {filteredArticles.map((article, index) => (
                <div 
                  key={article.id} 
                  className="article-card animate-slide-in"
                  style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                  onClick={() => handleArticleClick(article)}
                >
                  <h3>{article.title}</h3>
                  <div className="article-meta">
                    <span className="article-category">{article.category}</span>
                    <div className="article-tags">
                      {article.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default KnowledgeBase;
