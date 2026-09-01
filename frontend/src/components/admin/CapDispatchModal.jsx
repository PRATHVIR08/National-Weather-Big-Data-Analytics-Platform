import React, { useState } from 'react';
import { dispatchCapAlert } from '../../services/api';

export default function CapDispatchModal({ isOpen, onClose }) {
  const [region, setRegion] = useState('All India');
  const [event, setEvent] = useState('Flash Flood Warning');
  const [severity, setSeverity] = useState('EXTREME');
  const [urgency, setUrgency] = useState('Immediate');
  const [certainty, setCertainty] = useState('Observed');
  const [chanSms, setChanSms] = useState(true);
  const [chanEmail, setChanEmail] = useState(true);
  const [headline, setHeadline] = useState(
    'CRITICAL: Severe Flash Flood Warning - Evacuate Low-Lying Riverbanks'
  );
  const [description, setDescription] = useState(
    'Heavy water release from reservoirs coupled with cloudburst. Evacuate low-lying riverbanks immediately. Move to designated emergency shelters on higher ground.'
  );

  const [isDispatching, setIsDispatching] = useState(false);
  const [receipt, setReceipt] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const channels = [];
    if (chanSms) channels.push('sms');
    if (chanEmail) channels.push('email');

    if (channels.length === 0) {
      alert('Please select at least one delivery channel (SMS or Email).');
      return;
    }

    const payload = {
      region,
      event,
      severity,
      urgency,
      certainty,
      headline,
      description,
      channels,
    };

    setIsDispatching(true);
    try {
      const response = await dispatchCapAlert(payload);
      setReceipt(response.dispatch_receipt);
    } catch (err) {
      alert(`Dispatch failed: ${err.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          background: '#1e293b',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '16px',
          maxWidth: '650px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '1rem',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: '#f8fafc',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>🚨</span> CAP Emergency Broadcast Dispatch
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
              OASIS Common Alerting Protocol v1.2 Multi-Channel Alert System
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 500 }}>
                Target Region / State
              </label>
              <select
                className="form-control"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="All India">All India (Nationwide)</option>
                <option value="Punjab">Punjab</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Assam">Assam</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Gujarat">Gujarat</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 500 }}>
                Hazard Event Type
              </label>
              <select
                className="form-control"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
              >
                <option value="Flash Flood Warning">Flash Flood Warning</option>
                <option value="Severe Thunderstorm">Severe Thunderstorm Alert</option>
                <option value="Extreme Heatwave">Extreme Heatwave Advisory</option>
                <option value="Tropical Cyclone Warning">Tropical Cyclone Warning</option>
                <option value="Landslide Threat">Landslide Threat Alert</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 500 }}>
                Severity Level
              </label>
              <select
                className="form-control"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                style={{ color: '#f87171', fontWeight: 600 }}
              >
                <option value="EXTREME">🔴 EXTREME</option>
                <option value="SEVERE">🟠 SEVERE</option>
                <option value="MODERATE">🟡 MODERATE</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 500 }}>
                Urgency
              </label>
              <select
                className="form-control"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="Immediate">Immediate Action</option>
                <option value="Expected">Expected within 1-6 hrs</option>
                <option value="Future">Future Threat</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 500 }}>
                Certainty
              </label>
              <select
                className="form-control"
                value={certainty}
                onChange={(e) => setCertainty(e.target.value)}
              >
                <option value="Observed">Observed (High)</option>
                <option value="Likely">Likely (&gt;50%)</option>
              </select>
            </div>
          </div>

          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              Broadcast Delivery Channels
            </label>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={chanSms}
                  onChange={(e) => setChanSms(e.target.checked)}
                  style={{ accentColor: '#0284c7' }}
                />
                📱 SMS Gateway (Twilio Mock)
              </label>
              <label style={{ color: '#a7f3d0', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={chanEmail}
                  onChange={(e) => setChanEmail(e.target.checked)}
                  style={{ accentColor: '#10b981' }}
                />
                📧 Email Bulletin (SMTP Mock)
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 500 }}>
              Alert Headline
            </label>
            <input
              type="text"
              className="form-control"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 500 }}>
              Detailed Emergency Description & Guidance
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'transparent',
                color: '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDispatching}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {isDispatching ? '⏳ Dispatching Multi-Channel Alert...' : '🚀 Broadcast Alert Now'}
            </button>
          </div>
        </form>

        {/* Receipt Display */}
        {receipt && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ color: '#34d399', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✅</span> CAP Emergency Alert Dispatched Successfully
                </h3>
                <span style={{ background: '#10b981', color: '#064e3b', fontWeight: 800, fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                  {receipt.status}
                </span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                Identifier: <strong style={{ color: '#fff' }}>{receipt.alert_identifier}</strong> | Target: <strong style={{ color: '#38bdf8' }}>{receipt.region}</strong> | Total People Reached: <strong style={{ color: '#f59e0b' }}>{receipt.total_population_notified?.toLocaleString()}</strong>
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>📱 SMS GATEWAY (Twilio Mock)</div>
                  <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '1.1rem' }}>
                    {receipt.sms_metrics?.enabled ? `${receipt.sms_metrics.recipients_reached?.toLocaleString()} Contacts` : 'Disabled'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Batch SID: {receipt.sms_metrics?.batch_sid || 'N/A'}
                  </div>
                </div>

                <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>📧 EMAIL BULLETIN (SMTP Mock)</div>
                  <div style={{ color: '#a7f3d0', fontWeight: 700, fontSize: '1.1rem' }}>
                    {receipt.email_metrics?.enabled ? `${receipt.email_metrics.recipients_reached?.toLocaleString()} Subscribers` : 'Disabled'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Batch ID: {receipt.email_metrics?.batch_id || 'N/A'}
                  </div>
                </div>
              </div>

              <details style={{ marginTop: '0.5rem', background: '#0f172a', borderRadius: '8px', padding: '0.75rem' }}>
                <summary style={{ color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                  View OASIS CAP v1.2 XML Payload
                </summary>
                <pre style={{ color: '#38bdf8', fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', marginTop: '0.5rem', overflowX: 'auto' }}>
                  {receipt.cap_xml}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
