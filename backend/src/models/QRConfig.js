const mongoose = require('mongoose');

const qrConfigSchema = new mongoose.Schema({
  upiId: { type: String, required: true, trim: true },
  upiName: { type: String, required: true, trim: true },
  bankName: { type: String, default: '', trim: true },
  accountHolder: { type: String, default: '', trim: true },
  accountNumber: { type: String, default: '', trim: true },
  ifscCode: { type: String, default: '', trim: true },
  totalReceived: { type: Number, default: 0, min: 0 },
  qrImage: { type: String, default: '', trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('QRConfig', qrConfigSchema);
