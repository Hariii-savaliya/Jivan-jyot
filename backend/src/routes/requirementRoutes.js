const express = require('express');
const {
  getRequirements,
  getRequirementById,
  createRequirement,
  updateRequirement,
  deleteRequirement
} = require('../controllers/requirementController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { requirementValidator } = require('../validators/schemaValidators');

const router = express.Router();

// Public viewing endpoints
router.get('/', getRequirements);
router.get('/:id', getRequirementById);

// Protected administrative endpoints
router.use(protect);

// Restrict modifications to Super Admin, Admin, and Manager
router.post(
  '/',
  authorize('Super Admin', 'Admin', 'Manager'),
  requirementValidator,
  createRequirement
);

router.put(
  '/:id',
  authorize('Super Admin', 'Admin', 'Manager'),
  requirementValidator,
  updateRequirement
);

router.delete(
  '/:id',
  authorize('Super Admin', 'Admin', 'Manager'),
  deleteRequirement
);

module.exports = router;
