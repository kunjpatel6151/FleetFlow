const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');

const MONGO_URI = 'mongodb://127.0.0.1:27017/fleetflow';

async function testDashboard() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('\n🔗 Connected to MongoDB\n');

        // --- Overview queries ---
        const totalVehicles = await Vehicle.countDocuments();
        const activeFleet = await Vehicle.countDocuments({ status: { $ne: 'Retired' } });
        const maintenanceAlerts = await Vehicle.countDocuments({ status: 'InShop' });
        const onTripCount = await Vehicle.countDocuments({ status: 'OnTrip' });
        const pendingCargo = await Trip.countDocuments({ status: 'Draft' });
        const fleetUtilization = totalVehicles > 0 ? Math.round((onTripCount / totalVehicles) * 100) : 0;

        console.log('📊 Overview Data:');
        console.log(`   Total Vehicles   : ${totalVehicles}`);
        console.log(`   Active Fleet     : ${activeFleet}`);
        console.log(`   Maintenance Alerts: ${maintenanceAlerts}`);
        console.log(`   On Trip          : ${onTripCount}`);
        console.log(`   Fleet Utilization: ${fleetUtilization}%`);
        console.log(`   Pending Cargo    : ${pendingCargo}`);

        // --- List all vehicle statuses ---
        const vehicles = await Vehicle.find().select('registration status').lean();
        console.log('\n🚛 All Vehicles:');
        vehicles.forEach(v => console.log(`   ${v.registration} → ${v.status}`));

        // --- Trip queries ---
        const trips = await Trip.find()
            .populate('vehicleId', 'registration')
            .populate('driverId', 'name')
            .lean();

        console.log(`\n🗺️  Trips (${trips.length}):`);
        trips.forEach(t => {
            console.log(`   #${t.tripNo} | Vehicle: ${t.vehicleId?.registration || 'N/A'} | Driver: ${t.driverId?.name || 'N/A'} | Status: ${t.status}`);
        });

        console.log('\n✅ All queries working correctly!\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Connection closed.\n');
    }
}

testDashboard();
