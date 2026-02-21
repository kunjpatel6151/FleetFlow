const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// POST /api/vehicles - only Manager
router.post('/vehicles', authenticateToken, authorizeRoles('Manager'), (req, res) => {
  // example handler
  res.status(201).json({ message: 'Vehicle created (example)' });
});

// POST /api/trips - Manager, Dispatcher
router.post('/trips', authenticateToken, authorizeRoles('Manager', 'Dispatcher'), (req, res) => {
  res.status(201).json({ message: 'Trip created (example)' });
});

// GET /api/drivers/safety - Safety Officer, Manager
router.get('/drivers/safety', authenticateToken, authorizeRoles('Safety Officer', 'Manager'), (req, res) => {
  res.json({ message: 'Safety drivers list (example)' });
});

// GET /api/reports/roi - Financial Analyst, Manager
router.get('/reports/roi', authenticateToken, authorizeRoles('Financial Analyst', 'Manager'), (req, res) => {
  res.json({ message: 'ROI report (example)' });
});

module.exports = router;
