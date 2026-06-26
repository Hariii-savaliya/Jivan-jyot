const express = require('express');
const { createContribution, getContributions } = require('../controllers/requirementContributionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST contribution is public
router.post('/', createContribution);

// GET contributions is protected for admin panel
router.get('/', protect, getContributions);

module.exports = router;
