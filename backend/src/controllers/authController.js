const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const AuditLog = require('../models/AuditLog');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_blood_donation_system_2026_secure',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'Requester',
      phone,
      address,
      city,
      state,
      organizationName,
      // Donor profile fields if registering as Donor
      bloodGroup,
      age,
      gender,
      weightKg,
      isAvailableToDonate = true,
    } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with that email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone: phone || '',
      address: address || '',
      city: city || '',
      state: state || '',
      organizationName: organizationName || '',
    });

    // If role is Donor, auto-create a DonorProfile
    if (role === 'Donor') {
      await DonorProfile.create({
        user: user._id,
        bloodGroup: bloodGroup || 'O+',
        age: age || 25,
        gender: gender || 'Male',
        weightKg: weightKg || 65,
        city: city || 'City',
        state: state || '',
        contactPhone: phone || 'N/A',
        isAvailableToDonate: isAvailableToDonate,
      });
    }

    await AuditLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_REGISTERED',
      details: `New ${role} registered: ${user.email}`,
      entityType: 'User',
      entityId: user._id.toString(),
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        state: user.state,
        organizationName: user.organizationName,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & return token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    const token = generateToken(user._id);

    // If Donor, fetch profile info
    let donorProfile = null;
    if (user.role === 'Donor') {
      donorProfile = await DonorProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        state: user.state,
        organizationName: user.organizationName,
        isVerified: user.isVerified,
        donorProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let donorProfile = null;

    if (user.role === 'Donor') {
      donorProfile = await DonorProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        organizationName: user.organizationName,
        isVerified: user.isVerified,
        donorProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      organizationName: req.body.organizationName,
    };

    // Filter out undefined
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        organizationName: user.organizationName,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};
