const express = require('express');
const {
  getResidents,
  getResidentById,
  createResident,
  updateResident,
  deleteResident
} = require('../controllers/residentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { residentValidator } = require('../validators/schemaValidators');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getResidents);
router.get('/:id', getResidentById);

// Authorize Super Admin, Admin, and Manager for resident modifications
router.post(
  '/',
  authorize('Super Admin', 'Admin', 'Manager'),
  residentValidator,
  createResident
);

router.put(
  '/:id',
  authorize('Super Admin', 'Admin', 'Manager'),
  residentValidator,
  updateResident
);

router.delete(
  '/:id',
  authorize('Super Admin', 'Admin', 'Manager'),
  deleteResident
);

module.exports = router;
