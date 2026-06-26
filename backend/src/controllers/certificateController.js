const Certificate = require('../models/Certificate');
const Volunteer = require('../models/Volunteer');
const { generateCertificateBuffer } = require('../services/pdfService');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const fs = require('fs');
const path = require('path');

const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('volunteerId', 'fullName email mobile volunteerId totalHours')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: certificates.length, data: certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('volunteerId', 'fullName email mobile volunteerId totalHours');
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate record not found' });
    }
    res.status(200).json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateCertificate = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    if (!volunteerId) {
      return res.status(400).json({ success: false, message: 'Volunteer ID is required' });
    }

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    const issueDate = new Date();

    // 1. Generate PDF buffer using PDFKit service
    const pdfBuffer = await generateCertificateBuffer(volunteer, issueDate);

    // 2. Save PDF temporarily to disk with a clean filename
    const filename = `cert-${volunteer.volunteerId}-${Date.now()}.pdf`;
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const localPath = path.join(uploadsDir, filename);
    fs.writeFileSync(localPath, pdfBuffer);

    // 3. Upload to Cloudinary (will return Cloudinary URL & delete local, or fallback to local path)
    const certificateUrl = await uploadToCloudinary(localPath, 'certificates');

    // 4. Save metadata to Certificate collection
    const newCertificate = await Certificate.create({
      volunteerId,
      certificateUrl,
      issueDate
    });

    const populated = await newCertificate.populate('volunteerId', 'fullName email volunteerId totalHours');

    req.logAction = `Generated volunteer certificate for: ${volunteer.fullName}`;
    req.logDetails = { certificateId: newCertificate._id, volunteerId: volunteer._id };

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate record not found' });
    }

    // Attempt to delete local file if it's stored locally
    if (certificate.certificateUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', certificate.certificateUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Failed to delete local certificate file:', e);
        }
      }
    }

    await Certificate.findByIdAndDelete(req.params.id);

    req.logAction = `Deleted certificate record: ${req.params.id}`;
    req.logDetails = { certificateId: certificate._id };

    res.status(200).json({ success: true, message: 'Certificate deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/certificates/:id/download
const downloadCertificatePdf = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id).populate('volunteerId');
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    // Check if certificate url is local or remote
    if (certificate.certificateUrl.startsWith('/uploads/')) {
      // Return the file from local storage
      const filePath = path.join(__dirname, '..', certificate.certificateUrl);
      if (fs.existsSync(filePath)) {
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=cert-${certificate.volunteerId.volunteerId}.pdf`
        });
        return res.sendFile(filePath);
      }
    }

    // If Cloudinary or file not found locally, generate the PDF on the fly or redirect to url
    // Let's generate it on the fly to guarantee it serves successfully!
    const pdfBuffer = await generateCertificateBuffer(certificate.volunteerId, certificate.issueDate);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=cert-${certificate.volunteerId.volunteerId}.pdf`,
      'Content-Length': pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCertificates,
  getCertificateById,
  generateCertificate,
  deleteCertificate,
  downloadCertificatePdf
};
