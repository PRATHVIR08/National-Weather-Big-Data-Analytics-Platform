import React, { useState } from 'react';
import GlassCard from '../common/GlassCard';
import { fetchWeatherByCity } from '../../services/api';

export default function WeatherSearch({ onSelectCityLocation }) {
  const [cityInput, setCityInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weatherData, setWeatherData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const city = cityInput.trim();
    if (!city) {
      setError('Please enter a city name.');
      setWeatherData(null);
      return;
    }

    setLoading(true);
    setError('');
    setWeatherData(null);

    try {
      const data = await fetchWeatherByCity(city);
      setWeatherData(data);

      if (onSelectCityLocation && data.location?.lat && data.location?.lon) {
        onSelectCityLocation([data.location.lat, data.location.lon], 10);
      }
    } catch (err) {
      console.error('City weather search failed:', err);
      setError(err.message || 'Failed to load weather.');
    } finally {
      setLoading(false);
    }
  };

  const loc = weatherData?.location;
  const w = weatherData?.weather;

  return (
    <GlassCard style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>🔍 City Weather Search</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>Query real-time meteorological observations for any Indian city</p>
        </div>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Enter Indian city (e.g. Mumbai, Bengaluru, Delhi)"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
          {loading ? 'Searching...' : 'Search Weather'}
        </button>
      </form>

      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
          {error}
        </div>
      )}

      {weatherData && loc && w && (
        <div style={{ background: 'rgba(15,23,42,0.6)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>{loc.city}, {loc.state || loc.country}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Updated: {weatherData.observed_at || '--'}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                {w.condition || 'Clear'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Temperature</span>
              <strong style={{ display: 'block', fontSize: '1.4rem', color: '#fff', marginTop: '2px' }}>{w.temperature_c ?? '--'}°C</strong>
              <small style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Feels like: {w.feels_like_c ?? '--'}°C</small>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Humidity</span>
              <strong style={{ display: 'block', fontSize: '1.4rem', color: '#34d399', marginTop: '2px' }}>{w.humidity_pct ?? '--'}%</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wind Speed</span>
              <strong style={{ display: 'block', fontSize: '1.4rem', color: '#67e8f9', marginTop: '2px' }}>{w.wind_speed_kmh ?? '--'} km/h</strong>
              <small style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Gusts: {w.wind_gust_kmh ?? '--'} km/h</small>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Precipitation</span>
              <strong style={{ display: 'block', fontSize: '1.4rem', color: '#60a5fa', marginTop: '2px' }}>{w.precipitation_mm ?? '--'} mm</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cloud Cover</span>
              <strong style={{ display: 'block', fontSize: '1.4rem', color: '#cbd5e1', marginTop: '2px' }}>{w.cloud_cover_pct ?? '--'}%</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pressure</span>
              <strong style={{ display: 'block', fontSize: '1.4rem', color: '#c084fc', marginTop: '2px' }}>{w.pressure_hpa ?? '--'} hPa</strong>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
