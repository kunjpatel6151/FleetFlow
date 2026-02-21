const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    type: { type: String, required: true },
    date: { type: String, required: true },
    cost: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    odometer: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
