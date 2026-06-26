const express = require('express');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerVolunteerForEvent,
  uploadToEventGallery
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { eventValidator } = require('../validators/schemaValidators');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public endpoints (no token required)
router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/:id/volunteers', registerVolunteerForEvent); // Anyone can sign up as volunteer for an event

// Protected endpoints
router.use(protect);

// Restricted modifications
const allowedRoles = [
  'Super Admin',
  'Admin',
  'Manager',
  'Event Coordinator',
  'Volunteer Coordinator'
];

router.post('/', authorize(...allowedRoles), eventValidator, createEvent);
router.put('/:id', authorize(...allowedRoles), eventValidator, updateEvent);
router.delete('/:id', authorize(...allowedRoles), deleteEvent);

// Gallery upload mapping
router.post(
  '/:id/gallery',
  authorize(...allowedRoles),
  upload.single('photo'),
  uploadToEventGallery
);

module.exports = router;
