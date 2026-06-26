const express = require('express');
const {
  getVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  getPublicVolunteers
} = require('../controllers/volunteerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { volunteerValidator } = require('../validators/schemaValidators');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public endpoints
router.post(
  '/',
  volunteerValidator,
  createVolunteer
);

router.get('/public', getPublicVolunteers);

// Protected endpoints
router.use(protect);

router.get('/', getVolunteers);
router.get('/:id', getVolunteerById);

// Restrict modifications to Super Admin, Admin, Manager, and Volunteer Coordinator
router.put(
  '/:id',
  authorize('Super Admin', 'Admin', 'Manager', 'Volunteer Coordinator'),
  volunteerValidator,
  updateVolunteer
);

router.delete(
  '/:id',
  authorize('Super Admin', 'Admin', 'Manager', 'Volunteer Coordinator'),
  deleteVolunteer
);

module.exports = router;
