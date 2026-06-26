const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  photo: { type: String, default: '' },
  fullName: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  address: { type: String, required: true, trim: true },
  role: {
    type: String,
    required: true,
    enum: [
      'Super Admin',
      'Admin',
      'Manager',
      'Accountant',
      'Volunteer Coordinator',
      'Event Coordinator',
      'Staff'
    ]
  },
  joiningDate: { type: Date, required: true },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Inactive', 'On Leave'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
