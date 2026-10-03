const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const BloodRequest = require('../models/BloodRequest');
const BloodInventory = require('../models/BloodInventory');
const DonationRecord = require('../models/DonationRecord');
const AuditLog = require('../models/AuditLog');

// @desc    Get system overview statistics for dashboards
// @route   GET /api/stats/overview
// @access  Public (or Private)
exports.getOverviewStats = async (req, res, next) => {
  try {
    const [
      totalDonors,
      availableDonors,
      totalRequests,
      pendingRequests,
      fulfilledRequests,
      criticalRequests,
      totalDonations,
      inventory,
      recentRequests,
      recentActivity,
    ] = await Promise.all([
      DonorProfile.countDocuments(),
      DonorProfile.countDocuments({ isAvailableToDonate: true }),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'Pending' }),
      BloodRequest.countDocuments({ status: 'Fulfilled' }),
      BloodRequest.countDocuments({ urgency: 'Critical', status: { $ne: 'Fulfilled' } }),
      DonationRecord.countDocuments({ status: 'Completed' }),
      BloodInventory.find().sort({ bloodGroup: 1 }),
      BloodRequest.find().sort({ createdAt: -1 }).limit(6).populate('requester', 'name'),
      AuditLog.find().sort({ createdAt: -1 }).limit(10),
    ]);

    const totalUnitsInStock = inventory.reduce((sum, item) => sum + item.unitsAvailable, 0);
    const lowStockCount = inventory.filter((item) => item.unitsAvailable <= item.lowStockThreshold).length;

    // Blood group inventory map
    const inventoryByGroup = {};
    inventory.forEach((item) => {
      inventoryByGroup[item.bloodGroup] = {
        units: item.unitsAvailable,
        lowStock: item.unitsAvailable <= item.lowStockThreshold,
        threshold: item.lowStockThreshold,
      };
    });

    // Donors by blood group breakdown
    const donorsByBloodGroup = await DonorProfile.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalDonors,
        availableDonors,
        totalRequests,
        pendingRequests,
        fulfilledRequests,
        criticalRequests,
        totalDonations,
        totalUnitsInStock,
        lowStockCount,
      },
      inventoryByGroup,
      donorsByBloodGroup,
      recentRequests,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};
