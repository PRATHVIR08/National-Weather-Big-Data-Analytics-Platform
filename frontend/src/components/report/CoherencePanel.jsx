import React from 'react';
import GlassCard from '../common/GlassCard';

export default function CoherencePanel({ coherence }) {
  if (!coherence) return null;

  const statusMap = {
    STRONG_COHERENCE: { label: '✓ Strong Coherence', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981' },
    PARTIAL_COHERENCE: { label: '⚠️ Partial Coherence', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b' },
    LOW_COHERENCE: { label: '✕ Low Coherence', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444' },
  };

  const statusInfo = statusMap[coherence.status] || {
    label: coherence.status || 'UNKNOWN',
    color: 'var(--text-secondary)',
    bg: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
  };

  return (
    <div
      style={{
        marginTop: '1.75rem',
        padding: '1.5rem',
        borderRadius: '16px',
        border: `1px solid ${statusInfo.border}`,
        background: 'rgba(15, 23, 42, 0.85)',
        boxShadow: `0 8px 25px -5px ${statusInfo.bg}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🌐</span> Physical–Social Coherence ML Analysis
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>
            Cross-referencing report against Open-Meteo physical weather observations & satellite radar.
          </p>
        </div>

        <span
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '20px',
            background: statusInfo.bg,
            color: statusInfo.color,
            border: `1px solid ${statusInfo.border}`,
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          {statusInfo.label}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1rem',
        }}
      >
        <GlassCard style={{ padding: '0.85rem' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Coherence Score</small>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            {coherence.coherence_score || 0}/100
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '0.85rem' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Trust Boost</small>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
            +{coherence.trust_boost || 0}
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '0.85rem' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Observed Temp</small>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f87171', marginTop: '4px' }}>
            {coherence.weather?.temperature !== null && coherence.weather?.temperature !== undefined
              ? `${coherence.weather.temperature}°C`
              : '—'}
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '0.85rem' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Observed Humidity</small>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#67e8f9', marginTop: '4px' }}>
            {coherence.weather?.humidity !== null && coherence.weather?.humidity !== undefined
              ? `${coherence.weather.humidity}%`
              : '—'}
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '0.85rem' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Precipitation Rain</small>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#60a5fa', marginTop: '4px' }}>
            {coherence.weather?.rain !== null && coherence.weather?.rain !== undefined
              ? `${coherence.weather.rain} mm`
              : '—'}
          </div>
        </GlassCard>
      </div>

      <div
        style={{
          padding: '0.85rem 1rem',
          borderRadius: '8px',
          background: 'rgba(30, 41, 59, 0.8)',
          borderLeft: `4px solid ${statusInfo.color}`,
          color: 'var(--text-primary)',
          fontSize: '0.88rem',
        }}
      >
        <strong>Validation Insight:</strong> {coherence.reason || 'Report cross-referenced with real-time physical telemetry.'}
      </div>
    </div>
  );
}
