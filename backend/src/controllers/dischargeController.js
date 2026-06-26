const Discharge = require('../models/Discharge');
const Resident = require('../models/Resident');
const { generateDischargeFormBuffer } = require('../services/pdfService');

const getDischarges = async (req, res) => {
  try {
    const discharges = await Discharge.find()
      .populate('residentId', 'name residentId photo gender age')
      .sort({ date: -1 });
    res.status(200).json({ success: true, count: discharges.length, data: discharges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDischargeById = async (req, res) => {
  try {
    const discharge = await Discharge.findById(req.params.id)
      .populate('residentId', 'name residentId photo gender age');
    if (!discharge) {
      return res.status(404).json({ success: false, message: 'Discharge record not found' });
    }
    res.status(200).json({ success: true, data: discharge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createDischarge = async (req, res) => {
  try {
    const {
      residentId,
      residentName,
      address,
      village,
      taluka,
      mobile,
      date,
      takingResponsibilityPerson,
      relationship,
      responsibilityAddress,
      signature
    } = req.body;

    const resident = await Resident.findById(residentId);
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    // Create the discharge record
    const discharge = await Discharge.create({
      residentId,
      residentName: residentName || resident.name,
      address: address || resident.address || 'Ashram Campus',
      village: village || 'Surat',
      taluka: taluka || 'Surat',
      mobile,
      date: date || new Date(),
      takingResponsibilityPerson,
      relationship,
      responsibilityAddress: responsibilityAddress || address || 'Surat',
      signature: signature || ''
    });

    // Update the Resident status to Discharged
    resident.status = 'Discharged';
    await resident.save();

    req.logAction = `Discharged resident: ${resident.name}`;
    req.logDetails = { residentId: resident._id, dischargeId: discharge._id };

    res.status(201).json({ success: true, data: discharge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDischarge = async (req, res) => {
  try {
    const discharge = await Discharge.findById(req.params.id);
    if (!discharge) {
      return res.status(404).json({ success: false, message: 'Discharge record not found' });
    }

    const {
      residentName,
      address,
      village,
      taluka,
      mobile,
      date,
      takingResponsibilityPerson,
      relationship,
      responsibilityAddress,
      signature
    } = req.body;

    const updated = await Discharge.findByIdAndUpdate(
      req.params.id,
      {
        residentName: residentName || discharge.residentName,
        address: address || discharge.address,
        village: village || discharge.village,
        taluka: taluka || discharge.taluka,
        mobile: mobile || discharge.mobile,
        date: date || discharge.date,
        takingResponsibilityPerson: takingResponsibilityPerson || discharge.takingResponsibilityPerson,
        relationship: relationship || discharge.relationship,
        responsibilityAddress: responsibilityAddress || discharge.responsibilityAddress,
        signature: signature !== undefined ? signature : discharge.signature
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDischarge = async (req, res) => {
  try {
    const discharge = await Discharge.findById(req.params.id);
    if (!discharge) {
      return res.status(404).json({ success: false, message: 'Discharge record not found' });
    }

    // Revert resident status back to Active on discharge delete
    const resident = await Resident.findById(discharge.residentId);
    if (resident) {
      resident.status = 'Active';
      await resident.save();
    }

    await Discharge.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Discharge record removed and resident status reverted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDischargeReceipt = async (req, res) => {
  try {
    const discharge = await Discharge.findById(req.params.id).populate('residentId');
    if (!discharge) {
      return res.status(404).json({ success: false, message: 'Discharge record not found' });
    }

    const pdfBuffer = await generateDischargeFormBuffer(discharge, discharge.residentId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=discharge-${discharge.residentName.replace(/\s+/g, '_')}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDischarges,
  getDischargeById,
  createDischarge,
  updateDischarge,
  deleteDischarge,
  getDischargeReceipt
};
