// ============================================================
// NATIONAL WEATHER ANALYTICS PLATFORM
// LIVE WEATHER MAP
// ============================================================

let weatherMap = null;
let markerGroup = null;
let liveWeatherGroup = null;


// ============================================================
// WEATHER EVENT COLORS
// ============================================================

const EVENT_COLOR_MAP = {
    Flood: "#3b82f6",
    Heatwave: "#ef4444",
    Thunderstorm: "#a855f7",
    Fog: "#94a3b8",
    DustStorm: "#eab308",
    StrongWind: "#06b6d4",
    Other: "#64748b"
};


// ============================================================
// INITIALIZE MAP
// ============================================================

function initWeatherMap(containerId = "map") {

    if (weatherMap) {
        return weatherMap;
    }

    weatherMap = L.map(containerId, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
        minZoom: 4,
        maxZoom: 12
    });


    // ========================================================
    // OPENSTREETMAP
    // ========================================================

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',

            maxZoom: 19
        }
    ).addTo(weatherMap);


    // ========================================================
    // REPORT MARKERS
    // ========================================================

    markerGroup = L.layerGroup().addTo(weatherMap);


    // ========================================================
    // LIVE WEATHER MARKERS
    // ========================================================

    liveWeatherGroup = L.layerGroup().addTo(weatherMap);


    // ========================================================
    // ADD WEATHER LEGEND
    // ========================================================

    createWeatherLegend();


    // ========================================================
    // ADD LOADING INDICATOR
    // ========================================================

    createWeatherLoadingIndicator();


    // ========================================================
    // INITIALIZE PAN-INDIA DOPPLER RADAR MOSAIC LAYER
    // ========================================================

    initDopplerRadarMosaicControl(weatherMap);


    return weatherMap;
}


// ============================================================
// TEMPERATURE COLOR
// ============================================================

function getTemperatureColor(temp) {

    if (temp === null || temp === undefined) {
        return "#64748b";
    }

    const temperature = Number(temp);


    if (temperature >= 40) {
        return "#dc2626";
    }

    if (temperature >= 35) {
        return "#ef4444";
    }

    if (temperature >= 30) {
        return "#f97316";
    }

    if (temperature >= 25) {
        return "#eab308";
    }

    if (temperature >= 20) {
        return "#22c55e";
    }

    if (temperature >= 15) {
        return "#06b6d4";
    }

    return "#3b82f6";
}


// ============================================================
// WEATHER CONDITION ICON
// ============================================================

function getWeatherIcon(condition) {

    if (!condition) {
        return "🌡️";
    }

    const value = condition.toLowerCase();


    if (
        value.includes("rain") ||
        value.includes("drizzle")
    ) {
        return "🌧️";
    }


    if (
        value.includes("thunder") ||
        value.includes("storm")
    ) {
        return "⛈️";
    }


    if (
        value.includes("cloud")
    ) {
        return "☁️";
    }


    if (
        value.includes("fog") ||
        value.includes("mist")
    ) {
        return "🌫️";
    }


    if (
        value.includes("snow")
    ) {
        return "❄️";
    }


    if (
        value.includes("clear") ||
        value.includes("sun")
    ) {
        return "☀️";
    }


    return "🌡️";
}


// ============================================================
// CREATE LIVE WEATHER MARKER
// ============================================================

function createLiveWeatherIcon(weather) {

    const temperature =
        weather.temperature !== null &&
            weather.temperature !== undefined
            ? Math.round(weather.temperature)
            : "--";


    const color =
        getTemperatureColor(weather.temperature);


    const icon =
        getWeatherIcon(weather.condition);


    const html = `
        <div
            class="live-weather-marker"
            style="border-color:${color};"
        >

            <div
                class="live-weather-icon-symbol"
            >
                ${icon}
            </div>

            <div
                class="weather-temp"
                style="color:${color};"
            >
                ${temperature}°
            </div>

        </div>
    `;


    return L.divIcon({

        className:
            "live-weather-icon",

        html: html,

        iconSize: [72, 48],

        iconAnchor: [36, 24],

        popupAnchor: [0, -28]

    });
}


// ============================================================
// UPDATE LIVE WEATHER MARKERS
// ============================================================

function updateLiveWeatherMarkers(weatherData) {

    if (
        !weatherMap ||
        !liveWeatherGroup
    ) {

        console.warn(
            "Weather map/layer not initialized."
        );

        return;
    }


    // Remove previous weather markers

    liveWeatherGroup.clearLayers();


    if (
        !Array.isArray(weatherData) ||
        weatherData.length === 0
    ) {

        console.warn(
            "No live weather data received."
        );

        return;
    }


    weatherData.forEach(weather => {

        // ----------------------------------------------------
        // Validate coordinates
        // ----------------------------------------------------

        if (
            weather.latitude === null ||
            weather.latitude === undefined ||
            weather.longitude === null ||
            weather.longitude === undefined
        ) {
            return;
        }


        // ----------------------------------------------------
        // Create marker
        // ----------------------------------------------------

        const marker =
            L.marker(
                [
                    Number(weather.latitude),
                    Number(weather.longitude)
                ],
                {
                    icon:
                        createLiveWeatherIcon(weather),

                    zIndexOffset: 500
                }
            );


        // ----------------------------------------------------
        // Weather values
        // ----------------------------------------------------

        const temperature =
            weather.temperature !== null &&
                weather.temperature !== undefined
                ? `${Math.round(weather.temperature)} °C`
                : "N/A";


        const feelsLike =
            weather.apparent_temperature !== null &&
                weather.apparent_temperature !== undefined
                ? `${Math.round(weather.apparent_temperature)} °C`
                : "N/A";


        const humidity =
            weather.humidity !== null &&
                weather.humidity !== undefined
                ? `${Math.round(weather.humidity)} %`
                : "N/A";


        const wind =
            weather.wind_speed !== null &&
                weather.wind_speed !== undefined
                ? `${Math.round(weather.wind_speed)} km/h`
                : "N/A";


        const precipitation =
            weather.precipitation !== null &&
                weather.precipitation !== undefined
                ? `${weather.precipitation} mm`
                : "N/A";


        const condition =
            weather.condition ||
            "Unknown";


        const observedAt =
            weather.observed_at
                ? new Date(
                    weather.observed_at
                ).toLocaleString("en-IN")
                : "Unavailable";


        const city =
            weather.city ||
            "Unknown Location";


        const state =
            weather.state ||
            "";


        // ----------------------------------------------------
        // Popup
        // ----------------------------------------------------

        const popupContent = `

            <div class="live-weather-popup">

                <div class="live-weather-header">

                    <div>

                        <div class="live-weather-city">
                            ${escapeHtml(city)}
                        </div>

                        <div class="weather-state">
                            ${escapeHtml(state)}
                        </div>

                    </div>


                    <div class="weather-condition">

                        ${getWeatherIcon(condition)}

                        ${escapeHtml(condition)}

                    </div>

                </div>


                <div class="live-weather-main-temp">

                    ${temperature}

                </div>


                <div class="weather-grid">


                    <div class="weather-item">

                        <span>
                            Feels Like
                        </span>

                        <strong>
                            ${feelsLike}
                        </strong>

                    </div>


                    <div class="weather-item">

                        <span>
                            Humidity
                        </span>

                        <strong>
                            ${humidity}
                        </strong>

                    </div>


                    <div class="weather-item">

                        <span>
                            Wind
                        </span>

                        <strong>
                            ${wind}
                        </strong>

                    </div>


                    <div class="weather-item">

                        <span>
                            Rain
                        </span>

                        <strong>
                            ${precipitation}
                        </strong>

                    </div>


                </div>


                <div class="weather-updated">

                    🕒 Last observed:
                    ${observedAt}

                </div>


                <div class="weather-source">

                    🌐 Source: Open-Meteo

                </div>

            </div>

        `;


        marker.bindPopup(
            popupContent,
            {
                maxWidth: 320
            }
        );


        liveWeatherGroup.addLayer(
            marker
        );

    });


    console.log(
        `Displayed ${weatherData.length} live weather locations.`
    );
}


// ============================================================
// WEATHER LEGEND
// ============================================================

function createWeatherLegend() {

    if (!weatherMap) {
        return;
    }


    const legend =
        L.control({
            position: "bottomright"
        });


    legend.onAdd = function () {

        const div =
            L.DomUtil.create(
                "div",
                "weather-map-legend"
            );


        div.innerHTML = `

            <div class="legend-title">
                Temperature
            </div>


            <div class="legend-row">

                <span
                    class="legend-color"
                    style="background:#3b82f6"
                ></span>

                <span>
                    &lt; 15°C
                </span>

            </div>


            <div class="legend-row">

                <span
                    class="legend-color"
                    style="background:#06b6d4"
                ></span>

                <span>
                    15–20°C
                </span>

            </div>


            <div class="legend-row">

                <span
                    class="legend-color"
                    style="background:#22c55e"
                ></span>

                <span>
                    20–25°C
                </span>

            </div>


            <div class="legend-row">

                <span
                    class="legend-color"
                    style="background:#eab308"
                ></span>

                <span>
                    25–30°C
                </span>

            </div>


            <div class="legend-row">

                <span
                    class="legend-color"
                    style="background:#f97316"
                ></span>

                <span>
                    30–35°C
                </span>

            </div>


            <div class="legend-row">

                <span
                    class="legend-color"
                    style="background:#ef4444"
                ></span>

                <span>
                    35–40°C
                </span>

            </div>


            <div class="legend-row">

                <span
                    class="legend-color"
                    style="background:#dc2626"
                ></span>

                <span>
                    &gt; 40°C
                </span>

            </div>

        `;


        return div;
    };


    legend.addTo(
        weatherMap
    );
}


// ============================================================
// WEATHER LOADING INDICATOR
// ============================================================

function createWeatherLoadingIndicator() {

    if (!weatherMap) {
        return;
    }


    const loading =
        L.control({
            position: "topright"
        });


    loading.onAdd = function () {

        const div =
            L.DomUtil.create(
                "div",
                "weather-loading-indicator"
            );


        div.id =
            "weatherMapLoading";


        div.innerHTML = `
            <span class="weather-loading-dot"></span>
            Updating weather...
        `;


        return div;
    };


    loading.addTo(
        weatherMap
    );


    // Initially hidden

    setWeatherMapLoading(
        false
    );
}


// ============================================================
// LOADING STATE
// ============================================================

function setWeatherMapLoading(
    loading
) {

    const element =
        document.getElementById(
            "weatherMapLoading"
        );


    if (!element) {
        return;
    }


    if (loading) {

        element.style.display =
            "flex";

    } else {

        element.style.display =
            "none";

    }
}


// ============================================================
// REPORT MARKER
// ============================================================

function createCustomPin(eventType) {

    const color =
        EVENT_COLOR_MAP[eventType] ||
        EVENT_COLOR_MAP.Other;


    const svgPin = `

        <svg
            width="32"
            height="42"
            viewBox="0 0 24 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >

            <path
                d="
                    M12 0
                    C5.37 0 0 5.37 0 12
                    C0 21 12 32 12 32
                    C12 32 24 21 24 12
                    C24 5.37 18.63 0 12 0Z
                "
                fill="${color}"
            />

            <circle
                cx="12"
                cy="12"
                r="5"
                fill="#ffffff"
            />

        </svg>

    `;


    return L.divIcon({

        className:
            "custom-weather-pin",

        html: svgPin,

        iconSize: [32, 42],

        iconAnchor: [16, 42],

        popupAnchor: [0, -36]

    });
}


// ============================================================
// REPORT MARKERS
// ============================================================

function updateMapMarkers(reports) {

    if (
        !weatherMap ||
        !markerGroup
    ) {
        return;
    }


    markerGroup.clearLayers();


    if (!Array.isArray(reports)) {
        return;
    }


    reports.forEach(report => {

        if (
            report.latitude === null ||
            report.latitude === undefined ||
            report.longitude === null ||
            report.longitude === undefined
        ) {
            return;
        }


        const icon =
            createCustomPin(
                report.event_type
            );


        const marker =
            L.marker(
                [
                    Number(report.latitude),
                    Number(report.longitude)
                ],
                {
                    icon
                }
            );


        const dateStr =
            report.posted_at
                ? new Date(
                    report.posted_at
                ).toLocaleString("en-IN")
                : "Recent";


        const mediaHtml =
            report.photo_url
                ? `
                    <img
                        src="${escapeHtml(report.photo_url)}"
                        class="popup-img"
                        alt="Weather media"
                        onerror="this.style.display='none'"
                    />
                `
                : "";


        const eventClass =
            `badge-${(
                report.event_type ||
                "other"
            ).toLowerCase()}`;


        const score =
            Number(
                report.trust_score || 0
            );


        const trustBadgeClass =
            score >= 70
                ? "status-verified"
                : score >= 40
                    ? "status-pending"
                    : "status-rejected";


        const popupContent = `

            <div class="popup-card">

                <div class="popup-header">

                    <span class="popup-title">

                        ${escapeHtml(
            report.city || "Unknown"
        )},

                        ${escapeHtml(
            report.state || ""
        )}

                    </span>


                    <span
                        class="popup-badge ${eventClass}"
                    >

                        ${escapeHtml(
            report.event_type || "Other"
        )}

                    </span>

                </div>


                <div class="popup-body">

                    ${escapeHtml(
            report.text_content || ""
        )}

                </div>


                ${mediaHtml}


                <div
                    class="popup-meta"
                    style="margin-top:0.5rem;"
                >

                    <span>

                        Score:

                        <strong
                            class="popup-badge ${trustBadgeClass}"
                        >

                            ${Math.round(score)}/100

                        </strong>

                    </span>


                    <span>
                        ${dateStr}
                    </span>

                </div>

            </div>

        `;


        marker.bindPopup(
            popupContent
        );


        markerGroup.addLayer(
            marker
        );

        // Auto-center and open popup if requested via URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const highlightId = urlParams.get("highlight");
        if (highlightId && String(report.id) === String(highlightId)) {
            setTimeout(() => {
                if (weatherMap) {
                    weatherMap.setView([Number(report.latitude), Number(report.longitude)], 10);
                    marker.openPopup();
                }
            }, 400);
        }

    });
}



// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(str) {

    if (
        str === null ||
        str === undefined
    ) {
        return "";
    }


    return String(str).replace(
        /[&<>"']/g,
        function (m) {

            return {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            }[m];

        }
    );
}


// ============================================================
// PAN-INDIA DOPPLER RADAR MOSAIC STITCHING MODULE
// ============================================================

let radarMosaicLayerGroup = null;
let radarStationRingsGroup = null;
let radarImageOverlay = null;
let radarMosaicOpacity = 0.65;
let isRadarMosaicVisible = false;
let isStationRingsVisible = true;

const DEFAULT_DWR_STATIONS = [
    { id: "DEL", name: "DWR New Delhi", lat: 28.6139, lon: 77.2090, status: "ACTIVE", type: "S-Band", range_km: 500, max_dbz: 54 },
    { id: "BOM", name: "DWR Mumbai", lat: 19.0760, lon: 72.8777, status: "ACTIVE", type: "C-Band", range_km: 500, max_dbz: 48 },
    { id: "CCU", name: "DWR Kolkata", lat: 22.5726, lon: 88.3639, status: "ACTIVE", type: "S-Band", range_km: 500, max_dbz: 58 },
    { id: "MAA", name: "DWR Chennai", lat: 13.0827, lon: 80.2707, status: "ACTIVE", type: "S-Band", range_km: 500, max_dbz: 42 },
    { id: "BLR", name: "DWR Bengaluru", lat: 12.9716, lon: 77.5946, status: "ACTIVE", type: "C-Band", range_km: 500, max_dbz: 38 },
    { id: "HYD", name: "DWR Hyderabad", lat: 17.3850, lon: 78.4867, status: "ACTIVE", type: "C-Band", range_km: 500, max_dbz: 45 },
    { id: "GAU", name: "DWR Guwahati", lat: 26.1445, lon: 91.7362, status: "ACTIVE", type: "C-Band", range_km: 500, max_dbz: 52 },
    { id: "NAG", name: "DWR Nagpur", lat: 21.1458, lon: 79.0882, status: "ACTIVE", type: "S-Band", range_km: 500, max_dbz: 40 }
];

function generateDopplerMosaicTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Weather radar reflectivity blobs (monsoon cells & storm fronts across India)
    const radarCells = [
        { x: 350, y: 280, r: 140, dbz: 54 }, // North India / Delhi-UP storm front
        { x: 220, y: 550, r: 120, dbz: 50 }, // Konkan & Western Ghats intense precipitation
        { x: 700, y: 440, r: 160, dbz: 58 }, // Bay of Bengal severe convective cell
        { x: 420, y: 720, r: 110, dbz: 42 }, // Tamil Nadu / Chennai coastal showers
        { x: 820, y: 300, r: 130, dbz: 52 }, // Northeast India / Assam heavy rainfall
        { x: 400, y: 560, r: 90,  dbz: 46 }  // Central India / Telangana convective core
    ];

    radarCells.forEach(cell => {
        const grad = ctx.createRadialGradient(cell.x, cell.y, 4, cell.x, cell.y, cell.r);
        grad.addColorStop(0, "rgba(213, 0, 249, 0.88)");   // >55 dBZ Magenta (Extreme / Hail)
        grad.addColorStop(0.2, "rgba(255, 87, 34, 0.80)");  // 45-55 dBZ Red (Severe Storm)
        grad.addColorStop(0.48, "rgba(255, 235, 59, 0.68)"); // 35-45 dBZ Yellow (Heavy Rain)
        grad.addColorStop(0.72, "rgba(0, 230, 118, 0.52)");  // 25-35 dBZ Green (Moderate Rain)
        grad.addColorStop(0.92, "rgba(0, 229, 255, 0.35)");  // 15-25 dBZ Cyan (Light Rain)
        grad.addColorStop(1, "rgba(0, 229, 255, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, cell.r, 0, Math.PI * 2);
        ctx.fill();
    });

    return canvas.toDataURL("image/png");
}

function initDopplerRadarMosaicControl(map) {
    if (!map) return;

    radarMosaicLayerGroup = L.layerGroup().addTo(map);
    radarStationRingsGroup = L.layerGroup();

    // Bounds covering India spatial region
    const indiaBounds = [
        [6.5, 68.0],  // South-West corner
        [35.5, 97.0]  // North-East corner
    ];

    const compositeTextureUrl = generateDopplerMosaicTexture();
    radarImageOverlay = L.imageOverlay(compositeTextureUrl, indiaBounds, {
        opacity: radarMosaicOpacity,
        interactive: false,
        zIndex: 400
    });

    // Populate Station Markers & 500km Range Rings
    DEFAULT_DWR_STATIONS.forEach(st => {
        // Station Pulse Icon
        const pulseIcon = L.divIcon({
            className: 'dwr-pulse-wrapper',
            html: `<div class="dwr-pulse-marker" title="${st.name} (${st.type})">📡</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });

        const marker = L.marker([st.lat, st.lon], { icon: pulseIcon });
        marker.bindPopup(`
            <div style="font-family:'Inter',sans-serif; padding:4px;">
                <h4 style="margin:0 0 4px 0; color:#38bdf8;">${st.name}</h4>
                <div style="font-size:0.8rem; color:#9ca3af;">
                    <div><strong>Status:</strong> <span style="color:#10b981;">● ${st.status}</span></div>
                    <div><strong>Radar Frequency:</strong> ${st.type}</div>
                    <div><strong>Coverage Beam Radius:</strong> ${st.range_km} km</div>
                    <div><strong>Peak Reflectivity:</strong> <strong style="color:#ff5722;">${st.max_dbz} dBZ</strong></div>
                </div>
            </div>
        `);
        radarStationRingsGroup.addLayer(marker);

        // Range Circle
        const ring = L.circle([st.lat, st.lon], {
            radius: st.range_km * 1000,
            color: "#0284c7",
            weight: 1,
            dashArray: "4, 6",
            fillColor: "#0284c7",
            fillOpacity: 0.04,
            interactive: false
        });
        radarStationRingsGroup.addLayer(ring);
    });

    // Add Leaflet UI Control Box for Radar Mosaic
    const RadarControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function () {
            const container = L.DomUtil.create('div', 'radar-mosaic-control leaflet-bar');
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);

            container.innerHTML = `
                <div class="radar-control-header">
                    <span class="radar-control-title">
                        📡 Pan-India Doppler Mosaic
                    </span>
                    <span style="font-size:0.65rem; background:rgba(56,189,248,0.2); color:#38bdf8; padding:2px 6px; border-radius:4px; font-weight:600;">LIVE MOCK</span>
                </div>
                <div class="radar-control-body">
                    <label class="radar-toggle-row">
                        <span>Show Radar Layer</span>
                        <input type="checkbox" id="chkToggleRadarMosaic">
                    </label>
                    <label class="radar-toggle-row">
                        <span>500km DWR Station Rings</span>
                        <input type="checkbox" id="chkToggleStationRings" checked>
                    </label>
                    <div class="radar-slider-row">
                        <div style="display:flex; justify-content:space-between;">
                            <span>Layer Opacity</span>
                            <span id="radarOpacityVal">65%</span>
                        </div>
                        <input type="range" id="rngRadarOpacity" min="0.1" max="1.0" step="0.05" value="0.65">
                    </div>
                    <div class="radar-dbz-legend">
                        <div style="font-size:0.72rem; color:#9ca3af; font-weight:600;">Reflectivity Scale (dBZ)</div>
                        <div class="radar-legend-bar"></div>
                        <div class="radar-legend-labels">
                            <span>15 dBZ</span>
                            <span>30</span>
                            <span>45</span>
                            <span>60+ dBZ</span>
                        </div>
                    </div>
                </div>
            `;

            // Add Event Listeners
            setTimeout(() => {
                const chkRadar = document.getElementById("chkToggleRadarMosaic");
                const chkRings = document.getElementById("chkToggleStationRings");
                const rngOpacity = document.getElementById("rngRadarOpacity");
                const lblOpacity = document.getElementById("radarOpacityVal");

                if (chkRadar) {
                    chkRadar.addEventListener("change", (e) => {
                        isRadarMosaicVisible = e.target.checked;
                        if (isRadarMosaicVisible) {
                            radarMosaicLayerGroup.addLayer(radarImageOverlay);
                            if (isStationRingsVisible) {
                                radarMosaicLayerGroup.addLayer(radarStationRingsGroup);
                            }
                        } else {
                            radarMosaicLayerGroup.clearLayers();
                        }
                    });
                }

                if (chkRings) {
                    chkRings.addEventListener("change", (e) => {
                        isStationRingsVisible = e.target.checked;
                        if (isRadarMosaicVisible) {
                            if (isStationRingsVisible) {
                                radarMosaicLayerGroup.addLayer(radarStationRingsGroup);
                            } else {
                                radarMosaicLayerGroup.removeLayer(radarStationRingsGroup);
                            }
                        }
                    });
                }

                if (rngOpacity) {
                    rngOpacity.addEventListener("input", (e) => {
                        const val = parseFloat(e.target.value);
                        radarMosaicOpacity = val;
                        if (lblOpacity) lblOpacity.innerText = `${Math.round(val * 100)}%`;
                        if (radarImageOverlay) {
                            radarImageOverlay.setOpacity(val);
                        }
                    });
                }
            }, 100);

            return container;
        }
    });

    map.addControl(new RadarControl());
}