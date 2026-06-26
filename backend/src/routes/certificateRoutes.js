const express = require('express');
const {
  getCertificates,
  getCertificateById,
  generateCertificate,
  deleteCertificate,
  downloadCertificatePdf
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

const allowedRoles = [
  'Super Admin',
  'Admin',
  'Manager',
  'Volunteer Coordinator'
];

router.get('/', authorize(...allowedRoles), getCertificates);
router.get('/:id', authorize(...allowedRoles), getCertificateById);
router.post('/', authorize(...allowedRoles), generateCertificate);
router.delete('/:id', authorize(...allowedRoles), deleteCertificate);
router.get('/:id/download', authorize(...allowedRoles), downloadCertificatePdf);

module.exports = router;
