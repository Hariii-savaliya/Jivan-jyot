const Requirement = require('../models/Requirement');

const getRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requirements.length, data: requirements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRequirementById = async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }
    res.status(200).json({ success: true, data: requirement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createRequirement = async (req, res) => {
  try {
    const { title, description, quantity, priority, status } = req.body;

    const newRequirement = await Requirement.create({
      title,
      description: description || '',
      quantity: Number(quantity),
      priority: priority || 'Medium',
      status: status || 'Pending'
    });

    req.logAction = `Created support requirement: ${newRequirement.title}`;
    req.logDetails = { requirementId: newRequirement._id };

    res.status(201).json({ success: true, data: newRequirement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateRequirement = async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    const { title, description, quantity, priority, status } = req.body;

    const updatedRequirement = await Requirement.findByIdAndUpdate(
      req.params.id,
      {
        title: title || requirement.title,
        description: description !== undefined ? description : requirement.description,
        quantity: quantity !== undefined ? Number(quantity) : requirement.quantity,
        priority: priority || requirement.priority,
        status: status || requirement.status
      },
      { new: true, runValidators: true }
    );

    req.logAction = `Updated requirement status: ${updatedRequirement.title} (${updatedRequirement.status})`;
    req.logDetails = { requirementId: updatedRequirement._id, status: updatedRequirement.status };

    res.status(200).json({ success: true, data: updatedRequirement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteRequirement = async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    await Requirement.findByIdAndDelete(req.params.id);

    req.logAction = `Deleted requirement entry: ${requirement.title}`;
    req.logDetails = { requirementId: requirement._id };

    res.status(200).json({ success: true, message: 'Requirement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRequirements,
  getRequirementById,
  createRequirement,
  updateRequirement,
  deleteRequirement
};
