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
// ── Normalize MongoDB docs to match frontend shape ────────────────────────────
function normalizeVehicle(v) {
    return { id: String(v._id), name: v.name, plate: v.plate, type: v.type, capacity: v.capacity, odometer: v.odometer, status: v.status, acquisitionCost: v.acquisitionCost };
}
function normalizeDriver(d) {
    return { id: String(d._id), name: d.name, license: d.license, expiry: d.expiry, category: d.category, status: d.status, safetyScore: d.safetyScore, tripsCompleted: d.tripsCompleted, totalTrips: d.totalTrips };
}
function normalizeTrip(t) {
    return {
        id: String(t._id),
        vehicleId: String(t.vehicleId?._id || t.vehicleId),
        driverId: String(t.driverId?._id || t.driverId),
        cargo: t.cargo, origin: t.origin, destination: t.destination,
        date: t.date, status: t.status, revenue: t.revenue,
    };
}
function normalizeMaintenance(m) {
    return { id: String(m._id), vehicleId: String(m.vehicleId?._id || m.vehicleId), type: m.type, date: m.date, cost: m.cost, notes: m.notes, odometer: m.odometer };
}
function normalizeFuel(f) {
    return { id: String(f._id), vehicleId: String(f.vehicleId?._id || f.vehicleId), tripId: f.tripId ? String(f.tripId?._id || f.tripId) : null, liters: f.liters, costPerLiter: f.costPerLiter, date: f.date, odometer: f.odometer };
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

        // If newly setup (0 vehicles), trigger a seed (only once to avoid loops)
        if (DB.vehicles.length === 0 && !window._didAutoSeed) {
            window._didAutoSeed = true;
            console.log('Detected empty database, triggering auto-seed...');
            await API.seed();
            return loadDataFromBackend(); // Reload after seed
        }

        // Re-render current page with fresh data
        refreshCurrentPage();
    } catch (err) {
        showToast('System Sync Failed: ' + err.message, 'red');
    }
}

function refreshCurrentPage() {
    const renderMap = {
        'page-dashboard': renderDashboard,
        'page-vehicles': renderVehicles,
        'page-trips': renderTrips,
        'page-maintenance': renderMaintenance,
        'page-fuel': renderFuel,
        'page-drivers': renderDrivers,
        'page-analytics': renderAnalytics,
    };

    // Re-render ALL page containers to ensure data is fresh everywhere
    Object.keys(renderMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = renderMap[id]();
        }
    });

    // Re-render modals too as they depend on vehicle/driver lists
    const mc = document.getElementById('modals-container');
    if (mc) mc.innerHTML = renderModals();

    // Re-run current page specific initialization
    const page = window.currentPage || 'dashboard';
    if (page === 'dashboard') {
        initDashboardKPIs();
        initMapDots();
        if (typeof initGlobeScene === 'function') initGlobeScene();
    }
    if (page === 'analytics') {
        if (typeof initCharts === 'function') initCharts();
    }
}
