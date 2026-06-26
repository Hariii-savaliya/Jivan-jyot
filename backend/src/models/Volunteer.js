const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  volunteerId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  photo: { type: String, default: '' },
  fullName: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  address: { type: String, default: '', trim: true },
  skills: [{ type: String, trim: true }],
  interests: [{ type: String, trim: true }],
  totalHours: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);
