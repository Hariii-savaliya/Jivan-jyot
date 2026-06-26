const express = require('express');
const {
  getDischarges,
  getDischargeById,
  createDischarge,
  updateDischarge,
  deleteDischarge,
  getDischargeReceipt
} = require('../controllers/dischargeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

const allowedRoles = ['Super Admin', 'Admin', 'Manager'];

router.get('/', authorize(...allowedRoles), getDischarges);
router.get('/:id', authorize(...allowedRoles), getDischargeById);
router.post('/', authorize(...allowedRoles), createDischarge);
router.put('/:id', authorize(...allowedRoles), updateDischarge);
router.delete('/:id', authorize(...allowedRoles), deleteDischarge);
router.get('/:id/receipt', authorize(...allowedRoles), getDischargeReceipt);

module.exports = router;
