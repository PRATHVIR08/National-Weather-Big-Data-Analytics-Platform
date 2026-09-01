import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import GlassCard from '../common/GlassCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function IncidentCharts({ reports = [] }) {
  // Aggregate Category Counts
  const categoryCounts = {
    Flood: 0,
    Heatwave: 0,
    Thunderstorm: 0,
    Fog: 0,
    DustStorm: 0,
    StrongWind: 0,
    Other: 0,
  };

  reports.forEach((r) => {
    const cat = r.event_type || 'Other';
    if (categoryCounts[cat] !== undefined) {
      categoryCounts[cat]++;
    } else {
      categoryCounts.Other++;
    }
  });

  const barData = {
    labels: ['Flood', 'Heatwave', 'Thunderstorm', 'Fog', 'Dust Storm', 'Strong Wind', 'Other'],
    datasets: [
      {
        label: 'Incident Reports',
        data: Object.values(categoryCounts),
        backgroundColor: [
          'rgba(59, 130, 246, 0.75)',
          'rgba(239, 68, 68, 0.75)',
          'rgba(168, 85, 247, 0.75)',
          'rgba(148, 163, 184, 0.75)',
          'rgba(234, 179, 8, 0.75)',
          'rgba(6, 182, 212, 0.75)',
          'rgba(100, 116, 139, 0.75)',
        ],
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', stepSize: 1 },
      },
    },
  };

  // Aggregate State Counts
  const stateCounts = {};
  reports.forEach((r) => {
    if (r.state) {
      stateCounts[r.state] = (stateCounts[r.state] || 0) + 1;
    }
  });

  const sortedStates = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const doughnutData = {
    labels: sortedStates.length > 0 ? sortedStates.map((s) => s[0]) : ['No State Data'],
    datasets: [
      {
        data: sortedStates.length > 0 ? sortedStates.map((s) => s[1]) : [1],
        backgroundColor: [
          '#3b82f6',
          '#14b8a6',
          '#06b6d4',
          '#a855f7',
          '#f59e0b',
          '#ef4444',
          '#64748b',
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#94a3b8', font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
      },
    },
  };

  return (
    <section className="charts-grid">
      <GlassCard className="chart-card">
        <h3>Weather Incidents by Category</h3>
        <div className="chart-container">
          <Bar data={barData} options={barOptions} />
        </div>
      </GlassCard>

      <GlassCard className="chart-card">
        <h3>Regional Distribution (Top States)</h3>
        <div className="chart-container">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </GlassCard>
    </section>
  );
}
