const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    license: { type: String, required: true },
    expiry: { type: String, required: true },   // "YYYY-MM-DD"
    category: { type: String, enum: ['Heavy', 'Light', 'Motorcycle'], default: 'Heavy' },
    status: { type: String, enum: ['On Duty', 'Off Duty', 'Suspended'], default: 'Off Duty' },
    safetyScore: { type: Number, default: 80 },
    tripsCompleted: { type: Number, default: 0 },
    totalTrips: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Driver', DriverSchema);
