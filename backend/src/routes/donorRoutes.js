const express = require('express');
const router = express.Router();
const {
  getDonorProfile,
  updateDonorProfile,
  toggleAvailability,
  searchDonors,
  getCompatibleRequests,
  pledgeToRequest,
} = require('../controllers/donorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/search', searchDonors);
router.get('/profile', protect, authorize('Donor', 'Admin'), getDonorProfile);
router.put('/profile', protect, authorize('Donor', 'Admin'), updateDonorProfile);
router.patch('/availability', protect, authorize('Donor', 'Admin'), toggleAvailability);
router.get('/compatible-requests', protect, authorize('Donor', 'Admin'), getCompatibleRequests);
router.post('/pledge/:requestId', protect, authorize('Donor'), pledgeToRequest);

module.exports = router;
