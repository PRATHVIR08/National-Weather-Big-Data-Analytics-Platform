import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import GlassCard from '../common/GlassCard';
import { fetchAgriAdvisory } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AgriAdvisory() {
  const [cityInput, setCityInput] = useState('Bengaluru');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agriData, setAgriData] = useState(null);

  const loadData = async (cityName) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchAgriAdvisory(cityName);
      setAgriData(response.data);
    } catch (err) {
      console.error('Agri-advisory load failed:', err);
      setError(err.message || 'Failed to load agricultural advisory forecast.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData('Bengaluru');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      loadData(cityInput.trim());
    }
  };

  const m = agriData?.current_metrics;
  const advisories = agriData?.advisories || [];
  const chartDataRaw = agriData?.chart_data;

  const chartData = chartDataRaw
    ? {
        labels: chartDataRaw.labels,
        datasets: [
          {
            label: 'Soil Moisture (m³/m³)',
            data: chartDataRaw.soil_moisture,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            yAxisID: 'ySoil',
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
          {
            label: 'Relative Humidity (%)',
            data: chartDataRaw.humidity,
            borderColor: '#a7f3d0',
            backgroundColor: 'transparent',
            yAxisID: 'yEnv',
            tension: 0.3,
            borderWidth: 2,
            borderDash: [4, 4],
            pointRadius: 0,
            pointHoverRadius: 4,
          },
          {
            label: 'Soil Temp (°C)',
            data: chartDataRaw.soil_temperature,
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            yAxisID: 'yEnv',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        labels: { color: '#94a3b8' },
      },
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
        ticks: { color: '#64748b', maxTicksLimit: 12 },
      },
      ySoil: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Soil Moisture (m³/m³)', color: '#38bdf8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#38bdf8' },
      },
      yEnv: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Humidity (%) / Temp (°C)', color: '#94a3b8' },
        grid: { drawOnChartArea: false },
        ticks: { color: '#94a3b8' },
      },
    },
  };

  return (
    <GlassCard style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🌱</span> Agricultural Weather & Soil Moisture Advisory
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
            Location: <strong style={{ color: 'var(--primary-blue)' }}>{agriData ? `${agriData.city}, ${agriData.state}` : cityInput}</strong>
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Agricultural City"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            style={{ width: '200px' }}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '...' : 'Get Forecast'}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ color: '#ef4444', marginBottom: '1rem', background: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {m && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.2)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Soil Moisture (0-10cm)</span>
            <strong style={{ display: 'block', fontSize: '1.25rem', color: '#38bdf8', marginTop: '0.2rem' }}>
              {m.soil_moisture} m³/m³
            </strong>
            <small style={{ fontSize: '0.7rem', color: '#64748b' }}>({m.soil_moisture_pct}%)</small>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.2)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Soil Temperature</span>
            <strong style={{ display: 'block', fontSize: '1.25rem', color: '#f59e0b', marginTop: '0.2rem' }}>
              {m.soil_temperature} °C
            </strong>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Relative Humidity</span>
            <strong style={{ display: 'block', fontSize: '1.25rem', color: '#a7f3d0', marginTop: '0.2rem' }}>
              {m.relative_humidity} %
            </strong>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(6,182,212,0.2)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>72-Hour Rain Acc.</span>
            <strong style={{ display: 'block', fontSize: '1.25rem', color: '#67e8f9', marginTop: '0.2rem' }}>
              {m.rain_72h} mm
            </strong>
          </div>
        </div>
      )}

      {/* Advisory Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {advisories.map((adv, idx) => {
          let badgeColor = '#10b981';
          let borderColor = 'rgba(16, 185, 129, 0.3)';
          if (adv.level === 'WARNING') {
            badgeColor = '#f59e0b';
            borderColor = 'rgba(245, 158, 11, 0.4)';
          } else if (adv.level === 'ALERT') {
            badgeColor = '#ef4444';
            borderColor = 'rgba(239, 68, 68, 0.4)';
          }

          return (
            <div
              key={idx}
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: `1px solid ${borderColor}`,
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                    {adv.category}
                  </span>
                  <span
                    style={{
                      background: `${badgeColor}22`,
                      color: badgeColor,
                      border: `1px solid ${badgeColor}`,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {adv.badge}
                  </span>
                </div>
                <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{adv.icon}</span> {adv.title}
                </h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.4', margin: 0 }}>
                  {adv.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 72h Trend Chart */}
      {chartData && (
        <div style={{ height: '300px', width: '100%', position: 'relative' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </GlassCard>
  );
}
