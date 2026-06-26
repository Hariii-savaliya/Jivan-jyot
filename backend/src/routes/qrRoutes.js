const express = require('express');
const {
  getQRDetails,
  generateDonationQR,
  getQRs,
  getQRById,
  createQR,
  updateQR,
  deleteQR
} = require('../controllers/qrController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Public routes (for donation page QR display and generation)
router.get('/details', getQRDetails);
router.get('/generate', generateDonationQR);

// Protected admin routes
router.use(protect);
router.use(authorize('Super Admin', 'Admin', 'Accountant'));

router.get('/', getQRs);
router.get('/:id', getQRById);
router.post('/', createQR);
router.put('/:id', updateQR);
router.delete('/:id', deleteQR);

module.exports = router;
