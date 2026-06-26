const express = require('express');
const {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { staffValidator } = require('../validators/schemaValidators');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.get('/', getStaff);
router.get('/:id', getStaffById);

// Modifications restricted to Super Admin and Admin
router.post(
  '/',
  authorize('Super Admin', 'Admin'),
  staffValidator,
  createStaff
);

router.put(
  '/:id',
  authorize('Super Admin', 'Admin'),
  staffValidator,
  updateStaff
);

router.delete('/:id', authorize('Super Admin', 'Admin'), deleteStaff);

module.exports = router;
