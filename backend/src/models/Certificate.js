const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer',
    required: true
  },
  certificateUrl: { type: String, required: true },
  issueDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
