const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const AuditLog = require('../models/AuditLog');

// @desc    Get all users with optional filter
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, isActive, search } = req.query;
    const query = {};

    if (role && role !== 'All') query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    let users = await User.find(query).sort({ createdAt: -1 });

    if (search && search.trim() !== '') {
      const term = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.city.toLowerCase().includes(term) ||
          (u.organizationName && u.organizationName.toLowerCase().includes(term))
      );
    }

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let donorProfile = null;
    if (user.role === 'Donor') {
      donorProfile = await DonorProfile.findOne({ user: user._id });
    }

    res.status(200).json({ success: true, user, donorProfile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role & details
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role, isVerified, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldRole = user.role;
    if (role) user.role = role;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // If role changed to Donor and no donor profile exists, create one
    if (role === 'Donor') {
      const existingProfile = await DonorProfile.findOne({ user: user._id });
      if (!existingProfile) {
        await DonorProfile.create({
          user: user._id,
          bloodGroup: 'O+',
          city: user.city || 'City',
          state: user.state || '',
          contactPhone: user.phone || 'N/A',
        });
      }
    }

    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_ROLE_UPDATED',
      details: `Changed role of user ${user.email} from ${oldRole} to ${user.role}`,
      entityType: 'User',
      entityId: user._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_STATUS_TOGGLED',
      details: `User ${user.email} status set to ${user.isActive ? 'Active' : 'Deactivated'}`,
      entityType: 'User',
      entityId: user._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: `User is now ${user.isActive ? 'Active' : 'Deactivated'}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await DonorProfile.findOneAndDelete({ user: req.params.id });

    res.status(200).json({
      success: true,
      message: 'User removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
