import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GlassCard from '../common/GlassCard';
import LocationPickerMap from './LocationPickerMap';
import CoherencePanel from './CoherencePanel';
import { submitReport, uploadMedia } from '../../services/api';

const HAZARD_PRESETS = [
  { id: 'flood', label: '🌊 Flood / Waterlogging', text: 'Waterlogging reported on road. Water depth approximately 1.5 - 2 feet causing severe traffic disruption.' },
  { id: 'thunderstorm', label: '⛈️ Thunderstorm / Heavy Rain', text: 'Heavy rainfall accompanied by frequent lightning and strong winds. Low visibility.' },
  { id: 'heatwave', label: '🔥 Extreme Heatwave', text: 'Extreme scorching heatwave condition. Temperature exceeding normal levels, dry gusty winds.' },
  { id: 'fog', label: '🌫️ Dense Fog / Smog', text: 'Dense morning fog reducing highway visibility to under 50 meters. Heavy traffic slowdown.' },
  { id: 'duststorm', label: '🌪️ Dust Storm / Sandstorm', text: 'High velocity dust storm reducing air clarity significantly with strong blowing sand.' },
  { id: 'strongwind', label: '💨 High Winds / Gale', text: 'Gale force winds blowing down tree branches and temporary signage boards.' },
];

export default function ReportForm() {
  const navigate = useNavigate();

  const [textContent, setTextContent] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const [gpsStatus, setGpsStatus] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapPickerStatus, setMapPickerStatus] = useState('');

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [submissionResponse, setSubmissionResponse] = useState(null);

  // Live estimated trust score preview (0-100)
  const [estimatedTrustScore, setEstimatedTrustScore] = useState(30);

  useEffect(() => {
    let score = 20; // base score for submission
    if (textContent.trim().length > 20) score += 15;
    if (city.trim() && state.trim()) score += 15;
    if (lat && lng) score += 20; // GPS location bonus
    if (uploadedMediaUrl || mediaFile) score += 20; // Media upload bonus
    if (score > 100) score = 100;
    setEstimatedTrustScore(score);
  }, [textContent, city, state, lat, lng, uploadedMediaUrl, mediaFile]);

  // Handle Preset Pill Selection
  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    if (!textContent || HAZARD_PRESETS.some(p => textContent === p.text)) {
      setTextContent(preset.text);
    } else {
      setTextContent((prev) => `${preset.label}: ${prev}`);
    }
  };

  // Capture GPS
  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation is not supported by your browser.');
      return;
    }

    setGpsStatus('📡 Locating current GPS position...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLat(latitude.toFixed(6));
        setLng(longitude.toFixed(6));
        setGpsStatus(`✓ GPS locked: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`);
      },
      (err) => {
        setGpsStatus(`⚠️ GPS Error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Confirm map location picker
  const handleConfirmMapLocation = (pickedLat, pickedLng) => {
    setLat(pickedLat.toFixed(6));
    setLng(pickedLng.toFixed(6));
    setMapPickerStatus(`✓ Selected on map: ${pickedLat.toFixed(4)}°, ${pickedLng.toFixed(4)}°`);
    setShowMapPicker(false);
  };

  // Media file upload & preview
  const handleMediaChange = async (file) => {
    if (!file) return;

    setMediaFile(file);
    setMediaPreviewUrl(URL.createObjectURL(file));
    setUploadingMedia(true);
    setUploadStatus('Uploading media to cloud storage...');

    try {
      const result = await uploadMedia(file);
      setUploadedMediaUrl(result.url);
      setUploadStatus(`✓ Upload complete! (+20 Trust Boost)`);
    } catch (err) {
      console.error('Media upload error:', err);
      setUploadedMediaUrl(null);
      setUploadStatus(`Upload error: ${err.message}`);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleMediaChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreviewUrl(null);
    setUploadedMediaUrl(null);
    setUploadStatus('');
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setStatusMessage({ type: 'error', text: 'Please select or enter valid location coordinates.' });
      return;
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setStatusMessage({ type: 'error', text: 'Coordinates must be valid lat [-90,90] and lng [-180,180].' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    setSubmissionResponse(null);

    const payload = {
      source: 'citizen',
      text_content: textContent,
      city: city,
      state: state,
      latitude: latitude,
      longitude: longitude,
      photo_url: uploadedMediaUrl,
      video_url: null,
      posted_at: new Date().toISOString(),
    };

    try {
      const res = await submitReport(payload);
      setSubmissionResponse(res);
      setStatusMessage({
        type: 'success',
        text: `Report Successfully Submitted! Event: ${res.event_type || 'Weather Incident'} | Calculated Trust Score: ${Math.round(res.trust_score || 0)}/100 | Status: ${(res.verification_status || 'pending').toUpperCase()}`,
      });

      // Redirect after 8s so user can read physical-social coherence analysis panel
      setTimeout(() => {
        navigate('/');
      }, 8000);
    } catch (err) {
      console.error('Submission error:', err);
      setStatusMessage({ type: 'error', text: `Submission Error: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassCard style={{ padding: '2.5rem', background: 'rgba(17, 24, 39, 0.85)' }}>
      {/* Form Title & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', background: 'linear-gradient(135deg, var(--primary-teal), #06b6d4)', padding: '0.4rem 0.6rem', borderRadius: '12px' }}>
              📡
            </span>
            <h2 style={{ fontSize: '1.6rem', background: 'linear-gradient(90deg, #ffffff, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Report Weather Incident
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px' }}>
            Contribute crowd-sourced meteorological reports. Submissions are processed in real-time by Scikit-Learn NLP classification, Semantic Deduplication, and the Physical-Social Coherence Engine.
          </p>
        </div>

        {/* Live Estimated Trust Score Preview Gauge */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '0.85rem 1.2rem',
            minWidth: '200px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Estimated Trust Score
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: estimatedTrustScore >= 70 ? '#10b981' : estimatedTrustScore >= 50 ? '#f59e0b' : '#38bdf8', margin: '0.2rem 0' }}>
            {estimatedTrustScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ 100</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${estimatedTrustScore}%`,
                height: '100%',
                background: estimatedTrustScore >= 70 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Preset Hazard Pills Selector */}
      <div style={{ marginBottom: '1.75rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.6rem' }}>
          ⚡ Quick Select Hazard Type:
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {HAZARD_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid var(--primary-teal)' : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected ? 'rgba(20, 184, 166, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 12px rgba(20, 184, 166, 0.3)' : 'none',
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Incident Description */}
          <div className="filter-group full-width">
            <label htmlFor="textContent" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Incident Description *
            </label>
            <textarea
              id="textContent"
              className="form-control"
              rows={4}
              placeholder="Provide a detailed description of the weather hazard (e.g., Heavy waterlogging near station road, 2 feet deep water, traffic standstill...)"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              required
              style={{ fontSize: '0.92rem', padding: '0.8rem', borderRadius: '10px' }}
            />
          </div>

          {/* City & State */}
          <div className="filter-group">
            <label htmlFor="cityInput" style={{ fontWeight: 600 }}>City *</label>
            <input
              type="text"
              id="cityInput"
              className="form-control"
              placeholder="e.g. Mumbai, Bengaluru, Delhi"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div className="filter-group">
            <label htmlFor="stateInput" style={{ fontWeight: 600 }}>State *</label>
            <input
              type="text"
              id="stateInput"
              className="form-control"
              placeholder="e.g. Maharashtra, Karnataka"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </div>

          {/* Location Action Buttons (GPS & Map Picker) */}
          <div className="full-width" style={{ marginTop: '0.5rem', background: 'rgba(15, 23, 42, 0.5)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>
              📍 Location Pin & Coordinates Selection *
            </span>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleCaptureGPS}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, var(--primary-teal), #0d9488)', borderRadius: '8px' }}
              >
                📡 Capture Live GPS
              </button>

              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className="reset-button"
                style={{ width: 'auto', padding: '0.6rem 1.25rem', border: '1px solid var(--primary-blue)', color: '#60a5fa', fontWeight: 600, borderRadius: '8px' }}
              >
                🗺️ Pin Location on Interactive Map
              </button>

              {(gpsStatus || mapPickerStatus) && (
                <span style={{ fontSize: '0.85rem', color: (gpsStatus.includes('✓') || mapPickerStatus.includes('✓')) ? '#10b981' : 'var(--text-secondary)', fontWeight: 500 }}>
                  {mapPickerStatus || gpsStatus}
                </span>
              )}
            </div>

            {/* Latitude & Longitude Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="filter-group">
                <label htmlFor="latInput" style={{ fontSize: '0.8rem' }}>Latitude</label>
                <input
                  type="number"
                  step="any"
                  id="latInput"
                  className="form-control"
                  placeholder="e.g. 19.0760"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  required
                />
              </div>
              <div className="filter-group">
                <label htmlFor="lngInput" style={{ fontSize: '0.8rem' }}>Longitude</label>
                <input
                  type="number"
                  step="any"
                  id="lngInput"
                  className="form-control"
                  placeholder="e.g. 72.8777"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Map Picker Modal Container */}
            {showMapPicker && (
              <div style={{ marginTop: '1rem' }}>
                <LocationPickerMap
                  onClose={() => setShowMapPicker(false)}
                  onConfirm={handleConfirmMapLocation}
                />
              </div>
            )}
          </div>

          {/* Drag and Drop Media Upload Zone */}
          <div className="filter-group full-width" style={{ marginTop: '0.5rem' }}>
            <label style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📸 Media Proof (Photo / Video)</span>
              <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                +20 Trust Score Boost
              </span>
            </label>

            {!mediaFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                style={{
                  border: '2px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  background: 'rgba(15, 23, 42, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => document.getElementById('mediaFileInput').click()}
              >
                <input
                  type="file"
                  id="mediaFileInput"
                  style={{ display: 'none' }}
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files?.[0] && handleMediaChange(e.target.files[0])}
                />
                <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>📷</div>
                <div style={{ fontWeight: 600, color: '#f3f4f6', fontSize: '0.95rem' }}>
                  Click or drag photo/video file here to upload
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Supports PNG, JPG, WEBP, MP4 (Max 15MB)
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {mediaPreviewUrl && mediaFile.type.startsWith('image') ? (
                    <img
                      src={mediaPreviewUrl}
                      alt="Preview"
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                    />
                  ) : (
                    <div style={{ width: '60px', height: '60px', background: 'rgba(59,130,246,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      🎥
                    </div>
                  )}

                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{mediaFile.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {(mediaFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                    {uploadStatus && (
                      <div style={{ fontSize: '0.78rem', color: uploadStatus.includes('✓') ? '#10b981' : uploadStatus.includes('error') ? '#ef4444' : '#38bdf8', marginTop: '0.2rem' }}>
                        {uploadStatus}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '6px', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Notification Message */}
        {statusMessage && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              borderRadius: '12px',
              background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: statusMessage.type === 'success' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
              color: statusMessage.type === 'success' ? '#34d399' : '#ef4444',
            }}
          >
            <strong>{statusMessage.text}</strong>
          </div>
        )}

        {/* Physical-Social Coherence Analysis Output */}
        {submissionResponse?.coherence && (
          <CoherencePanel coherence={submissionResponse.coherence} />
        )}

        {/* Submit Actions */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
          <Link
            to="/"
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || uploadingMedia}
            style={{ padding: '0.75rem 2rem', fontSize: '0.95rem', borderRadius: '8px' }}
          >
            {isSubmitting ? '🔄 Processing ML Engine...' : '🚀 Submit Report'}
          </button>
        </div>
      </form>
    </GlassCard>
  );
}
