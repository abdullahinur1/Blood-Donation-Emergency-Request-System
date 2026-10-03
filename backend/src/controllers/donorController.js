const DonorProfile = require('../models/DonorProfile');
const BloodRequest = require('../models/BloodRequest');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { getCompatibleDonorGroups, getCompatibleRecipientGroups } = require('../utils/bloodCompatibility');

// @desc    Get donor profile of logged-in user
// @route   GET /api/donors/profile
// @access  Private (Donor)
exports.getDonorProfile = async (req, res, next) => {
  try {
    let profile = await DonorProfile.findOne({ user: req.user.id }).populate('user', 'name email phone city state isVerified');
    
    // Auto-create blank profile if not present
    if (!profile) {
      profile = await DonorProfile.create({
        user: req.user.id,
        bloodGroup: 'O+',
        city: req.user.city || 'City',
        state: req.user.state || '',
        contactPhone: req.user.phone || 'N/A',
      });
      profile = await profile.populate('user', 'name email phone city state isVerified');
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update donor profile
// @route   PUT /api/donors/profile
// @access  Private (Donor)
exports.updateDonorProfile = async (req, res, next) => {
  try {
    const {
      bloodGroup,
      age,
      gender,
      weightKg,
      address,
      city,
      state,
      postalCode,
      contactPhone,
      emergencyContact,
      isAvailableToDonate,
      medicalConditions,
      eligibilityNotes,
      lastDonationDate,
    } = req.body;

    const profileFields = {
      bloodGroup,
      age,
      gender,
      weightKg,
      address,
      city,
      state,
      postalCode,
      contactPhone,
      emergencyContact,
      isAvailableToDonate,
      medicalConditions,
      eligibilityNotes,
      lastDonationDate,
    };

    // Filter undefined
    Object.keys(profileFields).forEach(
      (key) => profileFields[key] === undefined && delete profileFields[key]
    );

    let profile = await DonorProfile.findOne({ user: req.user.id });

    if (profile) {
      profile = await DonorProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, runValidators: true }
      ).populate('user', 'name email phone city state isVerified');
    } else {
      profileFields.user = req.user.id;
      profile = await DonorProfile.create(profileFields);
      profile = await profile.populate('user', 'name email phone city state isVerified');
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle donor availability
// @route   PATCH /api/donors/availability
// @access  Private (Donor)
exports.toggleAvailability = async (req, res, next) => {
  try {
    const profile = await DonorProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Donor profile not found' });
    }

    profile.isAvailableToDonate = req.body.isAvailableToDonate !== undefined
      ? req.body.isAvailableToDonate
      : !profile.isAvailableToDonate;

    await profile.save();

    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DONOR_AVAILABILITY_CHANGED',
      details: `Availability changed to ${profile.isAvailableToDonate}`,
      entityType: 'DonorProfile',
      entityId: profile._id.toString(),
    });

    res.status(200).json({
      success: true,
      isAvailableToDonate: profile.isAvailableToDonate,
      message: `Availability updated to ${profile.isAvailableToDonate ? 'Available' : 'Unavailable'}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search available donors by blood group, location & availability
// @route   GET /api/donors/search
// @access  Public (or Private)
exports.searchDonors = async (req, res, next) => {
  try {
    const { bloodGroup, city, state, availableOnly, search } = req.query;

    const query = {};

    if (bloodGroup && bloodGroup !== 'All') {
      query.bloodGroup = bloodGroup;
    }

    if (city && city.trim() !== '') {
      query.city = { $regex: new RegExp(city.trim(), 'i') };
    }

    if (state && state.trim() !== '') {
      query.state = { $regex: new RegExp(state.trim(), 'i') };
    }

    if (availableOnly === 'true' || availableOnly === true) {
      query.isAvailableToDonate = true;
    }

    let donors = await DonorProfile.find(query)
      .populate('user', 'name email phone city state isVerified isActive')
      .sort({ isAvailableToDonate: -1, updatedAt: -1 });

    // Filter out inactive users and protect sensitive info if not logged in
    donors = donors.filter((d) => d.user && d.user.isActive);

    if (search && search.trim() !== '') {
      const term = search.toLowerCase();
      donors = donors.filter(
        (d) =>
          d.user?.name?.toLowerCase().includes(term) ||
          d.city?.toLowerCase().includes(term) ||
          d.bloodGroup?.toLowerCase().includes(term)
      );
    }

    res.status(200).json({
      success: true,
      count: donors.length,
      donors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get compatible requests for logged-in donor
// @route   GET /api/donors/compatible-requests
// @access  Private (Donor)
exports.getCompatibleRequests = async (req, res, next) => {
  try {
    const profile = await DonorProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Please create your donor profile first' });
    }

    // Donor can give to these recipient groups
    const compatibleRecipientGroups = getCompatibleRecipientGroups(profile.bloodGroup);

    // Active requests needing these blood groups
    const requests = await BloodRequest.find({
      bloodGroup: { $in: compatibleRecipientGroups },
      status: { $in: ['Pending', 'Approved', 'Matched'] },
    })
      .populate('requester', 'name phone email organizationName')
      .sort({ urgency: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      donorBloodGroup: profile.bloodGroup,
      compatibleRecipientGroups,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Donor pledges to respond to an emergency request
// @route   POST /api/donors/pledge/:requestId
// @access  Private (Donor)
exports.pledgeToRequest = async (req, res, next) => {
  try {
    const { units = 1, notes = '' } = req.body;
    const request = await BloodRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    if (request.status === 'Fulfilled' || request.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot pledge to a request that is already ${request.status}`,
      });
    }

    // Check if donor already pledged
    const existingPledge = request.pledges.find(
      (p) => p.donor.toString() === req.user.id.toString()
    );

    if (existingPledge) {
      return res.status(400).json({
        success: false,
        message: 'You have already pledged to this request',
      });
    }

    request.pledges.push({
      donor: req.user.id,
      unitsPledged: units,
      notes,
      pledgedAt: new Date(),
      status: 'Pledged',
    });

    if (request.status === 'Pending' || request.status === 'Approved') {
      request.status = 'Matched';
    }

    await request.save();

    // Notify requester
    await Notification.create({
      recipient: request.requester,
      title: 'Donor Pledged for Your Blood Request!',
      message: `${req.user.name} pledged ${units} unit(s) of compatible blood for patient ${request.patientName}.`,
      type: 'pledge_received',
      link: `/requests/${request._id}`,
    });

    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DONOR_PLEDGED',
      details: `Pledged ${units} unit(s) to Request #${request._id}`,
      entityType: 'BloodRequest',
      entityId: request._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: 'You have successfully pledged to this emergency request! The requester and hospital have been notified.',
      request,
    });
  } catch (error) {
    next(error);
  }
};
