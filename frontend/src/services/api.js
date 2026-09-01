const API_BASE_URL = 'http://127.0.0.1:8000';

function getAdminHeaders() {
  const token = localStorage.getItem('admin_jwt') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export async function fetchReports(filters = {}) {
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

  const response = await fetch(`${API_BASE_URL}/reports?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch reports: ${response.statusText}`);
  }
  return await response.json();
}

export async function submitReport(reportData) {
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
}

export async function uploadMedia(file) {
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
}

export async function fetchLiveWeather() {
  const response = await fetch(`${API_BASE_URL}/weather/live`);
  if (!response.ok) {
    throw new Error(`Failed to fetch live weather: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchWeatherByCity(city) {
  const encodedCity = encodeURIComponent(city);
  const response = await fetch(`${API_BASE_URL}/weather/city?city=${encodedCity}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Weather search failed for city '${city}'`);
  }
  return await response.json();
}

export async function fetchAgriAdvisory(city = 'Bengaluru') {
  const encodedCity = encodeURIComponent(city);
  const response = await fetch(`${API_BASE_URL}/weather/agri-advisory?city=${encodedCity}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Agri advisory search failed for city '${city}'`);
  }
  return await response.json();
}

export async function checkCoherence(eventType, latitude, longitude, city = '') {
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
}

export async function fetchAdminReports(statusFilter = 'pending') {
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
}

export async function verifyReport(reportId) {
  const headers = getAdminHeaders();
  const response = await fetch(`${API_BASE_URL}/admin/verify/${reportId}`, {
    method: 'POST',
    headers,
  });
  if (!response.ok) {
    throw new Error(`Verification failed for report #${reportId}`);
  }
  return await response.json();
}

export async function rejectReport(reportId) {
  const headers = getAdminHeaders();
  const response = await fetch(`${API_BASE_URL}/admin/reject/${reportId}`, {
    method: 'POST',
    headers,
  });
  if (!response.ok) {
    throw new Error(`Rejection failed for report #${reportId}`);
  }
  return await response.json();
}

export async function dispatchCapAlert(alertPayload) {
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
}
