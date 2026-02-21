const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    plate: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Truck', 'Van', 'Bike'], default: 'Truck' },
    capacity: { type: Number, default: 0 },
    odometer: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'On Trip', 'In Shop', 'Idle', 'Suspended'], default: 'Active' },
    acquisitionCost: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
