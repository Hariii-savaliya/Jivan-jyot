const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Determine target role
    // The very first user will automatically be designated as a Super Admin
    const userCount = await User.countDocuments();
    let assignedRole = role || 'Admin';

    if (userCount === 0) {
      assignedRole = 'Super Admin';
      console.log('No users found. Creating the initial Super Admin account.');
    } else {
      // If users already exist, only an authenticated Super Admin or Admin can create new users
      if (!req.user || (req.user.role !== 'Super Admin' && req.user.role !== 'Admin')) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Only Super Admin or Admin can register new users'
        });
      }
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: assignedRole
    });

    req.logAction = `Registered user ${newUser.email} as ${newUser.role}`;
    req.logDetails = { userId: newUser._id, role: newUser.role, createdBy: req.user ? req.user._id : 'bootstrap' };

    res.status(201).json({
      success: true,
      message: `User created successfully as ${newUser.role}`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // We can't use logActivity middleware response trigger cleanly for login because req.user is set AFTER the request, 
    // but logActivity checks req.user. Let's set req.user here so logActivity picks it up.
    req.user = user;
    req.logAction = `Logged in successfully: ${user.email}`;
    req.logDetails = { userId: user._id, role: user.role };

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  // On frontend, JWT is cleared. Here we just return success.
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
