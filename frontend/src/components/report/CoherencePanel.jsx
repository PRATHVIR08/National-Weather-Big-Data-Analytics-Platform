import React from 'react';
import GlassCard from '../common/GlassCard';

export default function CoherencePanel({ coherence }) {
  if (!coherence) return null;

  const statusColors = {
    STRONG_COHERENCE: '#10b981',
    PARTIAL_COHERENCE: '#f59e0b',
    LOW_COHERENCE: '#ef4444',
  };

  const statusColor = statusColors[coherence.status] || 'var(--text-secondary)';

  return (
    <div
      style={{
        marginTop: '1.5rem',
        padding: '1.25rem',
        borderRadius: '12px',
        border: '1px solid rgba(56,189,248,0.3)',
        background: 'rgba(15,23,42,0.7)',
      }}
    >
      <h3 style={{ marginBottom: '0.8rem', color: '#fff', fontSize: '1.2rem' }}>
        🌐 Physical–Social Coherence Check
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Comparing citizen-reported hazard against physical weather observations & satellite feeds.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.8rem',
        }}
      >
        <GlassCard style={{ padding: '1rem' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Status</small>
          <div style={{ fontWeight: 700, marginTop: '5px', color: statusColor, fontSize: '0.95rem' }}>
            {coherence.status || 'UNKNOWN'}
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '1rem' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Coherence Score</small>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '5px', color: '#38bdf8' }}>
            {coherence.coherence_score || 0}/100
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '1rem' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Trust Boost</small>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '5px', color: '#34d399' }}>
            +{coherence.trust_boost || 0}
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '1rem' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Temperature</small>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '5px' }}>
            {coherence.weather?.temperature !== null && coherence.weather?.temperature !== undefined
              ? `${coherence.weather.temperature}°C`
              : '—'}
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '1rem' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Humidity</small>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '5px' }}>
            {coherence.weather?.humidity !== null && coherence.weather?.humidity !== undefined
              ? `${coherence.weather.humidity}%`
              : '—'}
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '1rem' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Rain</small>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '5px' }}>
            {coherence.weather?.rain !== null && coherence.weather?.rain !== undefined
              ? `${coherence.weather.rain} mm`
              : '—'}
          </div>
        </GlassCard>
      </div>

      <div
        style={{
          marginTop: '1rem',
          padding: '0.8rem',
          borderRadius: '8px',
          background: 'rgba(30,41,59,0.7)',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
        }}
      >
        {coherence.reason || 'No detail provided.'}
      </div>
    </div>
  );
}
