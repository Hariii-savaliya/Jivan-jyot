const express = require('express');
const {
  getMonthlyAnalytics,
  getDonationAnalytics,
  getVolunteerAnalytics,
  getEventAnalytics,
  getMonthlyReportPdf
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

// Allowed roles for analytics operations
const allowedRoles = [
  'Super Admin',
  'Admin',
  'Manager',
  'Accountant'
];

router.get('/monthly', authorize(...allowedRoles), getMonthlyAnalytics);
router.get('/donation', authorize(...allowedRoles), getDonationAnalytics);
router.get('/volunteer', authorize(...allowedRoles), getVolunteerAnalytics);
router.get('/event', authorize(...allowedRoles), getEventAnalytics);
router.get('/monthly-report', authorize(...allowedRoles), getMonthlyReportPdf);

module.exports = router;
