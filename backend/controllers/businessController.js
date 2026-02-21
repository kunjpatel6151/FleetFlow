const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Maintenance = require('../models/Maintenance');
const Fuel = require('../models/Fuel');

// ── VEHICLES ─────────────────────────────────────────────────────────────────
exports.getVehicles = async (req, res) => {
    try { res.json(await Vehicle.find()); }
    catch (e) { res.status(500).json({ message: e.message }); }
};
exports.createVehicle = async (req, res) => {
    try { res.status(201).json(await Vehicle.create(req.body)); }
    catch (e) { res.status(400).json({ message: e.message }); }
};
exports.updateVehicle = async (req, res) => {
    try {
        const v = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!v) return res.status(404).json({ message: 'Vehicle not found' });
        res.json(v);
    } catch (e) { res.status(400).json({ message: e.message }); }
};
exports.deleteVehicle = async (req, res) => {
    try {
        const v = await Vehicle.findByIdAndDelete(req.params.id);
        if (!v) return res.status(404).json({ message: 'Vehicle not found' });
        res.json({ message: 'Vehicle deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── DRIVERS ───────────────────────────────────────────────────────────────────
exports.getDrivers = async (req, res) => {
    try { res.json(await Driver.find()); }
    catch (e) { res.status(500).json({ message: e.message }); }
};
exports.createDriver = async (req, res) => {
    try { res.status(201).json(await Driver.create(req.body)); }
    catch (e) { res.status(400).json({ message: e.message }); }
};
exports.updateDriver = async (req, res) => {
    try {
        const d = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!d) return res.status(404).json({ message: 'Driver not found' });
        res.json(d);
    } catch (e) { res.status(400).json({ message: e.message }); }
};

// ── TRIPS ─────────────────────────────────────────────────────────────────────
exports.getTrips = async (req, res) => {
    try {
        const trips = await Trip.find().populate('vehicleId', 'name plate').populate('driverId', 'name');
        res.json(trips);
    } catch (e) { res.status(500).json({ message: e.message }); }
};
exports.createTrip = async (req, res) => {
    try {
        const t = await Trip.create(req.body);
        // If dispatched immediately, update vehicle
        if (t.status === 'Dispatched' && t.vehicleId) {
            await Vehicle.findByIdAndUpdate(t.vehicleId, { status: 'On Trip' });
        }
        res.status(201).json(t);
    } catch (e) { res.status(400).json({ message: e.message }); }
};
exports.updateTrip = async (req, res) => {
    try {
        const t = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!t) return res.status(404).json({ message: 'Trip not found' });

        // Logical connection: Update vehicle status based on trip status
        if (t.vehicleId) {
            if (t.status === 'Dispatched') await Vehicle.findByIdAndUpdate(t.vehicleId, { status: 'On Trip' });
            if (t.status === 'Completed' || t.status === 'Cancelled') {
                await Vehicle.findByIdAndUpdate(t.vehicleId, { status: 'Active' });
            }
        }
        res.json(t);
    } catch (e) { res.status(400).json({ message: e.message }); }
};

// ── MAINTENANCE ───────────────────────────────────────────────────────────────
exports.getMaintenance = async (req, res) => {
    try { res.json(await Maintenance.find().populate('vehicleId', 'name plate status')); }
    catch (e) { res.status(500).json({ message: e.message }); }
};
exports.createMaintenance = async (req, res) => {
    try {
        const m = await Maintenance.create(req.body);
        // Mark vehicle In Shop
        if (req.body.vehicleId) await Vehicle.findByIdAndUpdate(req.body.vehicleId, { status: 'In Shop' });
        res.status(201).json(m);
    } catch (e) { res.status(400).json({ message: e.message }); }
};

// ── FUEL ──────────────────────────────────────────────────────────────────────
exports.getFuel = async (req, res) => {
    try { res.json(await Fuel.find().populate('vehicleId', 'name plate')); }
    catch (e) { res.status(500).json({ message: e.message }); }
};
exports.createFuel = async (req, res) => {
    try { res.status(201).json(await Fuel.create(req.body)); }
    catch (e) { res.status(400).json({ message: e.message }); }
};

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
    try {
        const [vehicles, trips, fuel, maintenance] = await Promise.all([
            Vehicle.find(), Trip.find(), Fuel.find(), Maintenance.find()
        ]);
        const completedTrips = trips.filter(t => t.status === 'Completed');
        const totalRevenue = completedTrips.reduce((s, t) => s + (t.revenue || 0), 0);
        const totalFuel = fuel.reduce((s, f) => s + (f.liters * f.costPerLiter || 0), 0);
        const totalMaint = maintenance.reduce((s, m) => s + (m.cost || 0), 0);
        res.json({
            totalRevenue, totalFuel, totalMaint,
            netProfit: totalRevenue - totalFuel - totalMaint,
            vehicleCount: vehicles.length,
            tripCount: trips.length,
        });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── SEED ──────────────────────────────────────────────────────────────────────
exports.seedData = async (req, res) => {
    try {
        // Only seed if collections are empty
        const [vCount, dCount] = await Promise.all([Vehicle.countDocuments(), Driver.countDocuments()]);
        if (vCount > 0 || dCount > 0) return res.json({ message: 'Data already exists, skipping seed' });

        const vehicles = await Vehicle.insertMany([
            { name: 'Iron Rhino', plate: 'TRK-4821', type: 'Truck', capacity: 8000, odometer: 142500, status: 'Active', acquisitionCost: 7055000 },
            { name: 'Blaze Runner', plate: 'TRK-3310', type: 'Truck', capacity: 10000, odometer: 98200, status: 'On Trip', acquisitionCost: 7636000 },
            { name: 'Swift Cargo', plate: 'VAN-7741', type: 'Van', capacity: 2500, odometer: 67800, status: 'Active', acquisitionCost: 3154000 },
            { name: 'Night Owl', plate: 'VAN-5502', type: 'Van', capacity: 2800, odometer: 201000, status: 'In Shop', acquisitionCost: 3486000 },
            { name: 'Delta Express', plate: 'TRK-9902', type: 'Truck', capacity: 12000, odometer: 55000, status: 'Active', acquisitionCost: 9130000 },
            { name: 'Quicksilver', plate: 'BKE-1102', type: 'Bike', capacity: 150, odometer: 18200, status: 'Idle', acquisitionCost: 664000 },
            { name: 'Storm Hauler', plate: 'TRK-6631', type: 'Truck', capacity: 9000, odometer: 177000, status: 'Active', acquisitionCost: 6474000 },
            { name: 'Falcon Van', plate: 'VAN-4490', type: 'Van', capacity: 3000, odometer: 130400, status: 'Suspended', acquisitionCost: 3735000 },
        ]);
        const drivers = await Driver.insertMany([
            { name: 'Marcus Chen', license: 'LIC-4821-A', expiry: '2026-08-15', category: 'Heavy', status: 'On Duty', safetyScore: 92, tripsCompleted: 148, totalTrips: 155 },
            { name: 'Sofia Ramirez', license: 'LIC-3310-B', expiry: '2026-02-28', category: 'Heavy', status: 'On Duty', safetyScore: 87, tripsCompleted: 203, totalTrips: 210 },
            { name: 'James Okafor', license: 'LIC-7741-C', expiry: '2026-12-10', category: 'Light', status: 'Off Duty', safetyScore: 95, tripsCompleted: 89, totalTrips: 91 },
            { name: 'Priya Sharma', license: 'LIC-5502-D', expiry: '2025-12-01', category: 'Light', status: 'Suspended', safetyScore: 61, tripsCompleted: 44, totalTrips: 60 },
            { name: 'Ray Thompson', license: 'LIC-9902-E', expiry: '2027-03-20', category: 'Heavy', status: 'On Duty', safetyScore: 98, tripsCompleted: 312, totalTrips: 315 },
            { name: 'Anya Volkov', license: 'LIC-1102-F', expiry: '2026-11-05', category: 'Motorcycle', status: 'Off Duty', safetyScore: 88, tripsCompleted: 67, totalTrips: 70 },
        ]);
        await Trip.insertMany([
            { vehicleId: vehicles[1]._id, driverId: drivers[0]._id, cargo: 7500, origin: 'Chicago, IL', destination: 'Detroit, MI', date: '2026-02-18', status: 'Dispatched', revenue: 199200 },
            { vehicleId: vehicles[2]._id, driverId: drivers[2]._id, cargo: 1800, origin: 'Los Angeles, CA', destination: 'Phoenix, AZ', date: '2026-02-17', status: 'Completed', revenue: 81340 },
            { vehicleId: vehicles[0]._id, driverId: drivers[4]._id, cargo: 6000, origin: 'Dallas, TX', destination: 'Houston, TX', date: '2026-02-20', status: 'Draft', revenue: 99600 },
            { vehicleId: vehicles[4]._id, driverId: drivers[1]._id, cargo: 11000, origin: 'New York, NY', destination: 'Boston, MA', date: '2026-02-16', status: 'Completed', revenue: 257300 },
            { vehicleId: vehicles[6]._id, driverId: drivers[0]._id, cargo: 4500, origin: 'Miami, FL', destination: 'Orlando, FL', date: '2026-02-19', status: 'Dispatched', revenue: 124500 },
        ]);
        await Maintenance.insertMany([
            { vehicleId: vehicles[3]._id, type: 'Engine Overhaul', date: '2026-02-10', cost: 348600, notes: 'Full engine rebuild', odometer: 200900 },
            { vehicleId: vehicles[0]._id, type: 'Oil Change', date: '2026-01-25', cost: 14940, notes: 'Synthetic 5W-40', odometer: 140000 },
            { vehicleId: vehicles[6]._id, type: 'Brake Replacement', date: '2026-02-05', cost: 73870, notes: 'All rotors replaced', odometer: 175000 },
        ]);
        await Fuel.insertMany([
            { vehicleId: vehicles[1]._id, liters: 320, costPerLiter: 105.72, date: '2026-02-18', odometer: 98200 },
            { vehicleId: vehicles[2]._id, liters: 85, costPerLiter: 105.72, date: '2026-02-17', odometer: 67800 },
            { vehicleId: vehicles[0]._id, liters: 210, costPerLiter: 105.72, date: '2026-02-15', odometer: 142000 },
            { vehicleId: vehicles[4]._id, liters: 280, costPerLiter: 105.72, date: '2026-02-16', odometer: 54500 },
        ]);
        res.json({ message: '✅ Database seeded successfully', vehicles: vehicles.length, drivers: drivers.length });
    } catch (e) { res.status(500).json({ message: e.message }); }
};
