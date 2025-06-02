import React, { useState, useEffect } from 'react';
import { ticketAPI } from '../../Services/api';
import './Manager.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ManagerDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    avgResponseTime: 0,
    avgResolveTime: 0,
    totalTickets: 0,
    resolvedTickets: 0,
    inProgressTickets: 0,
    openTickets: 0,
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [engineerPerformance, setEngineerPerformance] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ticketAPI.getTicketsByManagerCategory();
        setTickets(response);
        
        // Calculate statistics
        const resolvedTickets = response.filter(t => t.status === 'RESOLVED');
        const inProgressTickets = response.filter(t => t.status === 'IN_PROGRESS');
        const openTickets = response.filter(t => t.status === 'OPEN');
        
        // Calculate average response and resolve times
        const responseTimes = response
          .filter(t => t.firstResponseTime)
          .map(t => {
            const created = new Date(t.createdAt);
            const response = new Date(t.firstResponseTime);
            return (response - created) / (1000 * 60 * 60); // Convert to hours
          });
        
        const resolveTimes = resolvedTickets
          .filter(t => t.resolvedAt)
          .map(t => {
            const created = new Date(t.createdAt);
            const resolved = new Date(t.resolvedAt);
            return (resolved - created) / (1000 * 60 * 60); // Convert to hours
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

        // Calculate engineer performance
        const engineerStats = response.reduce((acc, ticket) => {
          if (ticket.assignedEngineer) {
            const engineerId = ticket.assignedEngineer.id;
            if (!acc[engineerId]) {
              acc[engineerId] = {
                name: ticket.assignedEngineer.name,
                resolved: 0,
                total: 0,
                avgResolveTime: 0,
                resolveTimes: []
              };
            }
            acc[engineerId].total++;
            if (ticket.status === 'RESOLVED' && ticket.resolvedAt) {
              acc[engineerId].resolved++;
              const resolveTime = (new Date(ticket.resolvedAt) - new Date(ticket.createdAt)) / (1000 * 60 * 60);
              acc[engineerId].resolveTimes.push(resolveTime);
            }
          }
          return acc;
        }, {});

        // Calculate average resolve time for each engineer
        Object.values(engineerStats).forEach(engineer => {
          if (engineer.resolveTimes.length > 0) {
            engineer.avgResolveTime = (
              engineer.resolveTimes.reduce((a, b) => a + b, 0) / 
              engineer.resolveTimes.length
            ).toFixed(1);
          }
          delete engineer.resolveTimes; // Remove the array after calculating average
        });

        const engineerPerformanceList = Object.values(engineerStats)
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
        setEngineerPerformance(engineerPerformanceList);
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
    <div className="dashboard-container">
      <h1>Manager Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Average Response Time</h3>
          <p className="stat-value">{stats.avgResponseTime} hours</p>
        </div>
        <div className="stat-card">
          <h3>Average Resolve Time</h3>
          <p className="stat-value">{stats.avgResolveTime} hours</p>
        </div>
        <div className="stat-card">
          <h3>Total Tickets</h3>
          <p className="stat-value">{stats.totalTickets}</p>
        </div>
        <div className="stat-card">
          <h3>Resolved Tickets</h3>
          <p className="stat-value">{stats.resolvedTickets}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Weekly Ticket Creation</h3>
          <Bar data={weeklyChartData} />
        </div>
        <div className="chart-card">
          <h3>Ticket Status Distribution</h3>
          <Doughnut data={statusChartData} />
        </div>
        <div className="chart-card">
          <h3>Engineer Performance</h3>
          <Bar data={{
            labels: engineerPerformance.map(e => e.name),
            datasets: [
              {
                label: 'Resolved Tickets',
                data: engineerPerformance.map(e => e.resolved),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
              },
              {
                label: 'Total Tickets',
                data: engineerPerformance.map(e => e.total),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              }
            ]
          }} options={{
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Tickets'
                }
              }
            }
          }} />
        </div>
      </div>

      <div className="engineers-list">
        <h3>Engineer Performance</h3>
        {engineerPerformance.map((engineer, index) => (
          <div key={index} className="engineer-item">
            <span className="engineer-name">{engineer.name}</span>
            <span className="engineer-stats">
              {engineer.resolved} resolved / {engineer.total} total tickets
              <br />
              Avg. resolve time: {engineer.avgResolveTime} hours
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerDashboard; 