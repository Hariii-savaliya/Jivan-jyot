const { body, validationResult } = require('express-validator');

// Error checker utility middleware
const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Input validation failed',
      errors: errors.array().map(err => `${err.path || err.param}: ${err.msg}`)
    });
  }
  next();
};

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn([
      'Super Admin',
      'Admin',
      'Manager',
      'Accountant',
      'Volunteer Coordinator',
      'Event Coordinator'
    ])
    .withMessage('Invalid system role'),
  validateResult
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validateResult
];

const staffValidator = [
  body('employeeId').optional().trim(),
  body('fullName').trim().notEmpty().withMessage('Full Name is required'),
  body('mobile').matches(/^\d{10}$/).withMessage('Mobile number must be exactly 10 digits'),
  body('email').trim().isEmail().withMessage('Enter a valid email address'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('role')
    .isIn([
      'Super Admin',
      'Admin',
      'Manager',
      'Accountant',
      'Volunteer Coordinator',
      'Event Coordinator',
      'Staff'
    ])
    .withMessage('Invalid system role'),
  body('joiningDate').notEmpty().isISO8601().withMessage('Valid joining date is required'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'On Leave', 'Suspended'])
    .withMessage('Invalid status'),
  validateResult
];

const residentValidator = [
  body('residentId').optional().trim(),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('age').isInt({ min: 0 }).withMessage('Age must be a positive integer'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  body('admissionDate').notEmpty().isISO8601().withMessage('Valid admission date is required'),
  body('informerMobile').optional({ checkFalsy: true }).matches(/^\d{10}$/).withMessage('Informer mobile must be exactly 10 digits'),
  body('guardianMobile').optional({ checkFalsy: true }).matches(/^\d{10}$/).withMessage('Guardian mobile must be exactly 10 digits'),
  body('status')
    .optional()
    .isIn(['Active', 'Discharged', 'Deceased'])
    .withMessage('Invalid status'),
  validateResult
];

const volunteerValidator = [
  body('volunteerId').optional().trim(),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('mobile').matches(/^\d{10}$/).withMessage('Mobile number must be exactly 10 digits'),
  body('email').trim().isEmail().withMessage('Enter a valid email address'),
  body('address').optional().trim(),
  body('skills').optional(),
  body('interests').optional(),
  body('totalHours').optional(),
  validateResult
];

const donorValidator = [
  body('name').trim().notEmpty().withMessage('Donor name is required'),
  body('mobile').matches(/^\d{10}$/).withMessage('Mobile number must be exactly 10 digits'),
  body('email').trim().isEmail().withMessage('Enter a valid email address'),
  body('address').optional().trim(),
  validateResult
];

const donationValidator = [
  body('donorId').optional().isMongoId().withMessage('Invalid donor ID format'),
  body('donorDetails.name').optional().trim().notEmpty().withMessage('Donor name is required'),
  body('donorDetails.mobile').optional({ checkFalsy: true }).matches(/^\d{10}$/).withMessage('Donor mobile must be exactly 10 digits'),
  body('donorDetails.email').optional({ checkFalsy: true }).isEmail().withMessage('Valid donor email is required'),
  body('mobile').optional({ checkFalsy: true }).matches(/^\d{10}$/).withMessage('Mobile number must be exactly 10 digits'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('transactionId').trim().notEmpty().withMessage('Transaction reference ID is required'),
  body('notes').optional().trim(),
  validateResult
];

const eventValidator = [
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('description').optional().trim(),
  body('date').optional().isISO8601().withMessage('Valid event date is required'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('location').trim().notEmpty().withMessage('Event location is required'),
  validateResult
];

const requirementValidator = [
  body('title').trim().notEmpty().withMessage('Requirement title is required'),
  body('description').optional().trim(),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be an integer greater than 0'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Invalid priority scale'),
  body('status')
    .optional()
    .isIn(['Pending', 'Partially Fulfilled', 'Fulfilled'])
    .withMessage('Invalid fulfillment status'),
  validateResult
];

module.exports = {
  registerValidator,
  loginValidator,
  staffValidator,
  residentValidator,
  volunteerValidator,
  donorValidator,
  donationValidator,
  eventValidator,
  requirementValidator
};
