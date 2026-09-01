import React from 'react';
import GlassCard from '../common/GlassCard';

export default function MetricsRow({ reports = [] }) {
  const total = reports.length;
  const verified = reports.filter((r) => r.verification_status === 'verified').length;
  const severe = reports.filter((r) =>
    ['Flood', 'Thunderstorm', 'Heatwave'].includes(r.event_type)
  ).length;

  const activeCitiesCount = new Set(
    reports.map((r) => r.city).filter(Boolean)
  ).size;

  return (
    <section className="metrics-row">
      <GlassCard className="metric-card">
        <div className="metric-icon">📊</div>
        <div className="metric-data">
          <h4>Total Reports</h4>
          <div className="value">{total}</div>
        </div>
      </GlassCard>

      <GlassCard className="metric-card">
        <div className="metric-icon" style={{ color: '#10b981', background: 'rgba(16,185,129,0.15)' }}>
          ✓
        </div>
        <div className="metric-data">
          <h4>Verified Reports</h4>
          <div className="value">{verified}</div>
        </div>
      </GlassCard>

      <GlassCard className="metric-card">
        <div className="metric-icon" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.15)' }}>
          ⚡
        </div>
        <div className="metric-data">
          <h4>Severe Events</h4>
          <div className="value">{severe}</div>
        </div>
      </GlassCard>

      <GlassCard className="metric-card">
        <div className="metric-icon" style={{ color: '#06b6d4', background: 'rgba(6,182,212,0.15)' }}>
          📍
        </div>
        <div className="metric-data">
          <h4>Active Regions</h4>
          <div className="value">{activeCitiesCount}</div>
        </div>
      </GlassCard>
    </section>
  );
}
