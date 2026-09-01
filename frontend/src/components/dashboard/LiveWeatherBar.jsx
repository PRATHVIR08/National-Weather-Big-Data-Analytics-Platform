import React from 'react';
import GlassCard from '../common/GlassCard';

export default function LiveWeatherBar({ lastUpdated, onRefresh, isRefreshing }) {
  return (
    <GlassCard className="live-weather-header-bar">
      <div className="live-weather-title">
        <div className="live-indicator">
          <div className="live-dot"></div>
          LIVE SENSOR FEED
        </div>
        <div>
          <h2>India Live Weather Overview</h2>
          <p>Real-time meteorological observation network & citizen hazard reports across India</p>
        </div>
      </div>

      <div className="weather-status">
        <span>Updated: <strong>{lastUpdated || '--'}</strong></span>
        <button
          className="btn-primary refresh-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
        >
          {isRefreshing ? '🔄 Loading...' : '🔄 Refresh Data'}
        </button>
      </div>
    </GlassCard>
  );
}
