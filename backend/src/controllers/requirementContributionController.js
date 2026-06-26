const RequirementContribution = require('../models/RequirementContribution');
const Requirement = require('../models/Requirement');

const createContribution = async (req, res) => {
  try {
    const { name, mobile, requirementId, quantity, message } = req.body;
    if (!name || !mobile || !requirementId || !quantity) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const requirement = await Requirement.findById(requirementId);
    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    const contribution = await RequirementContribution.create({
      name,
      mobile,
      requirementId,
      quantity: Number(quantity),
      message: message || ''
    });

    // Parse description to update fulfilled count
    let extra = {};
    try {
      extra = JSON.parse(requirement.description);
    } catch (e) {
      extra = { description: requirement.description };
    }

    // Adjust quantity needed and fulfilled
    const quantityNeeded = Number(requirement.quantity) || Number(extra.quantity_needed) || 1;
    const currentFulfilled = Number(extra.quantity_fulfilled) || 0;
    const newFulfilled = Math.min(quantityNeeded, currentFulfilled + Number(quantity));

    extra.quantity_fulfilled = newFulfilled;
    extra.quantity_needed = quantityNeeded;

    requirement.description = JSON.stringify(extra);

    // Update status
    if (newFulfilled >= quantityNeeded) {
      requirement.status = 'Fulfilled';
    } else if (newFulfilled > 0) {
      requirement.status = 'Partially Fulfilled';
    } else {
      requirement.status = 'Pending';
    }

    await requirement.save();

    res.status(201).json({ success: true, data: contribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getContributions = async (req, res) => {
  try {
    const query = {};
    if (req.query.requirementId) {
      query.requirementId = req.query.requirementId;
    }
    const contributions = await RequirementContribution.find(query)
      .populate('requirementId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: contributions.length, data: contributions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createContribution,
  getContributions
};
