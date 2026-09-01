import React, { useState } from 'react';
import GlassCard from '../common/GlassCard';

export default function AdminLogin({ onLoginSuccess, onOpenCapModal }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (email && password.length >= 4) {
      // Fallback local dev token or Supabase session
      const devToken = 'dev_admin_jwt_session_token';
      localStorage.setItem('admin_jwt', devToken);
      onLoginSuccess(devToken);
    } else {
      setError('Invalid credentials. Password must be at least 4 characters.');
    }
  };

  return (
    <GlassCard style={{ maxWidth: '440px', margin: '3rem auto', padding: '2rem', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2>Admin Login</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Sign in with admin credentials to manage report verifications.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="filter-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="adminEmail">Email Address</label>
          <input
            type="email"
            id="adminEmail"
            className="form-control"
            placeholder="admin@weather.gov.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="filter-group" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="adminPassword">Password</label>
          <input
            type="password"
            id="adminPassword"
            className="form-control"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Sign In to Panel
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Demonstration Emergency Mode:
        </p>
        <button
          type="button"
          onClick={onOpenCapModal}
          style={{
            width: '100%',
            padding: '0.65rem',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
          }}
        >
          🚨 Launch CAP Emergency Dispatch
        </button>
      </div>
    </GlassCard>
  );
}
