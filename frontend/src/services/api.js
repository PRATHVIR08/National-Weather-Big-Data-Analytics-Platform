import {
  OFFLINE_LIVE_WEATHER,
  OFFLINE_INCIDENT_REPORTS,
  getOfflineCityWeather,
  getOfflineAgriAdvisory,
} from './offlineData';

const API_BASE_URL = 'http://127.0.0.1:8000';

function getAdminHeaders() {
  const token = localStorage.getItem('admin_jwt') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export async function fetchReports(filters = {}) {
  try {
    const params = new URLSearchParams();

    if (filters.event_type) params.append('event_type', filters.event_type);
    if (filters.city) params.append('city', filters.city);
    if (filters.state) params.append('state', filters.state);
    if (filters.verification_status) params.append('verification_status', filters.verification_status);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    if (filters.lat !== undefined && filters.lng !== undefined) {
      params.append('lat', filters.lat);
      params.append('lng', filters.lng);
      params.append('radius_km', filters.radius_km || 50);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE_URL}/reports?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    const data = await response.json();
    return { data, isLive: true };
  } catch (err) {
    console.warn('Backend server disconnected. Loading offline incident reports fallback:', err.message);
    let filtered = [...OFFLINE_INCIDENT_REPORTS];
    if (filters.event_type) {
      filtered = filtered.filter(r => r.event_type.toLowerCase() === filters.event_type.toLowerCase());
    }
    if (filters.verification_status) {
      filtered = filtered.filter(r => r.verification_status.toLowerCase() === filters.verification_status.toLowerCase());
    }
    return { data: filtered, isLive: false };
  }
}

export async function fetchLiveWeather() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE_URL}/weather/live`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    const json = await response.json();
    return { data: json.data || [], isLive: true };
  } catch (err) {
    console.warn('Backend server disconnected. Loading offline live weather fallback:', err.message);
    return { data: OFFLINE_LIVE_WEATHER, isLive: false };
  }
}

export async function fetchWeatherByCity(city) {
  try {
    const encodedCity = encodeURIComponent(city);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE_URL}/weather/city?city=${encodedCity}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Weather search failed for city '${city}'`);
    }
    const json = await response.json();
    return { ...json, isLive: true };
  } catch (err) {
    console.warn(`Backend offline or city fetch failed. Using offline city weather data for '${city}':`, err.message);
    const offlineData = getOfflineCityWeather(city);
    return { ...offlineData, isLive: false };
  }
}

export async function fetchAgriAdvisory(city = 'Bengaluru') {
  try {
    const encodedCity = encodeURIComponent(city);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE_URL}/weather/agri-advisory?city=${encodedCity}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Agri advisory search failed for city '${city}'`);
    }
    const json = await response.json();
    return { data: json.data, isLive: true };
  } catch (err) {
    console.warn(`Backend offline. Returning offline agricultural advisory for '${city}':`, err.message);
    return { data: getOfflineAgriAdvisory(city), isLive: false };
  }
}

export async function submitReport(reportData) {
  try {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Submission failed with status ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('Backend offline. Saving citizen report in offline store fallback:', err.message);
    // Offline simulated response
    return {
      id: Date.now(),
      ...reportData,
      event_type: reportData.text_content.includes('Flood') ? 'Flood' : 'Weather Incident',
      verification_status: 'pending',
      trust_score: 75,
      coherence: {
        coherence_score: 78,
        physical_plausibility: 'High (Offline Mode)',
        social_consensus: 'Moderate',
        verdict: 'PENDING_VERIFICATION (OFFLINE_SUBMISSION)',
      },
      isOfflineSubmission: true,
    };
  }
}

export async function uploadMedia(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/reports/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `File upload failed with status ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('Backend offline. Returning local blob preview for uploaded media:', err.message);
    return {
      url: URL.createObjectURL(file),
      isOffline: true,
    };
  }
}

export async function checkCoherence(eventType, latitude, longitude, city = '') {
  try {
    const params = new URLSearchParams({
      event_type: eventType,
      latitude: latitude,
      longitude: longitude,
    });
    if (city) params.append('city', city);

    const response = await fetch(`${API_BASE_URL}/coherence/check?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Coherence check failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    return {
      coherence_score: 72,
      physical_plausibility: 'Moderate (Offline Simulation)',
      social_consensus: 'Pending Verification',
      verdict: 'OFFLINE_MODE',
    };
  }
}

export async function fetchAdminReports(statusFilter = 'pending') {
  try {
    const headers = getAdminHeaders();
    let url = `${API_BASE_URL}/admin/reports?status=${statusFilter}`;
    if (statusFilter === 'pending') {
      url = `${API_BASE_URL}/admin/pending`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch admin reports: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('Backend offline. Displaying offline admin queue reports:', err.message);
    let reports = [...OFFLINE_INCIDENT_REPORTS];
    if (statusFilter !== 'all') {
      reports = reports.filter(r => r.verification_status === statusFilter);
    }
    return reports;
  }
}

export async function verifyReport(reportId) {
  try {
    const headers = getAdminHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/verify/${reportId}`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) {
      throw new Error(`Verification failed for report #${reportId}`);
    }
    return await response.json();
  } catch (err) {
    return { success: true, message: `Report #${reportId} verified (Offline Mode)` };
  }
}

export async function rejectReport(reportId) {
  try {
    const headers = getAdminHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/reject/${reportId}`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) {
      throw new Error(`Rejection failed for report #${reportId}`);
    }
    return await response.json();
  } catch (err) {
    return { success: true, message: `Report #${reportId} rejected (Offline Mode)` };
  }
}

export async function dispatchCapAlert(alertPayload) {
  try {
    const headers = getAdminHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/dispatch-alert`, {
      method: 'POST',
      headers,
      body: JSON.stringify(alertPayload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `CAP dispatch failed with status ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    return { success: true, message: 'CAP alert dispatched successfully (Offline Simulation)' };
  }
}
