const express = require('express');
const { createMessage, getMessages, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Public endpoint to send a contact message
router.post('/', createMessage);

// Protected endpoints for administrators
router.use(protect);
router.use(authorize('Super Admin', 'Admin'));

router.get('/', getMessages);
router.delete('/:id', deleteMessage);

module.exports = router;
