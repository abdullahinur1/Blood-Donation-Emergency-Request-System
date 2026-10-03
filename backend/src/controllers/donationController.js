const DonationRecord = require('../models/DonationRecord');
const DonorProfile = require('../models/DonorProfile');
const BloodInventory = require('../models/BloodInventory');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// Helper to generate donation certificate code
const generateCertificateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'DON-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Get donation history for current user (Donor)
// @route   GET /api/donations/my
// @access  Private (Donor)
exports.getMyDonations = async (req, res, next) => {
  try {
    const donations = await DonationRecord.find({ donor: req.user.id })
      .populate('recipientRequest', 'patientName hospitalName bloodGroup urgency')
      .populate('recordedBy', 'name role organizationName')
      .sort({ donationDate: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donations (Staff / Admin)
// @route   GET /api/donations
// @access  Private (HospitalStaff, BloodBankStaff, Admin)
exports.getAllDonations = async (req, res, next) => {
  try {
    const { bloodGroup, status, donorId } = req.query;
    const query = {};

    if (bloodGroup && bloodGroup !== 'All') query.bloodGroup = bloodGroup;
    if (status && status !== 'All') query.status = status;
    if (donorId) query.donor = donorId;

    const donations = await DonationRecord.find(query)
      .populate('donor', 'name email phone')
      .populate('recipientRequest', 'patientName hospitalName bloodGroup')
      .populate('recordedBy', 'name role organizationName')
      .sort({ donationDate: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a new donation
// @route   POST /api/donations
// @access  Private (HospitalStaff, BloodBankStaff, Admin)
exports.recordDonation = async (req, res, next) => {
  try {
    const {
      donorId,
      recipientRequestId,
      facilityName,
      bloodGroup,
      unitsDonated = 1,
      donationDate,
      notes,
      addToInventory = true,
    } = req.body;

    if (!donorId || !bloodGroup || !facilityName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide donorId, bloodGroup, and facilityName',
      });
    }

    const certificateCode = generateCertificateCode();

    const donation = await DonationRecord.create({
      donor: donorId,
      recipientRequest: recipientRequestId || null,
      facilityName,
      bloodGroup,
      unitsDonated: Number(unitsDonated) || 1,
      donationDate: donationDate || new Date(),
      status: 'Completed',
      certificateCode,
      recordedBy: req.user.id,
      notes: notes || '',
    });

    // Update donor profile stats
    await DonorProfile.findOneAndUpdate(
      { user: donorId },
      {
        $inc: { totalDonations: unitsDonated },
        $set: { lastDonationDate: donation.donationDate },
      }
    );

    // Optionally restock blood bank inventory
    if (addToInventory) {
      await BloodInventory.findOneAndUpdate(
        { bloodGroup },
        {
          $inc: { unitsAvailable: unitsDonated },
          $set: { lastUpdatedBy: req.user.id },
        },
        { upsert: true, new: true }
      );
    }

    // Send thank you notification to donor
    await Notification.create({
      recipient: donorId,
      title: 'Donation Completed! Thank You, Hero!',
      message: `Your donation of ${unitsDonated} unit(s) of ${bloodGroup} blood at ${facilityName} has been recorded. Certificate code: ${certificateCode}.`,
      type: 'system_notice',
      link: '/donor/history',
    });

    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DONATION_RECORDED',
      details: `Recorded donation of ${unitsDonated} unit(s) of ${bloodGroup} for Donor ${donorId}`,
      entityType: 'DonationRecord',
      entityId: donation._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully and certificate issued',
      donation,
    });
  } catch (error) {
    next(error);
  }
};
