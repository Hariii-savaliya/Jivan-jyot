// Force public DNS resolver to fix querySrv ECONNREFUSED issues with MongoDB Atlas on Windows/certain ISPs
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { logActivity } = require('./middleware/logMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const staffRoutes = require('./routes/staffRoutes');
const residentRoutes = require('./routes/residentRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const donorRoutes = require('./routes/donorRoutes');
const donationRoutes = require('./routes/donationRoutes');
const eventRoutes = require('./routes/eventRoutes');
const requirementRoutes = require('./routes/requirementRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const qrRoutes = require('./routes/qrRoutes');
const dischargeRoutes = require('./routes/dischargeRoutes');
const requirementContributionRoutes = require('./routes/requirementContributionRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Connect to Database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local file uploads on frontends
}));
app.use(cors({
  origin: '*', // Adjust in production to match frontends
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// Morgan logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Local Uploads Folder Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Activity Logging Middleware
app.use(logActivity);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/discharge', dischargeRoutes);
app.use('/api/contributions', requirementContributionRoutes);
app.use('/api/messages', messageRoutes);

// File upload endpoint (general purpose)
app.post('/api/upload', require('./middleware/uploadMiddleware').single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const { uploadToCloudinary } = require('./services/cloudinaryService');
    const fileUrl = await uploadToCloudinary(req.file.path, 'uploads');
    res.status(200).json({ success: true, file_url: fileUrl });
  } catch (error) {
    next(error);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running healthy.' });
});

// Root welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Jivan Jyot Ashram Backend System API',
    version: '1.0.0',
    documentation: 'See walkthrough.md in backend system artifacts',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      staff: '/api/staff',
      residents: '/api/residents',
      volunteers: '/api/volunteers',
      donors: '/api/donors',
      donations: '/api/donations',
      events: '/api/events',
      requirements: '/api/requirements',
      certificates: '/api/certificates',
      analytics: '/api/analytics',
      qr: '/api/qr'
    }
  });
});

// 404 and Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
