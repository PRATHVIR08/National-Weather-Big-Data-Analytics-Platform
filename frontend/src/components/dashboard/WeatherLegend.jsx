import React from 'react';

export default function WeatherLegend() {
  const items = [
    { label: '< 15 °C', color: '#38bdf8' },
    { label: '15 – 20 °C', color: '#60a5fa' },
    { label: '20 – 25 °C', color: '#34d399' },
    { label: '25 – 30 °C', color: '#facc15' },
    { label: '30 – 35 °C', color: '#fb923c' },
    { label: '35 – 40 °C', color: '#f87171' },
    { label: '> 40 °C', color: '#ef4444' },
  ];

  return (
    <div className="weather-map-legend">
      <div className="legend-title">Temperature Legend</div>
      {items.map((item, idx) => (
        <div key={idx} className="legend-row">
          <span className="legend-color" style={{ backgroundColor: item.color }}></span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
