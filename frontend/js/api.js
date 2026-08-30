// ============================================================
// API SERVICE LAYER
// National Weather Big Data Analytics Platform
// ============================================================

const API_BASE =
    window.location.origin.includes("localhost") ||
        window.location.origin.includes("127.0.0.1")
        ? "http://localhost:8000"
        : window.location.origin;


// ============================================================
// REPORT APIs
// ============================================================

async function fetchReports(filters = {}) {

    const params = new URLSearchParams();

    if (filters.event_type) {
        params.append("event_type", filters.event_type);
    }

    if (filters.city) {
        params.append("city", filters.city);
    }

    if (filters.state) {
        params.append("state", filters.state);
    }

    if (filters.verification_status) {
        params.append(
            "verification_status",
            filters.verification_status
        );
    }

    if (filters.date_from) {
        params.append("date_from", filters.date_from);
    }

    if (filters.date_to) {
        params.append("date_to", filters.date_to);
    }

    // Spatial location query parameters (Plain Lat/Lng Spatial Indexing)
    if (filters.lat !== undefined && filters.lat !== null) {
        params.append("lat", filters.lat);
    }

    if (filters.lng !== undefined && filters.lng !== null) {
        params.append("lng", filters.lng);
    }

    if (filters.radius_km !== undefined && filters.radius_km !== null) {
        params.append("radius_km", filters.radius_km);
    }

    if (filters.min_lat !== undefined && filters.min_lat !== null) {
        params.append("min_lat", filters.min_lat);
    }

    if (filters.max_lat !== undefined && filters.max_lat !== null) {
        params.append("max_lat", filters.max_lat);
    }

    if (filters.min_lng !== undefined && filters.min_lng !== null) {
        params.append("min_lng", filters.min_lng);
    }

    if (filters.max_lng !== undefined && filters.max_lng !== null) {
        params.append("max_lng", filters.max_lng);
    }

    const headers = {};

    const adminToken = localStorage.getItem("admin_jwt");

    if (adminToken) {
        headers["Authorization"] = `Bearer ${adminToken}`;
    }

    const response = await fetch(
        `${API_BASE}/reports?${params.toString()}`,
        {
            method: "GET",
            headers,
            cache: "no-store"
        }
    );

    if (!response.ok) {
        throw new Error(
            `API fetch error: ${response.status} ${response.statusText}`
        );
    }

    return await response.json();
}


// ============================================================
// SUBMIT REPORT
// ============================================================

async function submitReport(reportData) {

    const response = await fetch(
        `${API_BASE}/reports`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(reportData)
        }
    );

    if (!response.ok) {

        const errorMsg = await response.text();

        throw new Error(
            `Failed to submit report: ${errorMsg}`
        );
    }

    return await response.json();
}


// ============================================================
// LIVE WEATHER API
// FastAPI → /weather/live
// ============================================================

async function fetchLiveWeather() {

    const response = await fetch(
        `${API_BASE}/weather/live`,
        {
            method: "GET",

            headers: {
                "Accept": "application/json"
            },

            // Always request fresh data
            cache: "no-store"
        }
    );

    if (!response.ok) {

        throw new Error(
            `Weather API error: ${response.status} ${response.statusText}`
        );
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(
            "Weather API returned unsuccessful response"
        );
    }

    return data;
}


// ============================================================
// LOAD LIVE WEATHER
// Fetch API → Update Map
// ============================================================

async function loadLiveWeather() {

    try {

        console.log(
            "🌤️ Fetching live weather from FastAPI..."
        );

        const response = await fetchLiveWeather();

        console.log(
            `✅ Received ${response.count} weather locations`
        );

        // Send weather data to Leaflet map
        if (
            typeof updateLiveWeatherMarkers ===
            "function"
        ) {
            updateLiveWeatherMarkers(
                response.data
            );
        }

        // Update weather summary cards
        if (
            typeof updateWeatherSummary ===
            "function"
        ) {
            updateWeatherSummary(
                response.data
            );
        }

        // Update timestamp
        if (
            typeof updateWeatherLastUpdated ===
            "function"
        ) {
            updateWeatherLastUpdated(
                response.data
            );
        }

        return response.data;

    } catch (error) {

        console.error(
            "❌ Failed to load live weather:",
            error
        );

        // Show error in dashboard
        const statusElement =
            document.getElementById(
                "weatherLastUpdated"
            );

        if (statusElement) {

            statusElement.innerHTML =
                "⚠️ Weather update failed";
        }

        return null;
    }
}


// ============================================================
// MEDIA UPLOAD
// ============================================================

async function uploadMedia(file) {

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
        `${API_BASE}/reports/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {

        throw new Error(
            `Media upload failed: ${response.status} ${response.statusText}`
        );
    }

    return await response.json();
}


// ============================================================
// ADMIN APIs
// ============================================================

async function fetchAdminPending() {

    const token =
        localStorage.getItem("admin_jwt");

    if (!token) {

        throw new Error(
            "Admin token not found. Please log in."
        );
    }

    const response = await fetch(
        `${API_BASE}/admin/pending`,
        {
            method: "GET",

            headers: {
                "Authorization": `Bearer ${token}`
            },

            cache: "no-store"
        }
    );

    if (!response.ok) {

        throw new Error(
            `Failed to fetch pending reports: ${response.statusText}`
        );
    }

    return await response.json();
}


// ============================================================
// VERIFY REPORT
// ============================================================

async function verifyReport(reportId) {

    const token =
        localStorage.getItem("admin_jwt");

    if (!token) {

        throw new Error(
            "Admin token missing."
        );
    }

    const response = await fetch(
        `${API_BASE}/admin/verify/${reportId}`,
        {
            method: "POST",

            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {

        throw new Error(
            `Verification failed: ${response.statusText}`
        );
    }

    return await response.json();
}


// ============================================================
// REJECT REPORT
// ============================================================

async function rejectReport(reportId) {

    const token =
        localStorage.getItem("admin_jwt");

    if (!token) {

        throw new Error(
            "Admin token missing."
        );
    }

    const response = await fetch(
        `${API_BASE}/admin/reject/${reportId}`,
        {
            method: "POST",

            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {

        throw new Error(
            `Rejection failed: ${response.statusText}`
        );
    }

    return await response.json();
}


// ============================================================
// API DEBUG INFORMATION
// ============================================================

console.log(
    "🌐 API Base URL:",
    API_BASE
);

// ============================================================
// CITY WEATHER SEARCH
// ============================================================

async function fetchWeatherByCity(city) {

    const response = await fetch(
        `${API_BASE}/weather/city?city=${encodeURIComponent(city)}`
    );

    if (!response.ok) {

        const error = await response.json().catch(() => ({}));

        throw new Error(
            error.detail || "Unable to fetch weather data"
        );
    }

    return await response.json();
}


// ============================================================
// AGRI-ADVISORY API
// ============================================================

async function fetchAgriAdvisory(city = "Bengaluru") {
    const response = await fetch(
        `${API_BASE}/weather/agri-advisory?city=${encodeURIComponent(city)}`
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Unable to fetch agri-advisory data");
    }

    return await response.json();
}


// ============================================================
// CAP EMERGENCY DISPATCH API (SMS & EMAIL)
// ============================================================

async function dispatchCapAlert(alertData) {
    const headers = {
        "Content-Type": "application/json"
    };

    const adminToken = localStorage.getItem("admin_jwt");
    if (adminToken) {
        headers["Authorization"] = `Bearer ${adminToken}`;
    }

    const response = await fetch(
        `${API_BASE}/admin/dispatch-alert`,
        {
            method: "POST",
            headers,
            body: JSON.stringify(alertData)
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to execute emergency broadcast");
    }

    return await response.json();
}


// ============================================================
// SPATIAL LOCATION QUERIES (Plain Lat/Lng Spatial Indexing)
// ============================================================

async function fetchReportsNearby(lat, lng, radiusKm = 50, additionalFilters = {}) {
    return await fetchReports({
        ...additionalFilters,
        lat,
        lng,
        radius_km: radiusKm
    });
}

async function fetchReportsInBounds(minLat, maxLat, minLng, maxLng, additionalFilters = {}) {
    return await fetchReports({
        ...additionalFilters,
        min_lat: minLat,
        max_lat: maxLat,
        min_lng: minLng,
        max_lng: maxLng
    });
}