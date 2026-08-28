// API Service Layer for National Weather Analytics Platform
const API_BASE = window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")
    ? "http://localhost:8000"
    : window.location.origin;

async function fetchReports(filters = {}) {
    const params = new URLSearchParams();
    if (filters.event_type) params.append("event_type", filters.event_type);
    if (filters.city) params.append("city", filters.city);
    if (filters.state) params.append("state", filters.state);
    if (filters.verification_status) params.append("verification_status", filters.verification_status);
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);

    const headers = {};
    const adminToken = localStorage.getItem("admin_jwt");
    if (adminToken) {
        headers["Authorization"] = `Bearer ${adminToken}`;
    }

    const response = await fetch(`${API_BASE}/reports?${params.toString()}`, { headers });
    if (!response.ok) {
        throw new Error(`API fetch error: ${response.statusText}`);
    }
    return await response.json();
}

async function submitReport(reportData) {
    const response = await fetch(`${API_BASE}/reports`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(reportData)
    });
    if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`Failed to submit report: ${errorMsg}`);
    }
    return await response.json();
}

async function uploadMedia(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/reports/upload`, {
        method: "POST",
        body: formData
    });
    if (!response.ok) {
        throw new Error(`Media upload failed: ${response.statusText}`);
    }
    return await response.json();
}

async function fetchAdminPending() {
    const token = localStorage.getItem("admin_jwt");
    if (!token) throw new Error("Admin token not found. Please log in.");

    const response = await fetch(`${API_BASE}/admin/pending`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch pending reports: ${response.statusText}`);
    }
    return await response.json();
}

async function verifyReport(reportId) {
    const token = localStorage.getItem("admin_jwt");
    if (!token) throw new Error("Admin token missing.");

    const response = await fetch(`${API_BASE}/admin/verify/${reportId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error(`Verification failed: ${response.statusText}`);
    }
    return await response.json();
}

async function rejectReport(reportId) {
    const token = localStorage.getItem("admin_jwt");
    if (!token) throw new Error("Admin token missing.");

    const response = await fetch(`${API_BASE}/admin/reject/${reportId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error(`Rejection failed: ${response.statusText}`);
    }
    return await response.json();
}
