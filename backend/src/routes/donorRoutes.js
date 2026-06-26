const express = require('express');
const {
  getDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor
} = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { donorValidator } = require('../validators/schemaValidators');

const router = express.Router();

router.use(protect);

router.get('/', getDonors);
router.get('/:id', getDonorById);

// Restrict modifications to Super Admin, Admin, Manager, and Accountant
router.post(
  '/',
  authorize('Super Admin', 'Admin', 'Manager', 'Accountant'),
  donorValidator,
  createDonor
);

router.put(
  '/:id',
  authorize('Super Admin', 'Admin', 'Manager', 'Accountant'),
  donorValidator,
  updateDonor
);

router.delete(
  '/:id',
  authorize('Super Admin', 'Admin', 'Manager', 'Accountant'),
  deleteDonor
);

module.exports = router;
