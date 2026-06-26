const mongoose = require('mongoose');

const dischargeSchema = new mongoose.Schema({
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true
  },
  residentName: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  village: { type: String, required: true, trim: true },
  taluka: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  date: { type: Date, required: true, default: Date.now },
  
  takingResponsibilityPerson: { type: String, required: true, trim: true },
  relationship: { type: String, required: true, trim: true },
  responsibilityAddress: { type: String, required: true, trim: true },
  signature: { type: String, default: '' } // Signature confirmation text or image URL
}, { timestamps: true });

module.exports = mongoose.model('Discharge', dischargeSchema);
