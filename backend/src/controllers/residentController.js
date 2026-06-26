const Resident = require('../models/Resident');
const { uploadToCloudinary } = require('../services/cloudinaryService');

const getResidents = async (req, res) => {
  try {
    const residents = await Resident.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: residents.length, data: residents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getResidentById = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }
    res.status(200).json({ success: true, data: resident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createResident = async (req, res) => {
  try {
    let {
      residentId,
      name,
      age,
      gender,
      admissionDate,
      admissionTime,
      fatherHusbandName,
      address,
      identificationMark,
      physicalCondition,
      healthCondition,
      broughtFrom,
      institutionName,
      informerName,
      informerAddress,
      informerMobile,
      guardianName,
      guardianAddress,
      guardianMobile,
      remarks,
      status
    } = req.body;

    // Generate unique sequential Resident ID if not provided
    if (!residentId || residentId.trim() === '') {
      const lastResident = await Resident.findOne({}, {}, { sort: { residentId: -1 } });
      let nextNum = 1;
      if (lastResident && lastResident.residentId) {
        const match = lastResident.residentId.match(/\d+/);
        if (match) {
          nextNum = parseInt(match[0], 10) + 1;
        }
      }
      residentId = `RES-${String(nextNum).padStart(3, '0')}`;
    }

    const existingResident = await Resident.findOne({ residentId });
    if (existingResident) {
      return res.status(400).json({
        success: false,
        message: 'Resident with this Resident ID already exists'
      });
    }

    let photoUrl = req.body.photo || req.body.photoUrl || '';
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.path, 'residents');
    }

    const parsedGuardianDetails = {
      name: guardianName || 'None',
      mobile: guardianMobile || '0000000000',
      relation: 'Self'
    };

    const newResident = await Resident.create({
      residentId,
      photo: photoUrl,
      admissionDate,
      admissionTime: admissionTime || '',
      name,
      age: Number(age),
      fatherHusbandName: fatherHusbandName || '',
      gender,
      address: address || '',
      identificationMark: identificationMark || '',
      physicalCondition: physicalCondition || '',
      healthCondition: healthCondition || '',
      broughtFrom: broughtFrom || '',
      institutionName: institutionName || '',
      informerName: informerName || '',
      informerAddress: informerAddress || '',
      informerMobile: informerMobile || '',
      guardianDetails: parsedGuardianDetails,
      guardianName: guardianName || '',
      guardianAddress: guardianAddress || '',
      guardianMobile: guardianMobile || '',
      remarks: remarks || '',
      status: status || 'Active'
    });

    req.logAction = `Created resident entry: ${newResident.name}`;
    req.logDetails = { residentId: newResident._id, residentCustomId: newResident.residentId };

    res.status(201).json({ success: true, data: newResident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    const oldStatus = resident.status;

    const {
      residentId,
      name,
      age,
      gender,
      admissionDate,
      admissionTime,
      fatherHusbandName,
      address,
      identificationMark,
      physicalCondition,
      healthCondition,
      broughtFrom,
      institutionName,
      informerName,
      informerAddress,
      informerMobile,
      guardianName,
      guardianAddress,
      guardianMobile,
      remarks,
      status
    } = req.body;

    if (residentId && residentId !== resident.residentId) {
      const duplicate = await Resident.findOne({ residentId });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another resident with this Resident ID already exists'
        });
      }
    }

    let photoUrl = req.body.photo || req.body.photoUrl || resident.photo;
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.path, 'residents');
    }

    const parsedGuardianDetails = {
      name: guardianName || resident.guardianName || 'None',
      mobile: guardianMobile || resident.guardianMobile || '0000000000',
      relation: 'Self'
    };

    const updatedResident = await Resident.findByIdAndUpdate(
      req.params.id,
      {
        residentId: residentId || resident.residentId,
        photo: photoUrl,
        admissionDate: admissionDate || resident.admissionDate,
        admissionTime: admissionTime !== undefined ? admissionTime : resident.admissionTime,
        name: name || resident.name,
        age: age ? Number(age) : resident.age,
        fatherHusbandName: fatherHusbandName !== undefined ? fatherHusbandName : resident.fatherHusbandName,
        gender: gender || resident.gender,
        address: address !== undefined ? address : resident.address,
        identificationMark: identificationMark !== undefined ? identificationMark : resident.identificationMark,
        physicalCondition: physicalCondition !== undefined ? physicalCondition : resident.physicalCondition,
        healthCondition: healthCondition !== undefined ? healthCondition : resident.healthCondition,
        broughtFrom: broughtFrom !== undefined ? broughtFrom : resident.broughtFrom,
        institutionName: institutionName !== undefined ? institutionName : resident.institutionName,
        informerName: informerName !== undefined ? informerName : resident.informerName,
        informerAddress: informerAddress !== undefined ? informerAddress : resident.informerAddress,
        informerMobile: informerMobile !== undefined ? informerMobile : resident.informerMobile,
        guardianDetails: parsedGuardianDetails,
        guardianName: guardianName !== undefined ? guardianName : resident.guardianName,
        guardianAddress: guardianAddress !== undefined ? guardianAddress : resident.guardianAddress,
        guardianMobile: guardianMobile !== undefined ? guardianMobile : resident.guardianMobile,
        remarks: remarks !== undefined ? remarks : resident.remarks,
        status: status || resident.status
      },
      { new: true, runValidators: true }
    );

    // Synchronize discharge status changes
    const Discharge = require('../models/Discharge');
    if (oldStatus === 'Active' && updatedResident.status === 'Discharged') {
      const existingDischarge = await Discharge.findOne({ residentId: updatedResident._id });
      if (!existingDischarge) {
        await Discharge.create({
          residentId: updatedResident._id,
          residentName: updatedResident.name,
          address: updatedResident.address || 'Ashram Campus',
          village: 'Surat',
          taluka: 'Surat',
          mobile: updatedResident.guardianMobile || '0000000000',
          date: new Date(),
          takingResponsibilityPerson: updatedResident.guardianName || 'Guardian',
          relationship: 'Guardian',
          responsibilityAddress: updatedResident.guardianAddress || updatedResident.address || 'Surat',
          signature: ''
        });
      }
    } else if (oldStatus === 'Discharged' && updatedResident.status === 'Active') {
      await Discharge.deleteMany({ residentId: updatedResident._id });
    }

    req.logAction = `Updated resident entry: ${updatedResident.name}`;
    req.logDetails = { residentId: updatedResident._id, residentCustomId: updatedResident.residentId };

    res.status(200).json({ success: true, data: updatedResident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    await Resident.findByIdAndDelete(req.params.id);

    req.logAction = `Deleted resident entry: ${resident.name}`;
    req.logDetails = { residentId: resident._id, residentCustomId: resident.residentId };

    res.status(200).json({ success: true, message: 'Resident deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getResidents,
  getResidentById,
  createResident,
  updateResident,
  deleteResident
};
