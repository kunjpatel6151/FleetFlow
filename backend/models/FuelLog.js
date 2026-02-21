const mongoose = require('mongoose');

const FuelLogSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    litres: { type: Number, required: true },
    costPerLitre: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    odometer: { type: Number },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FuelLog', FuelLogSchema);
