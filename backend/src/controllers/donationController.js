const Donation = require('../models/Donation');
const Donor = require('../models/Donor');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { generateDonationReceiptBuffer } = require('../services/pdfService');

const getDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donorId', 'name email mobile address')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: donations.length, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donorId', 'name email mobile address');
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }
    res.status(200).json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createDonation = async (req, res) => {
  try {
    const { donorId, donorDetails, amount, transactionId, notes } = req.body;

    let screenshotUrl = req.body.screenshot || req.body.screenshot_url || '';
    if (req.file) {
      screenshotUrl = await uploadToCloudinary(req.file.path, 'donations');
    }

    if (!screenshotUrl) {
      return res.status(400).json({
        success: false,
        message: 'Transaction receipt screenshot is required'
      });
    }

    const existingDonation = await Donation.findOne({ transactionId });
    if (existingDonation) {
      return res.status(400).json({
        success: false,
        message: 'Donation with this Transaction ID already registered'
      });
    }

    let targetDonorId = donorId;

    // If donorDetails is passed, find or create the donor
    if (!targetDonorId && donorDetails) {
      let parsedDetails = donorDetails;
      if (typeof donorDetails === 'string') {
        try {
          parsedDetails = JSON.parse(donorDetails);
        } catch (e) {
          return res.status(400).json({ success: false, message: 'Invalid donorDetails JSON format' });
        }
      }

      if (!parsedDetails.email || !parsedDetails.name || !parsedDetails.mobile) {
        return res.status(400).json({
          success: false,
          message: 'Donor name, email, and mobile are required for registration'
        });
      }

      let donor = await Donor.findOne({ email: parsedDetails.email.toLowerCase() });
      if (!donor) {
        donor = await Donor.create({
          name: parsedDetails.name,
          email: parsedDetails.email.toLowerCase(),
          mobile: parsedDetails.mobile,
          address: parsedDetails.address || ''
        });
      }
      targetDonorId = donor._id;
    }

    if (!targetDonorId) {
      return res.status(400).json({
        success: false,
        message: 'Either donorId or donorDetails is required to record a donation'
      });
    }

    const newDonation = await Donation.create({
      donorId: targetDonorId,
      amount: Number(amount),
      transactionId,
      screenshot: screenshotUrl,
      notes: notes || '',
      verificationStatus: 'Pending'
    });

    // Populate donor info for responses
    const populated = await newDonation.populate('donorId', 'name email mobile');

    req.logAction = `Logged new donation: Rs. ${newDonation.amount}`;
    req.logDetails = { donationId: newDonation._id, transactionId: newDonation.transactionId };

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    const { amount, transactionId, notes, verificationStatus } = req.body;

    if (transactionId && transactionId !== donation.transactionId) {
      const duplicate = await Donation.findOne({ transactionId });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another donation with this Transaction ID is already registered'
        });
      }
    }

    let screenshotUrl = req.body.screenshot || req.body.screenshot_url || donation.screenshot;
    if (req.file) {
      screenshotUrl = await uploadToCloudinary(req.file.path, 'donations');
    }

    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      {
        amount: amount ? Number(amount) : donation.amount,
        transactionId: transactionId || donation.transactionId,
        screenshot: screenshotUrl,
        notes: notes !== undefined ? notes : donation.notes,
        verificationStatus: verificationStatus || donation.verificationStatus
      },
      { new: true, runValidators: true }
    ).populate('donorId', 'name email mobile');

    req.logAction = `Updated donation verification: ${updatedDonation.verificationStatus} for Ref ${updatedDonation.transactionId}`;
    req.logDetails = { donationId: updatedDonation._id, status: updatedDonation.verificationStatus };

    res.status(200).json({ success: true, data: updatedDonation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    await Donation.findByIdAndDelete(req.params.id);

    req.logAction = `Deleted donation entry: Ref ${donation.transactionId}`;
    req.logDetails = { donationId: donation._id };

    res.status(200).json({ success: true, message: 'Donation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/donations/:id/receipt
const getDonationReceipt = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donorId');
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found' });
    }

    const pdfBuffer = await generateDonationReceiptBuffer(donation, donation.donorId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=receipt-${donation.transactionId}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
  getDonationReceipt
};
