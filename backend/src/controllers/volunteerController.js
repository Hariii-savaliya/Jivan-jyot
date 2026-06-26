const Volunteer = require('../models/Volunteer');
const { uploadToCloudinary } = require('../services/cloudinaryService');

const getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: volunteers.length, data: volunteers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getVolunteerById = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    res.status(200).json({ success: true, data: volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createVolunteer = async (req, res) => {
  try {
    let { volunteerId, fullName, mobile, email, address, skills, interests, totalHours, status } = req.body;
 
    // Generate unique sequential Volunteer ID if not provided
    if (!volunteerId || volunteerId.trim() === '') {
      const lastVolunteer = await Volunteer.findOne({}, {}, { sort: { volunteerId: -1 } });
      let nextNum = 1;
      if (lastVolunteer && lastVolunteer.volunteerId) {
        const match = lastVolunteer.volunteerId.match(/\d+/);
        if (match) {
          nextNum = parseInt(match[0], 10) + 1;
        }
      }
      volunteerId = `VOL-${String(nextNum).padStart(3, '0')}`;
    }
 
    const existingVolunteer = await Volunteer.findOne({
      $or: [{ volunteerId }, { email }]
    });
    if (existingVolunteer) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer with this Volunteer ID or Email already exists'
      });
    }
 
    let photoUrl = req.body.photo || req.body.photoUrl || '';
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.path, 'volunteers');
    }
 
    // Support skills and interests as array or comma-separated string
    const parsedSkills = Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []);
    const parsedInterests = Array.isArray(interests) ? interests : (interests ? interests.split(',').map(i => i.trim()) : []);
 
    const newVolunteer = await Volunteer.create({
      volunteerId,
      photo: photoUrl,
      fullName,
      mobile,
      email,
      address: address || '',
      skills: parsedSkills,
      interests: parsedInterests,
      totalHours: Number(totalHours) || 0,
      status: status || 'Active'
    });

    req.logAction = `Registered volunteer: ${newVolunteer.fullName}`;
    req.logDetails = { volunteerId: newVolunteer._id, volunteerCustomId: newVolunteer.volunteerId };

    res.status(201).json({ success: true, data: newVolunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    const { volunteerId, fullName, mobile, email, address, skills, interests, totalHours, status } = req.body;

    if (volunteerId || email) {
      const query = [];
      if (volunteerId && volunteerId !== volunteer.volunteerId) query.push({ volunteerId });
      if (email && email !== volunteer.email) query.push({ email });

      if (query.length > 0) {
        const duplicate = await Volunteer.findOne({ $or: query });
        if (duplicate) {
          return res.status(400).json({
            success: false,
            message: 'Another volunteer with this Volunteer ID or Email already exists'
          });
        }
      }
    }

    let photoUrl = req.body.photo || req.body.photoUrl || volunteer.photo;
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.path, 'volunteers');
    }

    const parsedSkills = skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : volunteer.skills;
    const parsedInterests = interests ? (Array.isArray(interests) ? interests : interests.split(',').map(i => i.trim())) : volunteer.interests;

    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      {
        volunteerId: volunteerId || volunteer.volunteerId,
        photo: photoUrl,
        fullName: fullName || volunteer.fullName,
        mobile: mobile || volunteer.mobile,
        email: email || volunteer.email,
        address: address !== undefined ? address : volunteer.address,
        skills: parsedSkills,
        interests: parsedInterests,
        totalHours: totalHours !== undefined ? Number(totalHours) : volunteer.totalHours,
        status: status !== undefined ? status : volunteer.status
      },
      { new: true, runValidators: true }
    );

    req.logAction = `Updated volunteer: ${updatedVolunteer.fullName}`;
    req.logDetails = { volunteerId: updatedVolunteer._id, volunteerCustomId: updatedVolunteer.volunteerId };

    res.status(200).json({ success: true, data: updatedVolunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    await Volunteer.findByIdAndDelete(req.params.id);

    req.logAction = `Deleted volunteer: ${volunteer.fullName}`;
    req.logDetails = { volunteerId: volunteer._id, volunteerCustomId: volunteer.volunteerId };

    res.status(200).json({ success: true, message: 'Volunteer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPublicVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find({}, 'fullName photo skills createdAt').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: volunteers.length, data: volunteers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  getPublicVolunteers
};
