import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import ReportMarker from './ReportMarker';
import LiveWeatherMarker from './LiveWeatherMarker';
import WeatherLegend from './WeatherLegend';
import LoadingIndicator from '../common/LoadingIndicator';
import GlassCard from '../common/GlassCard';
import { useConnection } from '../../context/ConnectionContext';

function MapController({ selectedLocation, reports }) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.setView(selectedLocation.center, selectedLocation.zoom || 10, { animate: true });
    }
  }, [selectedLocation, map]);

  useEffect(() => {
    if (!selectedLocation && reports && reports.length > 0) {
      const validReports = reports.filter((r) => r.latitude && r.longitude);
      if (validReports.length > 0) {
        const bounds = validReports.map((r) => [r.latitude, r.longitude]);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
    }
  }, [reports, selectedLocation, map]);

  return null;
}

export default function WeatherMap({
  reports = [],
  liveWeather = [],
  isLoading = false,
  selectedLocation = null,
}) {
  const [mapMode, setMapMode] = useState('all'); // 'all', 'live', 'incidents'
  const { connectionStatus } = useConnection();

  return (
    <GlassCard className="map-card">
      <div className="map-header">
        <div>
          <h3>National Weather Spatial Visualization</h3>
          <p>Interactive GIS mapping layer — Live Open-Meteo feeds & Citizen Disaster Reports</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Map Layer Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.9)',
              padding: '0.2rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              onClick={() => setMapMode('all')}
              style={{
                background: mapMode === 'all' ? 'var(--primary-blue)' : 'transparent',
                color: mapMode === 'all' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🌐 All Layers
            </button>
            <button
              onClick={() => setMapMode('live')}
              style={{
                background: mapMode === 'live' ? 'var(--primary-blue)' : 'transparent',
                color: mapMode === 'live' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ☀️ Live Weather
            </button>
            <button
              onClick={() => setMapMode('incidents')}
              style={{
                background: mapMode === 'incidents' ? 'var(--primary-blue)' : 'transparent',
                color: mapMode === 'incidents' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🚨 Disaster Indications
            </button>
          </div>

          {/* Dynamic Live / Connecting / Offline Status Symbol */}
          {connectionStatus === 'live' && (
            <div className="map-live-status status-live">
              <div className="live-dot-green"></div>
              <span>LIVE FEED</span>
            </div>
          )}
          {connectionStatus === 'connecting' && (
            <div className="map-live-status status-connecting">
              <div className="connecting-spinner-sm"></div>
              <span>CONNECTING...</span>
            </div>
          )}
          {connectionStatus === 'offline' && (
            <div className="map-live-status status-offline">
              <div className="offline-dot-orange"></div>
              <span>OFFLINE</span>
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div style={{ position: 'absolute', top: '4.5rem', right: '1.5rem', zIndex: 600 }}>
          <LoadingIndicator message="Updating weather layer..." />
        </div>
      )}

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController selectedLocation={selectedLocation} reports={reports} />

        {/* Live Weather Station Markers */}
        {(mapMode === 'all' || mapMode === 'live') &&
          liveWeather.map((station, index) => (
            <LiveWeatherMarker key={`live-${station.city || index}`} station={station} />
          ))}

        {/* Incident Report Markers */}
        {(mapMode === 'all' || mapMode === 'incidents') &&
          reports.map((report) => (
            <ReportMarker key={`report-${report.id}`} report={report} />
          ))}
      </MapContainer>

      <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', zIndex: 500 }}>
        <WeatherLegend />
      </div>
    </GlassCard>
  );
}
