const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  verifyRequest,
  allocateBloodBankUnits,
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getRequests)
  .post(protect, authorize('Requester', 'HospitalStaff', 'Admin'), createRequest);

router.route('/:id')
  .get(getRequestById);

router.patch('/:id/status', protect, updateRequestStatus);
router.patch('/:id/verify', protect, authorize('HospitalStaff', 'Admin'), verifyRequest);
router.post('/:id/allocate', protect, authorize('BloodBankStaff', 'Admin'), allocateBloodBankUnits);

module.exports = router;
