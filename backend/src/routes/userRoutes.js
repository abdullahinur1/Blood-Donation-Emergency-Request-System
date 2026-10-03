const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Admin'));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUserById)
  .delete(deleteUser);

router.put('/:id/role', updateUserRole);
router.patch('/:id/status', toggleUserStatus);

module.exports = router;
