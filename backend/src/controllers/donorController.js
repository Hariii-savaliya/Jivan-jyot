const Donor = require('../models/Donor');

const getDonors = async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: donors.length, data: donors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    res.status(200).json({ success: true, data: donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createDonor = async (req, res) => {
  try {
    const { name, mobile, email, address } = req.body;

    const existingDonor = await Donor.findOne({ email });
    if (existingDonor) {
      return res.status(400).json({
        success: false,
        message: 'Donor with this Email already exists'
      });
    }

    const newDonor = await Donor.create({
      name,
      mobile,
      email,
      address: address || ''
    });

    req.logAction = `Created donor: ${newDonor.name}`;
    req.logDetails = { donorId: newDonor._id, email: newDonor.email };

    res.status(201).json({ success: true, data: newDonor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDonor = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    const { name, mobile, email, address } = req.body;

    if (email && email !== donor.email) {
      const duplicate = await Donor.findOne({ email });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another donor with this Email already exists'
        });
      }
    }

    const updatedDonor = await Donor.findByIdAndUpdate(
      req.params.id,
      {
        name: name || donor.name,
        mobile: mobile || donor.mobile,
        email: email || donor.email,
        address: address !== undefined ? address : donor.address
      },
      { new: true, runValidators: true }
    );

    req.logAction = `Updated donor details: ${updatedDonor.name}`;
    req.logDetails = { donorId: updatedDonor._id };

    res.status(200).json({ success: true, data: updatedDonor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDonor = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    // Optional check: should we check if this donor has donations? Yes, let's delete the donor's donations or just warn. We can delete.
    await Donor.findByIdAndDelete(req.params.id);

    req.logAction = `Deleted donor: ${donor.name}`;
    req.logDetails = { donorId: donor._id };

    res.status(200).json({ success: true, message: 'Donor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor
};
