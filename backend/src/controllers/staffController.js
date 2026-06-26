const Staff = require('../models/Staff');
const { uploadToCloudinary } = require('../services/cloudinaryService');

const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createStaff = async (req, res) => {
  try {
    let { employeeId, fullName, mobile, email, address, role, joiningDate, status } = req.body;

    // Generate unique sequential Employee ID if not provided
    if (!employeeId || employeeId.trim() === '') {
      const lastStaff = await Staff.findOne({}, {}, { sort: { employeeId: -1 } });
      let nextNum = 1;
      if (lastStaff && lastStaff.employeeId) {
        const match = lastStaff.employeeId.match(/\d+/);
        if (match) {
          nextNum = parseInt(match[0], 10) + 1;
        }
      }
      employeeId = `EMP-${String(nextNum).padStart(3, '0')}`;
    }

    const existingStaff = await Staff.findOne({
      $or: [{ employeeId }, { email }]
    });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'Staff member with this Employee ID or Email already exists'
      });
    }

    let photoUrl = req.body.photo || req.body.photoUrl || '';
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.path, 'staff');
    }

    const newStaff = await Staff.create({
      employeeId,
      photo: photoUrl,
      fullName,
      mobile,
      email,
      address,
      role,
      joiningDate,
      status: status || 'Active'
    });

    req.logAction = `Created staff member: ${newStaff.fullName}`;
    req.logDetails = { staffId: newStaff._id, employeeId: newStaff.employeeId };

    res.status(201).json({ success: true, data: newStaff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const { employeeId, fullName, mobile, email, address, role, joiningDate, status } = req.body;

    // Check unique employeeId and email
    if (employeeId || email) {
      const query = [];
      if (employeeId && employeeId !== staff.employeeId) query.push({ employeeId });
      if (email && email !== staff.email) query.push({ email });

      if (query.length > 0) {
        const duplicate = await Staff.findOne({ $or: query });
        if (duplicate) {
          return res.status(400).json({
            success: false,
            message: 'Another staff member with this Employee ID or Email already exists'
          });
        }
      }
    }

    let photoUrl = req.body.photo || req.body.photoUrl || staff.photo;
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.path, 'staff');
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      {
        employeeId: employeeId || staff.employeeId,
        photo: photoUrl,
        fullName: fullName || staff.fullName,
        mobile: mobile || staff.mobile,
        email: email || staff.email,
        address: address || staff.address,
        role: role || staff.role,
        joiningDate: joiningDate || staff.joiningDate,
        status: status || staff.status
      },
      { new: true, runValidators: true }
    );

    req.logAction = `Updated staff member: ${updatedStaff.fullName}`;
    req.logDetails = { staffId: updatedStaff._id, employeeId: updatedStaff.employeeId };

    res.status(200).json({ success: true, data: updatedStaff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    await Staff.findByIdAndDelete(req.params.id);

    req.logAction = `Deleted staff member: ${staff.fullName}`;
    req.logDetails = { staffId: staff._id, employeeId: staff.employeeId };

    res.status(200).json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
};
