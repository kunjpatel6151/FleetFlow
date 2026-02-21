const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    tripNo: { type: Number, unique: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    cargoWeight: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Dispatched', 'InTransit', 'Completed', 'Cancelled'], default: 'Draft' },
    startDate: { type: Date },
    endDate: { type: Date },
    distance: { type: Number, default: 0 },
    fuelCost: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Auto-increment tripNo before saving
TripSchema.pre('save', async function (next) {
    if (this.isNew && !this.tripNo) {
        const last = await mongoose.model('Trip').findOne().sort({ tripNo: -1 }).lean();
        this.tripNo = last ? last.tripNo + 1 : 1001;
    }
    next();
});

module.exports = mongoose.model('Trip', TripSchema);
