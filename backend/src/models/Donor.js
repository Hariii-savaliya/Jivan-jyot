const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  address: { type: String, default: '', trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);
