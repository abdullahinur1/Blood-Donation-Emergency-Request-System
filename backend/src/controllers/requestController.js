const BloodRequest = require('../models/BloodRequest');
const DonorProfile = require('../models/DonorProfile');
const BloodInventory = require('../models/BloodInventory');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { getCompatibleDonorGroups } = require('../utils/bloodCompatibility');

// @desc    Create new blood request
// @route   POST /api/requests
// @access  Private (Requester, HospitalStaff, Admin)
exports.createRequest = async (req, res, next) => {
  try {
    const {
      patientName,
      bloodGroup,
      unitsNeeded,
      hospitalName,
      hospitalAddress,
      city,
      state,
      urgency = 'Urgent',
      contactName,
      contactPhone,
      requiredByDate,
      notes,
    } = req.body;

    const request = await BloodRequest.create({
      requester: req.user.id,
      requesterRole: req.user.role,
      patientName,
      bloodGroup,
      unitsNeeded,
      hospitalName,
      hospitalAddress,
      city,
      state: state || '',
      urgency,
      contactName: contactName || req.user.name,
      contactPhone: contactPhone || req.user.phone || 'N/A',
      requiredByDate,
      notes: notes || '',
      status: req.user.role === 'HospitalStaff' || req.user.role === 'Admin' ? 'Approved' : 'Pending',
      verifiedBy: req.user.role === 'HospitalStaff' || req.user.role === 'Admin' ? req.user.id : null,
      verifiedAt: req.user.role === 'HospitalStaff' || req.user.role === 'Admin' ? new Date() : null,
    });

    // Notify compatible available donors in the city/area
    const compatibleDonorGroups = getCompatibleDonorGroups(bloodGroup);
    const matchedDonors = await DonorProfile.find({
      bloodGroup: { $in: compatibleDonorGroups },
      isAvailableToDonate: true,
    }).populate('user');

    // Create notifications for matched donors (up to 15 top donors)
    const donorNotifications = matchedDonors.slice(0, 15).map((donor) => ({
      recipient: donor.user._id,
      title: `URGENT: ${bloodGroup} Blood Needed!`,
      message: `Emergency blood request for patient ${patientName} at ${hospitalName}, ${city}. Can you donate?`,
      type: 'emergency_request',
      link: `/requests/${request._id}`,
    }));

    if (donorNotifications.length > 0) {
      await Notification.insertMany(donorNotifications);
    }

    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'REQUEST_CREATED',
      details: `Created ${urgency} request for ${unitsNeeded} unit(s) of ${bloodGroup} at ${hospitalName}`,
      entityType: 'BloodRequest',
      entityId: request._id.toString(),
    });

    res.status(201).json({
      success: true,
      request,
      compatibleDonorsNotified: donorNotifications.length,
      message: 'Blood request created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blood requests with filters
// @route   GET /api/requests
// @access  Public (or Private)
exports.getRequests = async (req, res, next) => {
  try {
    const { status, urgency, bloodGroup, city, myRequests } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (urgency && urgency !== 'All') {
      query.urgency = urgency;
    }

    if (bloodGroup && bloodGroup !== 'All') {
      query.bloodGroup = bloodGroup;
    }

    if (city && city.trim() !== '') {
      query.city = { $regex: new RegExp(city.trim(), 'i') };
    }

    if (myRequests === 'true' && req.user) {
      query.requester = req.user.id;
    }

    const requests = await BloodRequest.find(query)
      .populate('requester', 'name email phone role organizationName')
      .populate('pledges.donor', 'name email phone')
      .populate('verifiedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blood request by ID
// @route   GET /api/requests/:id
// @access  Public (or Private)
exports.getRequestById = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requester', 'name email phone role organizationName')
      .populate('pledges.donor', 'name email phone')
      .populate('bloodBankResponses.bloodBankStaff', 'name email')
      .populate('verifiedBy', 'name role organizationName');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    // Find compatible donors count
    const compatibleDonorGroups = getCompatibleDonorGroups(request.bloodGroup);
    const compatibleDonors = await DonorProfile.find({
      bloodGroup: { $in: compatibleDonorGroups },
      isAvailableToDonate: true,
    }).populate('user', 'name email phone city state isVerified');

    res.status(200).json({
      success: true,
      request,
      compatibleDonors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update request status
// @route   PATCH /api/requests/:id/status
// @access  Private (Requester, HospitalStaff, BloodBankStaff, Admin)
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason, unitsFulfilled } = req.body;
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    // Requester can only cancel their own request
    if (
      req.user.role === 'Requester' &&
      request.requester.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage your own requests',
      });
    }

    if (req.user.role === 'Requester' && status !== 'Cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Requesters can only cancel requests',
      });
    }

    request.status = status;
    if (status === 'Cancelled') {
      request.cancellationReason = cancellationReason || 'Cancelled by requester/staff';
    }
    if (status === 'Fulfilled') {
      request.fulfilledAt = new Date();
      if (unitsFulfilled !== undefined) {
        request.unitsFulfilled = unitsFulfilled;
      } else {
        request.unitsFulfilled = request.unitsNeeded;
      }
    }
    if (status === 'Approved' && !request.verifiedBy) {
      request.verifiedBy = req.user.id;
      request.verifiedAt = new Date();
    }

    await request.save();

    // Notify requester if status changed by staff
    if (request.requester.toString() !== req.user.id.toString()) {
      await Notification.create({
        recipient: request.requester,
        title: `Request Status Updated: ${status}`,
        message: `Your blood request for ${request.patientName} is now marked as ${status}.`,
        type: 'status_change',
        link: `/requests/${request._id}`,
      });
    }

    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'REQUEST_STATUS_UPDATED',
      details: `Status of Request #${request._id} updated to ${status}`,
      entityType: 'BloodRequest',
      entityId: request._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: `Request status updated to ${status}`,
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hospital staff / Admin verifies request
// @route   PATCH /api/requests/:id/verify
// @access  Private (HospitalStaff, Admin)
exports.verifyRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.status = 'Approved';
    request.verifiedBy = req.user.id;
    request.verifiedAt = new Date();
    await request.save();

    await Notification.create({
      recipient: request.requester,
      title: 'Blood Request Verified & Approved',
      message: `Your emergency request for ${request.patientName} was verified by ${req.user.name} (${req.user.organizationName || 'Hospital Staff'}).`,
      type: 'status_change',
      link: `/requests/${request._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Request has been verified and approved',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Blood Bank staff allocates inventory units to request
// @route   POST /api/requests/:id/allocate
// @access  Private (BloodBankStaff, Admin)
exports.allocateBloodBankUnits = async (req, res, next) => {
  try {
    const { unitsAllocated, bloodBankName, notes } = req.body;
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    const unitsNum = Number(unitsAllocated) || 1;

    // Check inventory stock
    const inventory = await BloodInventory.findOne({
      bloodGroup: request.bloodGroup,
    });

    if (inventory && inventory.unitsAvailable < unitsNum) {
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory! Only ${inventory.unitsAvailable} unit(s) of ${request.bloodGroup} available.`,
      });
    }

    // Deduct stock if inventory record exists
    if (inventory) {
      inventory.unitsAvailable = Math.max(0, inventory.unitsAvailable - unitsNum);
      inventory.lastUpdatedBy = req.user.id;
      await inventory.save();
    }

    request.bloodBankResponses.push({
      bloodBankStaff: req.user.id,
      bloodBankName: bloodBankName || req.user.organizationName || 'Regional Blood Center',
      unitsAllocated: unitsNum,
      notes: notes || '',
      allocatedAt: new Date(),
    });

    request.unitsFulfilled = (request.unitsFulfilled || 0) + unitsNum;
    if (request.unitsFulfilled >= request.unitsNeeded) {
      request.status = 'Fulfilled';
      request.fulfilledAt = new Date();
    } else {
      request.status = 'Matched';
    }

    await request.save();

    await Notification.create({
      recipient: request.requester,
      title: 'Blood Bank Allocated Blood Units!',
      message: `${bloodBankName || 'Blood Bank'} allocated ${unitsNum} unit(s) of ${request.bloodGroup} blood for ${request.patientName}.`,
      type: 'status_change',
      link: `/requests/${request._id}`,
    });

    res.status(200).json({
      success: true,
      message: `Successfully allocated ${unitsNum} unit(s) of ${request.bloodGroup} to the request`,
      request,
    });
  } catch (error) {
    next(error);
  }
};
