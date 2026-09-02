import React, { useState, useEffect, useCallback } from 'react';
import FiltersScope from '../components/dashboard/FiltersScope';
import MetricsRow from '../components/dashboard/MetricsRow';
import LiveWeatherBar from '../components/dashboard/LiveWeatherBar';
import WeatherStats from '../components/dashboard/WeatherStats';
import WeatherSearch from '../components/dashboard/WeatherSearch';
import WeatherMap from '../components/dashboard/WeatherMap';
import IncidentCharts from '../components/dashboard/IncidentCharts';
import AgriAdvisory from '../components/dashboard/AgriAdvisory';
import { fetchReports, fetchLiveWeather } from '../services/api';
import { useConnection } from '../context/ConnectionContext';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [liveWeather, setLiveWeather] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { isOffline, setConnectionStatus, checkBackendHealth } = useConnection();

  const loadReportsData = useCallback(async (filters = {}) => {
    setIsLoadingMap(true);
    try {
      const res = await fetchReports(filters);
      setReports(res.data || []);
      if (!res.isLive) {
        setConnectionStatus('offline');
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoadingMap(false);
    }
  }, [setConnectionStatus]);

  const loadLiveWeatherData = useCallback(async () => {
    try {
      const res = await fetchLiveWeather();
      setLiveWeather(res.data || []);
      setLastUpdated(new Date().toLocaleTimeString());
      if (res.isLive) {
        setConnectionStatus('live');
      } else {
        setConnectionStatus('offline');
      }
    } catch (err) {
      console.error('Failed to load live weather:', err);
      setConnectionStatus('offline');
    }
  }, [setConnectionStatus]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkBackendHealth();
    await Promise.all([loadReportsData(activeFilters), loadLiveWeatherData()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadReportsData({});
    loadLiveWeatherData();

    // Auto refresh live weather every 5 minutes
    const interval = setInterval(() => {
      loadLiveWeatherData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadReportsData, loadLiveWeatherData]);

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setSelectedLocation(null);
    loadReportsData(filters);
  };

  const handleResetFilters = () => {
    setActiveFilters({});
    setSelectedLocation(null);
    loadReportsData({});
  };

  const handleSelectCityLocation = (coords, zoom) => {
    setSelectedLocation({ center: coords, zoom: zoom });
  };

  return (
    <div className="dashboard-container">
      {/* Offline Mode Alert Banner */}
      {isOffline && (
        <div className="offline-notice-banner">
          <div className="offline-notice-content">
            <span className="offline-icon">⚡</span>
            <div>
              <strong>Backend Disconnected / Not Running</strong>
              <p>Operating in Offline Mode — Displaying cached weather telemetry & local hazard reports across India.</p>
            </div>
          </div>
          <button className="btn-offline-retry" onClick={handleRefresh}>
            🔄 Retry Connection
          </button>
        </div>
      )}

      <LiveWeatherBar
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <FiltersScope
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      <main className="main-content">
        <WeatherStats liveWeather={liveWeather} />

        <MetricsRow reports={reports} />

        <WeatherMap
          reports={reports}
          liveWeather={liveWeather}
          isLoading={isLoadingMap}
          selectedLocation={selectedLocation}
        />

        <WeatherSearch onSelectCityLocation={handleSelectCityLocation} />

        <IncidentCharts reports={reports} />

        <AgriAdvisory />
      </main>
    </div>
  );
}
