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
import './Manager.css';

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
    openTickets: 0
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [topEngineers, setTopEngineers] = useState([]);

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
            const responseTime = new Date(t.firstResponseTime);
            return (responseTime - created) / (1000 * 60 * 60); // hours
          });
        
        const resolveTimes = resolvedTickets
          .filter(t => t.resolvedAt)
          .map(t => {
            const created = new Date(t.createdAt);
            const resolved = new Date(t.resolvedAt);
            return (resolved - created) / (1000 * 60 * 60); // hours
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
          const engineer = ticket.engineer || ticket.assignedEngineer;
          if (engineer) {
            const engineerId = engineer.id;
            if (!acc[engineerId]) {
              acc[engineerId] = {
                id: engineerId, // Add the engineer ID here
                name: engineer.name,
                resolved: 0,
                total: 0,
                avgResolveTime: 0,
                resolveTimes: []
              };
            }
            acc[engineerId].total++;
            if (ticket.status === 'RESOLVED' && (ticket.resolvedAt || ticket.updatedAt)) {
              acc[engineerId].resolved++;
              const resolveTime = (new Date(ticket.resolvedAt || ticket.updatedAt) - new Date(ticket.createdAt)) / (1000 * 60 * 60);
              acc[engineerId].resolveTimes.push(resolveTime);
            }
          }
          return acc;
        }, {});

        Object.values(engineerStats).forEach(engineer => {
          if (engineer.resolveTimes.length > 0) {
            engineer.avgResolveTime = (
              engineer.resolveTimes.reduce((a, b) => a + b, 0) / 
              engineer.resolveTimes.length
            ).toFixed(1);
          }
          delete engineer.resolveTimes;
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
      </div>

      <div className="engineers-table-container">
        <h3>Engineer Performance</h3>
        <table className="engineers-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Engineer ID</th>
              <th>Engineer Name</th>
              <th>Resolved Tickets</th>
              <th>Total Tickets</th>
              <th>Avg. Resolve Time</th>
            </tr>
          </thead>
          <tbody>
            {topEngineers.map((engineer, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{engineer.id}</td>
                <td>{engineer.name}</td>
                <td>{engineer.resolved}</td>
                <td>{engineer.total}</td>
                <td>{engineer.avgResolveTime} hours</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerDashboard;