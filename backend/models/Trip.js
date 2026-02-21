const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    cargo: { type: Number, default: 0 },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'], default: 'Draft' },
    revenue: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
