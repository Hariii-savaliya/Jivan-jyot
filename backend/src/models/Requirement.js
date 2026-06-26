const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  quantity: { type: Number, required: true, min: 1 },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Partially Fulfilled', 'Fulfilled'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Requirement', requirementSchema);
