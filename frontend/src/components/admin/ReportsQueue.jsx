import React, { useState, useEffect, useCallback } from 'react';
import GlassCard from '../common/GlassCard';
import { fetchAdminReports, verifyReport, rejectReport } from '../../services/api';

export default function ReportsQueue({ onLogout }) {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReports = useCallback(async (filter) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchAdminReports(filter);
      setReports(data || []);
    } catch (err) {
      console.error('Fetch admin reports error:', err);
      setError(err.message || 'Failed to fetch admin reports.');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports(statusFilter);
  }, [statusFilter, loadReports]);

  const handleVerify = async (id) => {
    try {
      await verifyReport(id);
      loadReports(statusFilter);
    } catch (err) {
      alert(`Failed to verify: ${err.message}`);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectReport(id);
      loadReports(statusFilter);
    } catch (err) {
      alert(`Failed to reject: ${err.message}`);
    }
  };

  const titleMap = {
    pending: 'Pending Verification Queue',
    verified: 'Verified Incident Reports',
    rejected: 'Rejected Incident Reports',
    all: 'All Incident Reports Overview',
  };

  return (
    <GlassCard style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>{titleMap[statusFilter] || 'Incident Reports'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage incident reports submitted by citizens and external sources.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="form-control" style={{ cursor: 'pointer' }} onClick={() => loadReports(statusFilter)}>
            🔄 Refresh Queue
          </button>
          <button className="btn-danger" style={{ cursor: 'pointer' }} onClick={onLogout}>
            Log Out
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        {[
          { key: 'pending', label: '⏳ Pending Queue' },
          { key: 'verified', label: '✓ Verified Reports' },
          { key: 'rejected', label: '✕ Rejected Reports' },
          { key: 'all', label: '📁 All Reports' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: statusFilter === tab.key ? '1px solid var(--primary-teal)' : '1px solid rgba(255,255,255,0.1)',
              background: statusFilter === tab.key ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
              color: statusFilter === tab.key ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Source</th>
              <th>Event</th>
              <th>Location</th>
              <th>Report Text</th>
              <th>Status & Trust</th>
              <th>Posted At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  Fetching {statusFilter} reports...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: '#ef4444', padding: '2rem' }}>
                  {error}
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                  ✨ No reports found for category '{statusFilter}'.
                </td>
              </tr>
            ) : (
              reports.map((r) => {
                const eventClass = `badge-${(r.event_type || 'other').toLowerCase()}`;
                const score = Math.round(r.trust_score || 50);
                const dateStr = r.posted_at ? new Date(r.posted_at).toLocaleString() : 'N/A';

                const statusVal = (r.verification_status || 'pending').toLowerCase();
                let statusBadgeClass = 'status-pending';
                if (statusVal === 'verified') statusBadgeClass = 'status-verified';
                if (statusVal === 'rejected') statusBadgeClass = 'status-rejected';

                return (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>
                      <span className="popup-badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                        {r.source}
                      </span>
                    </td>
                    <td>
                      <span className={`popup-badge ${eventClass}`}>{r.event_type}</span>
                    </td>
                    <td>
                      <strong>{r.city}</strong>, {r.state}
                    </td>
                    <td style={{ maxWidth: '280px', fontSize: '0.85rem' }}>
                      {r.text_content}
                      {r.photo_url && (
                        <div>
                          <a href={r.photo_url} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: '0.75rem' }}>
                            View Media
                          </a>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`popup-badge ${statusBadgeClass}`}>{statusVal.toUpperCase()}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Score: {score}/100
                      </div>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{dateStr}</td>
                    <td>
                      <div className="action-btns">
                        {statusVal !== 'verified' && (
                          <button className="btn-success" onClick={() => handleVerify(r.id)}>
                            ✓ Verify
                          </button>
                        )}
                        {statusVal !== 'rejected' && (
                          <button className="btn-danger" onClick={() => handleReject(r.id)}>
                            ✕ Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
