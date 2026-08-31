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
// FILTER → MAP CONNECTION
// ============================================================

async function applyMapFilters() {

    console.log("Applying map filters...");

    // --------------------------------------------------------
    // GET FILTER VALUES FROM HTML
    // --------------------------------------------------------

    const eventTypeElement =
        document.getElementById("eventCategory");

    const cityElement =
        document.getElementById("cityLocation");

    const stateElement =
        document.getElementById("state");

    const statusElement =
        document.getElementById("status");

    const dateFromElement =
        document.getElementById("dateFrom");

    const dateToElement =
        document.getElementById("dateTo");


    // --------------------------------------------------------
    // READ VALUES
    // --------------------------------------------------------

    const eventType =
        eventTypeElement?.value || "";

    const city =
        cityElement?.value.trim() || "";

    const state =
        stateElement?.value.trim() || "";

    const status =
        statusElement?.value || "verified";

    const dateFrom =
        dateFromElement?.value || "";

    const dateTo =
        dateToElement?.value || "";


    console.log("FILTER VALUES:", {
        eventType,
        city,
        state,
        status,
        dateFrom,
        dateTo
    });


    // --------------------------------------------------------
    // SHOW LOADING
    // --------------------------------------------------------

    setWeatherMapLoading(true);


    try {

        // ----------------------------------------------------
        // BUILD API URL
        // ----------------------------------------------------

        const params =
            new URLSearchParams();


        // Event type

        if (
            eventType &&
            eventType !== "all"
        ) {

            params.append(
                "event_type",
                eventType
            );

        }


        // City

        if (city) {

            params.append(
                "city",
                city
            );

        }


        // State

        if (state) {

            params.append(
                "state",
                state
            );

        }


        // Verification status

        if (
            status &&
            status !== "all"
        ) {

            params.append(
                "verification_status",
                status
            );

        }


        // Date From

        if (dateFrom) {

            params.append(
                "date_from",
                `${dateFrom}T00:00:00`
            );

        }


        // Date To

        if (dateTo) {

            params.append(
                "date_to",
                `${dateTo}T23:59:59`
            );

        }


        // ----------------------------------------------------
        // API URL
        // ----------------------------------------------------

        const url =
            `${API_BASE}/reports?${params.toString()}`;


        console.log(
            "Fetching reports:",
            url
        );


        // ----------------------------------------------------
        // FETCH REPORTS
        // ----------------------------------------------------

        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `Reports API failed: ${response.status}`
            );

        }


        const reports =
            await response.json();


        console.log(
            "Filtered reports:",
            reports
        );


        // ----------------------------------------------------
        // UPDATE MAP MARKERS
        // ----------------------------------------------------

        updateMapMarkers(reports);


        // ----------------------------------------------------
        // ZOOM TO FILTERED LOCATIONS
        // ----------------------------------------------------

        zoomToFilteredReports(reports);


    } catch (error) {

        console.error(
            "Map filter error:",
            error
        );

        alert(
            "Unable to load filtered weather reports."
        );

    } finally {

        setWeatherMapLoading(false);

    }

    // ============================================================
    // ZOOM MAP TO FILTERED REPORTS
    // ============================================================

    function zoomToFilteredReports(reports) {

        if (
            !weatherMap ||
            !Array.isArray(reports) ||
            reports.length === 0
        ) {

            console.log(
                "No locations available for map zoom."
            );

            return;
        }


        // --------------------------------------------------------
        // COLLECT VALID COORDINATES
        // --------------------------------------------------------

        const coordinates = [];


        reports.forEach(report => {

            const lat =
                Number(report.latitude);

            const lng =
                Number(report.longitude);


            if (
                Number.isFinite(lat) &&
                Number.isFinite(lng)
            ) {

                coordinates.push([
                    lat,
                    lng
                ]);

            }

        });


        if (coordinates.length === 0) {

            console.log(
                "No valid coordinates found."
            );

            return;
        }


        // --------------------------------------------------------
        // ONLY ONE REPORT
        // --------------------------------------------------------

        if (coordinates.length === 1) {

            weatherMap.setView(
                coordinates[0],
                13,
                {
                    animate: true
                }
            );

            return;
        }


        // --------------------------------------------------------
        // MULTIPLE REPORTS
        // --------------------------------------------------------

        const bounds =
            L.latLngBounds(
                coordinates
            );


        weatherMap.fitBounds(
            bounds,
            {
                padding: [
                    50,
                    50
                ],

                maxZoom: 12,

                animate: true
            }
        );

    }
}

// ============================================================
// FILTER BUTTON EVENT
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const applyButton =
            document.getElementById(
                "applyFilters"
            );


        if (!applyButton) {

            console.warn(
                "Apply Filters button not found."
            );

            return;
        }


        applyButton.addEventListener(
            "click",
            function () {

                applyMapFilters();

            }
        );

    }
)
