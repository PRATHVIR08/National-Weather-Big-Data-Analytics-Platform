import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getEventColor, createCustomReportSvgPin } from '../../utils/weatherUtils';

export default function ReportMarker({ report }) {
  const position = [report.latitude, report.longitude];

  const customIcon = useMemo(() => {
    const color = getEventColor(report.event_type);
    const pinUrl = createCustomReportSvgPin(color);

    return L.icon({
      iconUrl: pinUrl,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -38],
    });
  }, [report.event_type]);

  const score = Math.round(report.trust_score || 50);
  const dateStr = report.posted_at ? new Date(report.posted_at).toLocaleString() : 'N/A';
  const badgeClass = `badge-${(report.event_type || 'other').toLowerCase()}`;
  const statusBadgeClass = `status-${(report.verification_status || 'pending').toLowerCase()}`;

  return (
    <Marker position={position} icon={customIcon}>
      <Popup minWidth={260}>
        <div>
          <div className="popup-header">
            <span className="popup-title">{report.city || 'Incident Location'}</span>
            <span className={`popup-badge ${badgeClass}`}>{report.event_type || 'Weather'}</span>
          </div>

          <div style={{ margin: '0.4rem 0' }}>
            <span className={`popup-badge ${statusBadgeClass}`} style={{ textTransform: 'uppercase' }}>
              {report.verification_status || 'PENDING'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '0.5rem' }}>
              Trust Score: <strong>{score}/100</strong>
            </span>
          </div>

          <p className="popup-body">{report.text_content}</p>

          {report.photo_url && (
            <img src={report.photo_url} alt="Report proof" className="popup-img" />
          )}

          <div className="popup-meta" style={{ marginTop: '0.5rem' }}>
            <span>Source: <strong>{report.source}</strong></span>
            <span>{dateStr}</span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
