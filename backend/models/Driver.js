const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    licenseExpiry: { type: Date, required: true },
    phone: { type: String, trim: true },
    safetyScore: { type: Number, min: 0, max: 100, default: 100 },
    status: { type: String, enum: ['OnDuty', 'OffDuty', 'Suspended'], default: 'OffDuty' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Driver', DriverSchema);
