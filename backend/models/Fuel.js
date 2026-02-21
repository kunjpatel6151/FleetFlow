const mongoose = require('mongoose');

const FuelSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
    liters: { type: Number, required: true },
    costPerLiter: { type: Number, required: true },
    date: { type: String, required: true },
    odometer: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Fuel', FuelSchema);
