// Chart.js Visualization Module
let eventTypeChart = null;
let stateDistributionChart = null;

const CHART_EVENT_COLORS = {
    "Flood": "#3b82f6",
    "Heatwave": "#ef4444",
    "Thunderstorm": "#a855f7",
    "Fog": "#94a3b8",
    "DustStorm": "#eab308",
    "StrongWind": "#06b6d4",
    "Other": "#64748b"
};

function initCharts() {
    const barCtx = document.getElementById("eventTypeChart")?.getContext("2d");
    const pieCtx = document.getElementById("statePieChart")?.getContext("2d");

    if (barCtx) {
        eventTypeChart = new Chart(barCtx, {
            type: "bar",
            data: {
                labels: ["Flood", "Heatwave", "Thunderstorm", "Fog", "DustStorm", "StrongWind", "Other"],
                datasets: [{
                    label: "Reports Count",
                    data: [0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: [
                        CHART_EVENT_COLORS.Flood,
                        CHART_EVENT_COLORS.Heatwave,
                        CHART_EVENT_COLORS.Thunderstorm,
                        CHART_EVENT_COLORS.Fog,
                        CHART_EVENT_COLORS.DustStorm,
                        CHART_EVENT_COLORS.StrongWind,
                        CHART_EVENT_COLORS.Other
                    ],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: {
                        ticks: { color: '#9ca3af' },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#9ca3af', precision: 0 },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    }
                }
            }
        });
    }

    if (pieCtx) {
        stateDistributionChart = new Chart(pieCtx, {
            type: "doughnut",
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        "#3b82f6", "#14b8a6", "#a855f7", "#ef4444", "#eab308",
                        "#06b6d4", "#ec4899", "#8b5cf6", "#10b981", "#f97316"
                    ],
                    borderWidth: 1,
                    borderColor: "#111827"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "right",
                        labels: { color: "#9ca3af", font: { size: 11 } }
                    }
                }
            }
        });
    }
}

function updateCharts(reports) {
    if (!reports || !Array.isArray(reports)) return;

    // 1. Group by Event Type
    const eventCounts = {
        "Flood": 0, "Heatwave": 0, "Thunderstorm": 0,
        "Fog": 0, "DustStorm": 0, "StrongWind": 0, "Other": 0
    };

    // 2. Group by State
    const stateCounts = {};

    reports.forEach(r => {
        const evt = r.event_type || "Other";
        if (eventCounts.hasOwnProperty(evt)) {
            eventCounts[evt]++;
        } else {
            eventCounts["Other"]++;
        }

        const state = r.state || "Unknown";
        stateCounts[state] = (stateCounts[state] || 0) + 1;
    });

    // Update Bar Chart
    if (eventTypeChart) {
        eventTypeChart.data.datasets[0].data = [
            eventCounts.Flood,
            eventCounts.Heatwave,
            eventCounts.Thunderstorm,
            eventCounts.Fog,
            eventCounts.DustStorm,
            eventCounts.StrongWind,
            eventCounts.Other
        ];
        eventTypeChart.update();
    }

    // Update Pie Chart
    if (stateDistributionChart) {
        const sortedStates = Object.entries(stateCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 7); // Top 7 states

        stateDistributionChart.data.labels = sortedStates.map(s => s[0]);
        stateDistributionChart.data.datasets[0].data = sortedStates.map(s => s[1]);
        stateDistributionChart.update();
    }
}
