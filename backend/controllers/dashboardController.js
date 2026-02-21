const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

exports.getOverview = async (req, res) => {
    try {
        const totalVehicles = await Vehicle.countDocuments();
        const activeFleet = await Vehicle.countDocuments({ status: { $ne: 'Retired' } });
        const maintenanceAlerts = await Vehicle.countDocuments({ status: 'InShop' });
        const onTripCount = await Vehicle.countDocuments({ status: 'OnTrip' });
        const pendingCargo = await Trip.countDocuments({ status: 'Draft' });

        const fleetUtilization = totalVehicles > 0
            ? Math.round((onTripCount / totalVehicles) * 100)
            : 0;

        const data = {
            activeFleet,
            maintenanceAlerts,
            fleetUtilization,
            pendingCargo
        };

        console.log('[Dashboard] Overview data:', data);
        res.json(data);
    } catch (error) {
        console.error('[Dashboard] Overview error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.getTrips = async (req, res) => {
    try {
        const trips = await Trip.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('vehicleId', 'registration')
            .populate('driverId', 'name')
            .lean();

        console.log('[Dashboard] Raw trips from DB:', trips.length);

        const result = trips.map(t => ({
            tripNo: t.tripNo,
            vehicle: t.vehicleId?.registration || 'N/A',
            driver: t.driverId?.name || 'N/A',
            status: t.status
        }));

        console.log('[Dashboard] Trips response:', result);
        res.json(result);
    } catch (error) {
        console.error('[Dashboard] Trips error:', error.message);
        res.status(500).json({ message: error.message });
    }
};
