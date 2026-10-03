const Hospital = require('../models/Hospital');

// @desc    Get all hospitals and blood banks
// @route   GET /api/hospitals
// @access  Public
exports.getHospitals = async (req, res, next) => {
  try {
    const { type, city } = req.query;
    const query = {};

    if (type && type !== 'All') query.type = type;
    if (city && city.trim() !== '') query.city = { $regex: new RegExp(city.trim(), 'i') };

    const hospitals = await Hospital.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      hospitals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hospital
// @route   GET /api/hospitals/:id
// @access  Public
exports.getHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }
    res.status(200).json({ success: true, hospital });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new facility
// @route   POST /api/hospitals
// @access  Private (Admin, HospitalStaff, BloodBankStaff)
exports.createHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json({ success: true, hospital });
  } catch (error) {
    next(error);
  }
};

// @desc    Update facility
// @route   PUT /api/hospitals/:id
// @access  Private (Admin)
exports.updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }
    res.status(200).json({ success: true, hospital });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete facility
// @route   DELETE /api/hospitals/:id
// @access  Private (Admin)
exports.deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }
    res.status(200).json({ success: true, message: 'Facility removed' });
  } catch (error) {
    next(error);
  }
};
