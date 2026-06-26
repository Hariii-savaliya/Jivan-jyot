const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true
  },
  amount: { type: Number, required: true, min: 1 },
  transactionId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  screenshot: { type: String, required: true }, // URL path (Cloudinary or local upload path)
  donationDate: { type: Date, default: Date.now },
  verificationStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Verified', 'Rejected', 'Approved'],
    default: 'Pending'
  },
  notes: { type: String, default: '', trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
