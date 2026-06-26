const QRConfig = require('../models/QRConfig');
const QRCode = require('qrcode');

// GET /api/qr/details
const getQRDetails = async (req, res) => {
  try {
    let config = await QRConfig.findOne({ isActive: true });
    
    if (!config) {
      // Fallback to environment variables
      return res.status(200).json({
        success: true,
        source: 'env',
        data: {
          upiId: process.env.UPI_ID || 'jivanjyotashram@upi',
          upiName: process.env.UPI_NAME || 'Jivan Jyot Manav Mandir Mandbuddhi Ashram',
          bankName: 'Jivan Jyot Ashram Bank',
          accountHolder: 'Jivan Jyot Manav Mandir Mandbuddhi Ashram',
          accountNumber: '1234567890',
          ifscCode: 'SBIN0001234',
          totalReceived: 0,
          qrImage: ''
        }
      });
    }

    res.status(200).json({
      success: true,
      source: 'database',
      data: config
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/qr/generate
const generateDonationQR = async (req, res) => {
  try {
    const { amount, notes } = req.query;

    // Check if dynamic database configuration exists
    const config = await QRConfig.findOne({ isActive: true });
    const targetUpiId = config ? config.upiId : (process.env.UPI_ID || 'jivanjyotashram@upi');
    const targetUpiName = config ? config.upiName : (process.env.UPI_NAME || 'Jivan Jyot Manav Mandir Mandbuddhi Ashram');

    // Build UPI payload URL
    let upiUrl = `upi://pay?pa=${encodeURIComponent(targetUpiId)}&pn=${encodeURIComponent(targetUpiName)}&cu=INR`;
    if (amount && Number(amount) > 0) {
      upiUrl += `&am=${encodeURIComponent(amount)}`;
    }
    if (notes) {
      upiUrl += `&tn=${encodeURIComponent(notes)}`;
    }

    // Render UPI payload as QRCode
    const qrDataUrl = await QRCode.toDataURL(upiUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#1a365d',
        light: '#ffffff'
      }
    });

    res.status(200).json({
      success: true,
      upiUrl,
      qrDataUrl,
      config: {
        upiId: targetUpiId,
        upiName: targetUpiName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRUD operations
const getQRs = async (req, res) => {
  try {
    const configs = await QRConfig.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: configs.length, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getQRById = async (req, res) => {
  try {
    const config = await QRConfig.findById(req.params.id);
    if (!config) {
      return res.status(404).json({ success: false, message: 'QR config not found' });
    }
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createQR = async (req, res) => {
  try {
    const { upiId, upiName, bankName, accountHolder, accountNumber, ifscCode, totalReceived, qrImage, isActive } = req.body;

    if (accountNumber && !/^\d{8,17}$/.test(accountNumber)) {
      return res.status(400).json({ success: false, message: 'Account Number must be between 8 and 17 digits and contain numbers only.' });
    }
    if (ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifscCode)) {
      return res.status(400).json({ success: false, message: 'IFSC Code must be exactly 11 characters in a valid format (e.g. SBIN0001234).' });
    }

    if (isActive) {
      await QRConfig.updateMany({}, { isActive: false });
    }

    const newConfig = await QRConfig.create({
      upiId: upiId || 'jivanjyotashram@upi',
      upiName: upiName || bankName || 'Jivan Jyot Ashram Account',
      bankName: bankName || '',
      accountHolder: accountHolder || '',
      accountNumber: accountNumber || '',
      ifscCode: ifscCode || '',
      totalReceived: Number(totalReceived) || 0,
      qrImage: qrImage || '',
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({ success: true, data: newConfig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateQR = async (req, res) => {
  try {
    const { upiId, upiName, bankName, accountHolder, accountNumber, ifscCode, totalReceived, qrImage, isActive } = req.body;

    if (accountNumber && !/^\d{8,17}$/.test(accountNumber)) {
      return res.status(400).json({ success: false, message: 'Account Number must be between 8 and 17 digits and contain numbers only.' });
    }
    if (ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifscCode)) {
      return res.status(400).json({ success: false, message: 'IFSC Code must be exactly 11 characters in a valid format (e.g. SBIN0001234).' });
    }

    if (isActive) {
      await QRConfig.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
    }

    const updated = await QRConfig.findByIdAndUpdate(
      req.params.id,
      {
        upiId,
        upiName,
        bankName,
        accountHolder,
        accountNumber,
        ifscCode,
        totalReceived,
        qrImage,
        isActive
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteQR = async (req, res) => {
  try {
    const config = await QRConfig.findById(req.params.id);
    if (!config) {
      return res.status(404).json({ success: false, message: 'QR config not found' });
    }
    await QRConfig.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'QR Config deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQRDetails,
  generateDonationQR,
  getQRs,
  getQRById,
  createQR,
  updateQR,
  deleteQR
};
