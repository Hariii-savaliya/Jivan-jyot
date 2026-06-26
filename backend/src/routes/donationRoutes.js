const express = require('express');
const {
  getDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
  getDonationReceipt
} = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { donationValidator } = require('../validators/schemaValidators');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// POST is public to allow consumer-facing "donate-me" platform to register donations
router.post(
  '/',
  donationValidator,
  createDonation
);

// Protected routes
router.use(protect);

router.get('/', getDonations);
router.get('/:id', getDonationById);
router.get('/:id/receipt', getDonationReceipt);

// Only Super Admin, Admin, and Accountant can verify, update or delete donations
router.put(
  '/:id',
  authorize('Super Admin', 'Admin', 'Accountant'),
  donationValidator,
  updateDonation
);

router.delete(
  '/:id',
  authorize('Super Admin', 'Admin', 'Accountant'),
  deleteDonation
);

module.exports = router;
