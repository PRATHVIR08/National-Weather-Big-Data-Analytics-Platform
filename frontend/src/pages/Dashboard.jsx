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

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [liveWeather, setLiveWeather] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);

  const loadReportsData = useCallback(async (filters = {}) => {
    setIsLoadingMap(true);
    try {
      const data = await fetchReports(filters);
      setReports(data || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoadingMap(false);
    }
  }, []);

  const loadLiveWeatherData = useCallback(async () => {
    try {
      const response = await fetchLiveWeather();
      setLiveWeather(response.data || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load live weather:', err);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
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
