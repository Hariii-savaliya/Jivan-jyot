const mongoose = require('mongoose');

const requirementContributionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  requirementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true },
  quantity: { type: Number, required: true, min: 1 },
  message: { type: String, default: '', trim: true }
}, { timestamps: true });

module.exports = mongoose.model('RequirementContribution', requirementContributionSchema);
