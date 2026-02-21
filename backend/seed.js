const mongoose = require('mongoose');

// Import models
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const MaintenanceLog = require('./models/MaintenanceLog');
const FuelLog = require('./models/FuelLog');

const MONGO_URI = 'mongodb://127.0.0.1:27017/fleetflow';

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('\n🔗 Connected to MongoDB\n');

        // --- Vehicles ---
        const vehicles = await Vehicle.insertMany([
            {
                registration: 'GJ-01-AB-1234',
                make: 'Tata',
                model: 'Prima 4928.S',
                year: 2023,
                maxCapacity: 28000,
                mileage: 45200,
                fuelType: 'Diesel',
                status: 'Available'
            },
            {
                registration: 'MH-12-CD-5678',
                make: 'Ashok Leyland',
                model: 'BOSS 1920HB',
                year: 2022,
                maxCapacity: 19000,
                mileage: 62800,
                fuelType: 'Diesel',
                status: 'OnTrip'
            }
        ]);
        console.log(`✅ Inserted ${vehicles.length} vehicles`);

        // --- Drivers ---
        const drivers = await Driver.insertMany([
            {
                name: 'Rajesh Kumar',
                licenseNumber: 'DL-0420110012345',
                licenseExpiry: new Date('2027-06-15'),
                phone: '9876543210',
                safetyScore: 92,
                status: 'OnDuty'
            },
            {
                name: 'Amit Sharma',
                licenseNumber: 'MH-0320090067890',
                licenseExpiry: new Date('2026-03-10'),
                phone: '9123456780',
                safetyScore: 78,
                status: 'OffDuty'
            }
        ]);
        console.log(`✅ Inserted ${drivers.length} drivers`);

        // --- Trip ---
        const trip = await Trip.create({
            vehicleId: vehicles[1]._id,
            driverId: drivers[0]._id,
            origin: 'Mumbai',
            destination: 'Ahmedabad',
            cargoWeight: 15000,
            status: 'InTransit',
            startDate: new Date('2026-02-20'),
            distance: 530
        });
        console.log(`✅ Inserted 1 trip (Trip No: ${trip.tripNo})`);

        // --- Maintenance Log ---
        await MaintenanceLog.create({
            vehicleId: vehicles[0]._id,
            type: 'Preventive',
            description: 'Engine oil change and filter replacement',
            cost: 4500,
            date: new Date('2026-02-18')
        });
        console.log('✅ Inserted 1 maintenance log');

        // --- Fuel Log ---
        await FuelLog.create({
            vehicleId: vehicles[1]._id,
            tripId: trip._id,
            litres: 120,
            costPerLitre: 89.50,
            totalCost: 10740,
            odometer: 62800,
            date: new Date('2026-02-20')
        });
        console.log('✅ Inserted 1 fuel log');

        console.log('\n🎉 Seeding complete!\n');
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Connection closed.\n');
    }
}

seed();
