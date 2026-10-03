const express = require('express');
const router = express.Router();
const {
  getInventory,
  updateInventory,
  adjustStock,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getInventory);
router.put('/:id', protect, authorize('BloodBankStaff', 'Admin'), updateInventory);
router.post('/adjust', protect, authorize('BloodBankStaff', 'Admin'), adjustStock);

module.exports = router;
