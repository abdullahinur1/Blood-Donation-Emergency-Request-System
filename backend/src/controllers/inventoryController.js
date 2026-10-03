const BloodInventory = require('../models/BloodInventory');
const AuditLog = require('../models/AuditLog');

// @desc    Get all inventory records
// @route   GET /api/inventory
// @access  Public (or Private)
exports.getInventory = async (req, res, next) => {
  try {
    const { bloodBankName } = req.query;
    const query = {};
    if (bloodBankName) {
      query.bloodBankName = bloodBankName;
    }

    const inventory = await BloodInventory.find(query)
      .populate('lastUpdatedBy', 'name email role')
      .sort({ bloodGroup: 1 });

    // Calculate total units & low stock items
    const totalUnits = inventory.reduce((acc, item) => acc + item.unitsAvailable, 0);
    const lowStockItems = inventory.filter((item) => item.unitsAvailable <= item.lowStockThreshold);

    res.status(200).json({
      success: true,
      totalUnits,
      lowStockCount: lowStockItems.length,
      inventory,
      lowStockItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update or adjust inventory units
// @route   PUT /api/inventory/:id
// @access  Private (BloodBankStaff, Admin)
exports.updateInventory = async (req, res, next) => {
  try {
    const { unitsAvailable, lowStockThreshold, componentType, location } = req.body;

    let item = await BloodInventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    const previousUnits = item.unitsAvailable;

    if (unitsAvailable !== undefined) item.unitsAvailable = unitsAvailable;
    if (lowStockThreshold !== undefined) item.lowStockThreshold = lowStockThreshold;
    if (componentType !== undefined) item.componentType = componentType;
    if (location !== undefined) item.location = { ...item.location, ...location };
    item.lastUpdatedBy = req.user.id;

    await item.save();

    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'INVENTORY_UPDATED',
      details: `Updated ${item.bloodGroup} inventory: ${previousUnits} -> ${item.unitsAvailable} units`,
      entityType: 'BloodInventory',
      entityId: item._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or restock inventory by blood group
// @route   POST /api/inventory/adjust
// @access  Private (BloodBankStaff, Admin)
exports.adjustStock = async (req, res, next) => {
  try {
    const { bloodGroup, deltaUnits, bloodBankName, reason } = req.body;

    if (!bloodGroup || deltaUnits === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bloodGroup and deltaUnits (positive to add, negative to deduct)',
      });
    }

    let item = await BloodInventory.findOne({ bloodGroup });
    if (!item) {
      item = await BloodInventory.create({
        bloodBankName: bloodBankName || 'Central Red Cross Blood Bank',
        bloodGroup,
        unitsAvailable: Math.max(0, deltaUnits),
        lastUpdatedBy: req.user.id,
      });
    } else {
      item.unitsAvailable = Math.max(0, item.unitsAvailable + Number(deltaUnits));
      item.lastUpdatedBy = req.user.id;
      await item.save();
    }

    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'STOCK_ADJUSTMENT',
      details: `Adjusted ${bloodGroup} by ${deltaUnits > 0 ? '+' : ''}${deltaUnits} units. Reason: ${reason || 'Manual adjustment'}`,
      entityType: 'BloodInventory',
      entityId: item._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: `Stock updated. Current available: ${item.unitsAvailable} units`,
      item,
    });
  } catch (error) {
    next(error);
  }
};
