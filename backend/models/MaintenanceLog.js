const mongoose = require('mongoose');

const MaintenanceLogSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    type: { type: String, enum: ['Preventive', 'Corrective', 'Inspection'], required: true },
    description: { type: String, trim: true },
    cost: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

// Real-time: emit vehicle status update after a maintenance log is saved
MaintenanceLogSchema.post('save', async function (doc) {
    try {
        // Update the vehicle status to InShop
        const Vehicle = mongoose.model('Vehicle');
        await Vehicle.findByIdAndUpdate(doc.vehicleId, { status: 'InShop' });

        // Emit real-time event via socket.io
        if (global._io) {
            global._io.emit('vehicleStatusUpdated', {
                vehicleId: doc.vehicleId,
                newStatus: 'InShop'
            });
            console.log(`📡 Emitted vehicleStatusUpdated for vehicle ${doc.vehicleId}`);
        }
    } catch (error) {
        console.error('❌ Post-save hook error:', error.message);
    }
});

module.exports = mongoose.model('MaintenanceLog', MaintenanceLogSchema);
