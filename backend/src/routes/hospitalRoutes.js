const express = require('express');
const router = express.Router();
const {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
} = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getHospitals)
  .post(protect, authorize('Admin', 'HospitalStaff'), createHospital);

router.route('/:id')
  .get(getHospitalById)
  .put(protect, authorize('Admin'), updateHospital)
  .delete(protect, authorize('Admin'), deleteHospital);

module.exports = router;
