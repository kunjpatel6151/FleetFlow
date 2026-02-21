// ─── FLEETFLOW API SERVICE ─────────────────────────────────────────────────────
// All API calls go through this file. Token is stored in localStorage.

const API_BASE = 'http://localhost:5000/api';

function getToken() {
    return localStorage.getItem('ff_token');
}

async function apiFetch(path, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(API_BASE + path, opts);
    if (res.status === 401) {
        localStorage.removeItem('ff_token');
        localStorage.removeItem('ff_user');
        renderLogin();
        throw new Error('Session expired. Please log in again.');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API error');
    return data;
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
const API = {
    login: (email, password) => apiFetch('/auth/login', 'POST', { email, password }),
    register: (email, password, role) => apiFetch('/auth/register', 'POST', { email, password, role }),
    profile: () => apiFetch('/auth/profile'),

    // ── DATA ────────────────────────────────────────────────────────────────────
    getVehicles: () => apiFetch('/vehicles'),
    createVehicle: (d) => apiFetch('/vehicles', 'POST', d),
    updateVehicle: (id, d) => apiFetch(`/vehicles/${id}`, 'PUT', d),
    deleteVehicle: (id) => apiFetch(`/vehicles/${id}`, 'DELETE'),

    getDrivers: () => apiFetch('/drivers'),
    createDriver: (d) => apiFetch('/drivers', 'POST', d),
    updateDriver: (id, d) => apiFetch(`/drivers/${id}`, 'PUT', d),

    getTrips: () => apiFetch('/trips'),
    createTrip: (d) => apiFetch('/trips', 'POST', d),
    updateTrip: (id, d) => apiFetch(`/trips/${id}`, 'PUT', d),

    getMaintenance: () => apiFetch('/maintenance'),
    createMaintenance: (d) => apiFetch('/maintenance', 'POST', d),

    getFuel: () => apiFetch('/fuel'),
    createFuel: (d) => apiFetch('/fuel', 'POST', d),

    getAnalytics: () => apiFetch('/analytics'),

    seed: () => apiFetch('/seed', 'POST'),
};

// ── Normalize MongoDB docs to match frontend shape ────────────────────────────
function normalizeVehicle(v) {
    return { id: v._id, name: v.name, plate: v.plate, type: v.type, capacity: v.capacity, odometer: v.odometer, status: v.status, acquisitionCost: v.acquisitionCost };
}
function normalizeDriver(d) {
    return { id: d._id, name: d.name, license: d.license, expiry: d.expiry, category: d.category, status: d.status, safetyScore: d.safetyScore, tripsCompleted: d.tripsCompleted, totalTrips: d.totalTrips };
}
function normalizeTrip(t) {
    return {
        id: t._id,
        vehicleId: t.vehicleId?._id || t.vehicleId,
        driverId: t.driverId?._id || t.driverId,
        cargo: t.cargo, origin: t.origin, destination: t.destination,
        date: t.date, status: t.status, revenue: t.revenue,
    };
}
function normalizeMaintenance(m) {
    return { id: m._id, vehicleId: m.vehicleId?._id || m.vehicleId, type: m.type, date: m.date, cost: m.cost, notes: m.notes, odometer: m.odometer };
}
function normalizeFuel(f) {
    return { id: f._id, vehicleId: f.vehicleId?._id || f.vehicleId, tripId: f.tripId, liters: f.liters, costPerLiter: f.costPerLiter, date: f.date, odometer: f.odometer };
}

// ── Load all data from backend into DB ────────────────────────────────────────
async function loadDataFromBackend() {
    try {
        const [vehicles, drivers, trips, maintenance, fuel] = await Promise.all([
            API.getVehicles(),
            API.getDrivers(),
            API.getTrips(),
            API.getMaintenance(),
            API.getFuel(),
        ]);

        DB.vehicles = vehicles.map(normalizeVehicle);
        DB.drivers = drivers.map(normalizeDriver);
        DB.trips = trips.map(normalizeTrip);
        DB.maintenance = maintenance.map(normalizeMaintenance);
        DB.fuel = fuel.map(normalizeFuel);

        // Re-render current page with fresh data
        refreshCurrentPage();
    } catch (err) {
        showToast('Failed to load data: ' + err.message, 'red');
    }
}

function refreshCurrentPage() {
    const page = window.currentPage || 'dashboard';
    const pageEl = document.getElementById('page-' + page);
    if (!pageEl) return;

    const renderMap = {
        dashboard: renderDashboard,
        vehicles: renderVehicles,
        trips: renderTrips,
        maintenance: renderMaintenance,
        fuel: renderFuel,
        drivers: renderDrivers,
        analytics: renderAnalytics,
    };

    const mc = document.getElementById('modals-container');
    if (mc) mc.innerHTML = renderModals();

    if (renderMap[page]) {
        try {
            pageEl.innerHTML = renderMap[page]();
            // Re-run initialization logic if needed
            if (page === 'dashboard') {
                initDashboardKPIs();
                if (typeof initGlobeScene === 'function') initGlobeScene();
            }
            if (page === 'analytics') {
                if (typeof initCharts === 'function') initCharts();
            }
        } catch (e) {
            console.error('Error refreshing page:', e);
        }
    }
}
