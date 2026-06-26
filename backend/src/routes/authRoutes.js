const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/schemaValidators');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Custom middleware to enforce authentication for registration only if the database is not empty
const protectIfUsersExist = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return protect(req, res, next);
    }
    next();
  } catch (error) {
    next(error);
  }
};

router.post('/register', protectIfUsersExist, registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
