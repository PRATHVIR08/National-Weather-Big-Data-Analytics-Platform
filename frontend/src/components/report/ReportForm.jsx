import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GlassCard from '../common/GlassCard';
import LocationPickerMap from './LocationPickerMap';
import CoherencePanel from './CoherencePanel';
import { submitReport, uploadMedia } from '../../services/api';

export default function ReportForm() {
  const navigate = useNavigate();

  const [textContent, setTextContent] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const [gpsStatus, setGpsStatus] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapPickerStatus, setMapPickerStatus] = useState('Click button to select location');

  const [mediaFile, setMediaFile] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success'|'error', content: '' }
  const [submissionResponse, setSubmissionResponse] = useState(null);

  // Capture GPS
  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation is not supported by your browser.');
      return;
    }

    setGpsStatus('Locating position...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLat(latitude.toFixed(6));
        setLng(longitude.toFixed(6));
        setGpsStatus(`✓ GPS captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (err) => {
        setGpsStatus(`GPS Error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Confirm map location picker
  const handleConfirmMapLocation = (pickedLat, pickedLng) => {
    setLat(pickedLat.toFixed(6));
    setLng(pickedLng.toFixed(6));
    setMapPickerStatus(`✓ Map location selected: ${pickedLat.toFixed(4)}, ${pickedLng.toFixed(4)}`);
    setShowMapPicker(false);
  };

  // Media file change
  const handleMediaChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaFile(file);
    setUploadingMedia(true);
    setUploadStatus('Uploading media to weather-media bucket...');

    try {
      const result = await uploadMedia(file);
      setUploadedMediaUrl(result.url);
      setUploadStatus(`✓ Upload complete: ${result.url}`);
    } catch (err) {
      console.error('Media upload error:', err);
      setUploadedMediaUrl(null);
      setUploadStatus(`Upload failed: ${err.message}`);
    } finally {
      setUploadingMedia(false);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setStatusMessage({ type: 'error', text: 'Please provide a valid latitude and longitude.' });
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
        text: `Report Submitted Successfully! Categorized as ${res.event_type || 'Weather Event'}. Calculated Trust Score: ${Math.round(res.trust_score || 0)}/100. Status: ${(res.verification_status || 'pending').toUpperCase()}`,
      });

      // Redirect to home after 8 seconds so user can read coherence details
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
    <GlassCard style={{ padding: '2.5rem' }}>
      <div className="form-header">
        <h2>Submit Weather Incident Report</h2>
        <p>
          Help crowd-verify weather hazards across India. Reports are checked automatically for duplicates and trust scores.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="filter-group full-width">
            <label htmlFor="textContent">Incident Description *</label>
            <textarea
              id="textContent"
              className="form-control"
              rows={4}
              placeholder="Describe the weather condition (e.g. Heavy waterlogging on MG Road, water level 2 feet deep, traffic stuck...)"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              required
            />
          </div>

          <div className="filter-group">
            <label htmlFor="cityInput">City *</label>
            <input
              type="text"
              id="cityInput"
              className="form-control"
              placeholder="e.g. Mumbai, Chennai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div className="filter-group">
            <label htmlFor="stateInput">State *</label>
            <input
              type="text"
              id="stateInput"
              className="form-control"
              placeholder="e.g. Maharashtra, Tamil Nadu"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </div>

          <div className="filter-group">
            <label htmlFor="latInput">Latitude (Auto / Manual) *</label>
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
            <label htmlFor="lngInput">Longitude (Auto / Manual) *</label>
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

          {/* Map Location Picker Trigger */}
          <div className="location-picker-section full-width">
            <button
              type="button"
              className="btn-location-picker"
              onClick={() => setShowMapPicker(!showMapPicker)}
            >
              📍 Pin Location on Map
            </button>
            <span className="location-picker-status" style={{ color: mapPickerStatus.startsWith('✓') ? '#10b981' : 'var(--text-secondary)' }}>
              {mapPickerStatus}
            </span>
          </div>

          {/* Location Picker Map Modal / Container */}
          {showMapPicker && (
            <div className="full-width">
              <LocationPickerMap
                onClose={() => setShowMapPicker(false)}
                onConfirm={handleConfirmMapLocation}
              />
            </div>
          )}

          {/* GPS Location Capture Button */}
          <div className="filter-group full-width" style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={handleCaptureGPS}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, var(--primary-teal), #0d9488)', width: 'fit-content' }}
            >
              📍 Capture Current GPS Location
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
              {gpsStatus}
            </span>
          </div>

          {/* Media Upload */}
          <div className="filter-group full-width">
            <label htmlFor="mediaFile">Photo / Video Proof (Optional — adds +20 Trust Score)</label>
            <input
              type="file"
              id="mediaFile"
              className="form-control"
              accept="image/*,video/*"
              onChange={handleMediaChange}
            />
            {uploadStatus && (
              <div
                style={{
                  fontSize: '0.85rem',
                  color: uploadStatus.startsWith('✓') ? '#10b981' : uploadStatus.includes('failed') ? '#ef4444' : 'var(--primary-teal)',
                  marginTop: '0.4rem',
                }}
              >
                {uploadStatus}
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              borderRadius: '8px',
              background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: statusMessage.type === 'success' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
              color: statusMessage.type === 'success' ? '#10b981' : '#ef4444',
            }}
          >
            <strong>{statusMessage.text}</strong>
          </div>
        )}

        {/* Physical-Social Coherence Result */}
        {submissionResponse?.coherence && (
          <CoherencePanel coherence={submissionResponse.coherence} />
        )}

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link to="/" className="form-control" style={{ width: 'auto', textDecoration: 'none', textAlign: 'center' }}>
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={isSubmitting || uploadingMedia}>
            {isSubmitting ? 'Processing ML Pipeline...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </GlassCard>
  );
}
