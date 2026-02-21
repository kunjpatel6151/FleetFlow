const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/businessController');

// ── Seed (public, run once) ────────────────────────────────────────────────────
router.post('/seed', ctrl.seedData);

// ── Vehicles ──────────────────────────────────────────────────────────────────
router.get('/vehicles', authenticateToken, ctrl.getVehicles);
router.post('/vehicles', authenticateToken, authorizeRoles('Manager'), ctrl.createVehicle);
router.put('/vehicles/:id', authenticateToken, authorizeRoles('Manager'), ctrl.updateVehicle);
router.delete('/vehicles/:id', authenticateToken, authorizeRoles('Manager'), ctrl.deleteVehicle);

// ── Drivers ───────────────────────────────────────────────────────────────────
router.get('/drivers', authenticateToken, ctrl.getDrivers);
router.post('/drivers', authenticateToken, authorizeRoles('Manager', 'Safety Officer'), ctrl.createDriver);
router.put('/drivers/:id', authenticateToken, authorizeRoles('Manager', 'Safety Officer'), ctrl.updateDriver);

// ── Trips ─────────────────────────────────────────────────────────────────────
router.get('/trips', authenticateToken, ctrl.getTrips);
router.post('/trips', authenticateToken, authorizeRoles('Manager', 'Dispatcher'), ctrl.createTrip);
router.put('/trips/:id', authenticateToken, authorizeRoles('Manager', 'Dispatcher'), ctrl.updateTrip);

// ── Maintenance ───────────────────────────────────────────────────────────────
router.get('/maintenance', authenticateToken, ctrl.getMaintenance);
router.post('/maintenance', authenticateToken, authorizeRoles('Manager', 'Safety Officer'), ctrl.createMaintenance);

// ── Fuel ──────────────────────────────────────────────────────────────────────
router.get('/fuel', authenticateToken, ctrl.getFuel);
router.post('/fuel', authenticateToken, authorizeRoles('Manager', 'Dispatcher'), ctrl.createFuel);

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get('/analytics', authenticateToken, authorizeRoles('Manager', 'Financial Analyst'), ctrl.getAnalytics);

module.exports = router;
