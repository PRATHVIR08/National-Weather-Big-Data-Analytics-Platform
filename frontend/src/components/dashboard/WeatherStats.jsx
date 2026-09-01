import React from 'react';
import GlassCard from '../common/GlassCard';

export default function WeatherStats({ liveWeather = [] }) {
  const temperatures = liveWeather
    .map((item) => Number(item.temperature))
    .filter(Number.isFinite);

  const humidityList = liveWeather
    .map((item) => Number(item.humidity))
    .filter(Number.isFinite);

  const windList = liveWeather
    .map((item) => Number(item.wind_speed))
    .filter(Number.isFinite);

  const avgTemp = temperatures.length > 0
    ? `${Math.round(temperatures.reduce((a, b) => a + b, 0) / temperatures.length)} °C`
    : '-- °C';

  const maxTemp = temperatures.length > 0
    ? `${Math.round(Math.max(...temperatures))} °C`
    : '-- °C';

  const avgHumidity = humidityList.length > 0
    ? `${Math.round(humidityList.reduce((a, b) => a + b, 0) / humidityList.length)} %`
    : '-- %';

  const maxWind = windList.length > 0
    ? `${Math.round(Math.max(...windList))} km/h`
    : '-- km/h';

  return (
    <section className="weather-summary-row">
      <GlassCard className="weather-summary-card">
        <div className="summary-icon">🌡️</div>
        <div>
          <span>Live Avg Temp</span>
          <strong>{avgTemp}</strong>
        </div>
      </GlassCard>

      <GlassCard className="weather-summary-card">
        <div className="summary-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>
          🔥
        </div>
        <div>
          <span>Highest Temperature</span>
          <strong>{maxTemp}</strong>
        </div>
      </GlassCard>

      <GlassCard className="weather-summary-card">
        <div className="summary-icon" style={{ background: 'rgba(6,182,212,0.12)' }}>
          💧
        </div>
        <div>
          <span>Average Humidity</span>
          <strong>{avgHumidity}</strong>
        </div>
      </GlassCard>

      <GlassCard className="weather-summary-card">
        <div className="summary-icon" style={{ background: 'rgba(168,85,247,0.12)' }}>
          💨
        </div>
        <div>
          <span>Maximum Wind Speed</span>
          <strong>{maxWind}</strong>
        </div>
      </GlassCard>
    </section>
  );
}
