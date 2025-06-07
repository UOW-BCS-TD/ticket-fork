import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { ticketAPI } from '../../Services/api';
import './Admin.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    avgResponseTime: 0, // Average response time for all tickets with firstResponseTime
    avgResolveTime: 0,  // Average resolve time for resolved tickets only
    totalTickets: 0,
    resolvedTickets: 0,
    inProgressTickets: 0,
    openTickets: 0
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [topEngineers, setTopEngineers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ticketAPI.getTickets();
        setTickets(response);
        
        // Calculate statistics
        const now = new Date();
        const resolvedTickets = response.filter(t => t.status === 'RESOLVED');
        const inProgressTickets = response.filter(t => t.status === 'IN_PROGRESS');
        const openTickets = response.filter(t => t.status === 'OPEN');
        
        // Calculate average response time (in minutes) for all tickets with firstResponseTime
        const responseTimes = response
          .filter(t => t.firstResponseTime)
          .map(t => {
            const created = new Date(t.createdAt);
            const responseTime = new Date(t.firstResponseTime);
            return (responseTime - created) / (1000 * 60); // Convert to minutes
          });
        // Calculate average resolve time (in minutes) only for resolved tickets
        const resolveTimes = resolvedTickets
          .filter(t => t.resolvedAt)
          .map(t => {
            const created = new Date(t.createdAt);
            const resolved = new Date(t.resolvedAt);
            return (resolved - created) / (1000 * 60); // Convert to minutes
          });

        // Calculate weekly ticket counts
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const weeklyCounts = last7Days.map(date => {
          return response.filter(t => 
            t.createdAt.split('T')[0] === date
          ).length;
        });

        // Calculate top engineers
        const engineerStats = response.reduce((acc, ticket) => {
          if (ticket.engineer) {
            const engineerId = ticket.engineer.id;
            if (!acc[engineerId]) {
              acc[engineerId] = {
                id: engineerId,
                name: ticket.engineer.name,
                resolved: 0,
                total: 0,
                avgResolveTime: 0,
                resolveTimes: []
              };
            }
            acc[engineerId].total++;
            if (ticket.status === 'RESOLVED' && ticket.updatedAt) {
              acc[engineerId].resolved++;
              const resolveTime = (new Date(ticket.updatedAt) - new Date(ticket.createdAt)) / (1000 * 60); // Convert to minutes
              acc[engineerId].resolveTimes.push(resolveTime);
            }
          }
          return acc;
        }, {});

        // Calculate average resolve time for each engineer (in minutes)
        Object.values(engineerStats).forEach(engineer => {
          if (engineer.resolveTimes.length > 0) {
            engineer.avgResolveTime = (
              engineer.resolveTimes.reduce((a, b) => a + b, 0) /
              engineer.resolveTimes.length
            ).toFixed(1);
          }
          delete engineer.resolveTimes; // Remove the array after calculating average
        });

        const topEngineersList = Object.values(engineerStats)
          .sort((a, b) => b.resolved - a.resolved);

        setStats({
          avgResponseTime: responseTimes.length ?
            (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1) : 0,
          avgResolveTime: resolveTimes.length ?
            (resolveTimes.reduce((a, b) => a + b, 0) / resolveTimes.length).toFixed(1) : 0,
          totalTickets: response.length,
          resolvedTickets: resolvedTickets.length,
          inProgressTickets: inProgressTickets.length,
          openTickets: openTickets.length
        });

        setWeeklyData(weeklyCounts);
        setTopEngineers(topEngineersList);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch ticket data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const weeklyChartData = {
    labels: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'],
    datasets: [
      {
        label: 'Tickets Created',
        data: weeklyData,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const statusChartData = {
    labels: ['Resolved', 'In Progress', 'Open'],
    datasets: [
      {
        data: [stats.resolvedTickets, stats.inProgressTickets, stats.openTickets],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 99, 132, 0.5)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Overview of system performance and ticket statistics</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="admin-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="dashboard-content">
        {/* Statistics Cards */}
        <div className="stats-section">
          <h2 className="section-title">
            <i className="fas fa-chart-line"></i>
            Key Metrics
          </h2>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <i className="fas fa-ticket-alt"></i>
              </div>
              <div className="stat-content">
                <h3>Total Tickets</h3>
                <p className="stat-value">{stats.totalTickets}</p>
                <span className="stat-label">All time</span>
              </div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-content">
                <h3>Resolved Tickets</h3>
                <p className="stat-value">{stats.resolvedTickets}</p>
                <span className="stat-label">
                  {stats.totalTickets > 0 ? 
                    `${((stats.resolvedTickets / stats.totalTickets) * 100).toFixed(1)}% of total` : 
                    '0% of total'
                  }
                </span>
              </div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-content">
                <h3>Avg Response Time</h3>
                <p className="stat-value">{formatTime(stats.avgResponseTime)}</p>
                <span className="stat-label">First response</span>
              </div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon">
                <i className="fas fa-stopwatch"></i>
              </div>
              <div className="stat-content">
                <h3>Avg Resolve Time</h3>
                <p className="stat-value">{formatTime(stats.avgResolveTime)}</p>
                <span className="stat-label">Resolution time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-header">
                <h3>
                  <i className="fas fa-chart-bar"></i>
                  Weekly Ticket Creation
                </h3>
                <p>Tickets created in the last 7 days</p>
              </div>
              <div className="chart-container">
                <Bar 
                  data={weeklyChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            <div className="chart-card">
              <div className="chart-header">
                <h3>
                  <i className="fas fa-chart-pie"></i>
                  Ticket Status Distribution
                </h3>
                <p>Current status breakdown</p>
              </div>
              <div className="chart-container doughnut-container">
                <Doughnut 
                  data={statusChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Engineers Performance Section */}
        <div className="engineers-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-users-cog"></i>
              Engineer Performance
            </h2>
            <p className="section-subtitle">Top performing engineers based on resolved tickets</p>
          </div>
          
          {topEngineers.length === 0 ? (
            <div className="no-data">
              <i className="fas fa-user-slash"></i>
              <p>No engineer data available</p>
            </div>
          ) : (
            <div className="engineers-table-container">
              <table className="engineers-table">
                <thead>
                  <tr>
                    <th>
                      <i className="fas fa-trophy"></i>
                      Rank
                    </th>
                    <th>Engineer</th>
                    <th>
                      <i className="fas fa-check"></i>
                      Resolved
                    </th>
                    <th>
                      <i className="fas fa-list"></i>
                      Total
                    </th>
                    <th>
                      <i className="fas fa-percentage"></i>
                      Success Rate
                    </th>
                    <th>
                      <i className="fas fa-clock"></i>
                      Avg Resolve Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topEngineers.slice(0, 10).map((engineer, index) => (
                    <tr key={engineer.id} className={index < 3 ? `top-${index + 1}` : ''}>
                      <td className="rank-cell">
                        <span className="rank-badge">
                          {index + 1}
                          {index === 0 && <i className="fas fa-crown"></i>}
                        </span>
                      </td>
                      <td className="engineer-cell">
                        <div className="engineer-info">
                          <div className="engineer-avatar">
                            {engineer.name ? engineer.name.charAt(0).toUpperCase() : "E"}
                          </div>
                          <div className="engineer-details">
                            <span className="engineer-name">{engineer.name}</span>
                            <span className="engineer-id">ID: {engineer.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="resolved-cell">
                        <span className="resolved-count">{engineer.resolved}</span>
                      </td>
                      <td className="total-cell">{engineer.total}</td>
                      <td className="rate-cell">
                        <div className="success-rate">
                          <span className="rate-percentage">
                            {engineer.total > 0 ? 
                              `${((engineer.resolved / engineer.total) * 100).toFixed(1)}%` : 
                              '0%'
                            }
                          </span>
                          <div className="rate-bar">
                            <div 
                              className="rate-fill" 
                              style={{
                                width: engineer.total > 0 ? 
                                  `${(engineer.resolved / engineer.total) * 100}%` : 
                                  '0%'
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="time-cell">
                        <span className="resolve-time">
                          {engineer.avgResolveTime > 0 ? formatTime(engineer.avgResolveTime) : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;