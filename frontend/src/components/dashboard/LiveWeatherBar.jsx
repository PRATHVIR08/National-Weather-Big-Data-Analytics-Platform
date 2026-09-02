import React from 'react';
import GlassCard from '../common/GlassCard';
import { useConnection } from '../../context/ConnectionContext';

export default function LiveWeatherBar({ lastUpdated, onRefresh, isRefreshing }) {
  const { connectionStatus } = useConnection();

  return (
    <GlassCard className="live-weather-header-bar">
      <div className="live-weather-title">
        {connectionStatus === 'live' && (
          <div className="live-indicator status-live">
            <div className="live-dot-green"></div>
            LIVE SENSOR FEED
          </div>
        )}
        {connectionStatus === 'connecting' && (
          <div className="live-indicator status-connecting">
            <div className="connecting-spinner-sm"></div>
            CONNECTING...
          </div>
        )}
        {connectionStatus === 'offline' && (
          <div className="live-indicator status-offline">
            <div className="offline-dot-orange"></div>
            OFFLINE MODE (Cached Data)
          </div>
        )}

        <div>
          <h2>India Weather Overview</h2>
          <p>Real-time meteorological observation network & citizen hazard reports across India</p>
        </div>
      </div>

      <div className="weather-status">
        <span>Updated: <strong>{lastUpdated || '--'}</strong></span>
        <button
          className="btn-primary refresh-btn"
          onClick={onRefresh}
          disabled={isRefreshing || connectionStatus === 'connecting'}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
        >
          {isRefreshing || connectionStatus === 'connecting' ? '🔄 Refreshing...' : '🔄 Refresh Data'}
        </button>
      </div>
    </GlassCard>
  );
}
