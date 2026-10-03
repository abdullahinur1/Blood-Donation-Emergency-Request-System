const express = require('express');
const router = express.Router();
const {
  getMyDonations,
  getAllDonations,
  recordDonation,
} = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/my', protect, getMyDonations);
router.get('/', protect, authorize('HospitalStaff', 'BloodBankStaff', 'Admin'), getAllDonations);
router.post('/', protect, authorize('HospitalStaff', 'BloodBankStaff', 'Admin'), recordDonation);

module.exports = router;
