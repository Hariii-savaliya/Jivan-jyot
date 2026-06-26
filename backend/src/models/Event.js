const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, // Event Name
  description: { type: String, default: '', trim: true },
  date: { type: Date, required: true }, // Legacy/fallback field
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String, required: true, trim: true },
  volunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer'
  }],
  gallery: [{ type: String }], // Legacy/fallback array
  image: { type: String, default: '' }, // Event Image
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  },
  category: { type: String, default: 'Other' },
  coordinator: { type: String, default: '' },
  budget: { type: Number, default: 0, min: 0 },
  spent: { type: Number, default: 0, min: 0 },
  volunteers_assigned: { type: Number, default: 0, min: 0 },
  attendees: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
