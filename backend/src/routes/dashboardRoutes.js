const express = require('express');
const { getDashboardStats, getPublicStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getDashboardStats);
router.get('/public-stats', getPublicStats);

module.exports = router;
