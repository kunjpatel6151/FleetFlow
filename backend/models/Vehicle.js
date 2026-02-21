const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    registration: { type: String, required: true, unique: true, trim: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number },
    maxCapacity: { type: Number, required: true },
    mileage: { type: Number, default: 0 },
    fuelType: { type: String, enum: ['Diesel', 'Petrol', 'CNG', 'Electric'], default: 'Diesel' },
    status: { type: String, enum: ['Available', 'OnTrip', 'InShop', 'Retired'], default: 'Available' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
