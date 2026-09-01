import React, { useState } from 'react';
import GlassCard from '../common/GlassCard';

export default function FiltersScope({ onApplyFilters, onResetFilters }) {
  const [eventType, setEventType] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters({
      event_type: eventType,
      city: city.trim(),
      state: state.trim(),
      verification_status: status,
      date_from: dateFrom,
      date_to: dateTo,
    });
  };

  const handleReset = () => {
    setEventType('');
    setCity('');
    setState('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    onResetFilters();
  };

  return (
    <GlassCard className="sidebar">
      <h3>Filters & Scope</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="filter-group">
          <label htmlFor="filterEventType">Event Category</label>
          <select
            id="filterEventType"
            className="form-control"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Flood">🌊 Flood / Waterlogging</option>
            <option value="Heatwave">🔥 Heatwave Warning</option>
            <option value="Thunderstorm">⛈️ Severe Thunderstorm</option>
            <option value="Fog">🌫️ Low Visibility / Fog</option>
            <option value="DustStorm">🌪️ Dust Storm</option>
            <option value="StrongWind">💨 Strong Winds</option>
            <option value="Other">⚠️ Other Weather Event</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filterCity">City</label>
          <input
            type="text"
            id="filterCity"
            className="form-control"
            placeholder="e.g. Mumbai, Delhi"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filterState">State</label>
          <input
            type="text"
            id="filterState"
            className="form-control"
            placeholder="e.g. Maharashtra"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filterStatus">Verification Status</label>
          <select
            id="filterStatus"
            className="form-control"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Queue</option>
            <option value="rejected">Rejected Reports</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filterDateFrom">From Date</label>
          <input
            type="date"
            id="filterDateFrom"
            className="form-control"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filterDateTo">To Date</label>
          <input
            type="date"
            id="filterDateTo"
            className="form-control"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary filter-button">
          Apply Scope Filters
        </button>
        <button type="button" className="reset-button" onClick={handleReset}>
          Reset Scope Filters
        </button>
      </form>
    </GlassCard>
  );
}
