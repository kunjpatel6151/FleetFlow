const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getOverview, getTrips } = require('../controllers/dashboardController');

router.get('/overview', authenticateToken, getOverview);
router.get('/trips', authenticateToken, getTrips);

module.exports = router;
