// Leaflet Map Initialization and Pin Rendering
let weatherMap = null;
let markerGroup = null;

const EVENT_COLOR_MAP = {
    "Flood": "#3b82f6",
    "Heatwave": "#ef4444",
    "Thunderstorm": "#a855f7",
    "Fog": "#94a3b8",
    "DustStorm": "#eab308",
    "StrongWind": "#06b6d4",
    "Other": "#64748b"
};

function initWeatherMap(containerId = "map") {
    if (weatherMap) return weatherMap;

    // Centered on India
    weatherMap = L.map(containerId, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true
    });

    // Dark styled OpenStreetMap CartoDB tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(weatherMap);

    markerGroup = L.layerGroup().addTo(weatherMap);
    return weatherMap;
}

function createCustomPin(eventType) {
    const color = EVENT_COLOR_MAP[eventType] || EVENT_COLOR_MAP["Other"];
    const svgPin = `
        <svg width="32" height="42" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="${color}" fill-opacity="0.95"/>
            <circle cx="12" cy="12" r="5" fill="#ffffff"/>
        </svg>
    `;
    return L.divIcon({
        className: 'custom-weather-pin',
        html: svgPin,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -36]
    });
}

function updateMapMarkers(reports) {
    if (!weatherMap || !markerGroup) return;
    markerGroup.clearLayers();

    reports.forEach(report => {
        if (!report.latitude || !report.longitude) return;

        const icon = createCustomPin(report.event_type);
        const marker = L.marker([report.latitude, report.longitude], { icon });

        const dateStr = report.posted_at ? new Date(report.posted_at).toLocaleString('en-IN') : 'Recent';
        const mediaHtml = report.photo_url 
            ? `<img src="${report.photo_url}" class="popup-img" alt="Weather media" onerror="this.style.display='none'"/>` 
            : '';

        const eventClass = `badge-${(report.event_type || 'other').toLowerCase()}`;
        const trustBadgeClass = report.trust_score >= 70 ? 'status-verified' : (report.trust_score >= 40 ? 'status-pending' : 'status-rejected');

        const popupContent = `
            <div class="popup-card">
                <div class="popup-header">
                    <span class="popup-title">${report.city}, ${report.state}</span>
                    <span class="popup-badge ${eventClass}">${report.event_type}</span>
                </div>
                <div class="popup-body">${escapeHtml(report.text_content)}</div>
                ${mediaHtml}
                <div class="popup-meta" style="margin-top:0.5rem;">
                    <span>Score: <strong class="popup-badge ${trustBadgeClass}">${Math.round(report.trust_score)}/100</strong></span>
                    <span>${dateStr}</span>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
        markerGroup.addLayer(marker);
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}
