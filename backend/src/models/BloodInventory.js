const mongoose = require('mongoose');

const bloodInventorySchema = new mongoose.Schema(
  {
    bloodBankName: {
      type: String,
      required: [true, 'Blood bank name is required'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    unitsAvailable: {
      type: Number,
      required: true,
      min: [0, 'Units cannot be negative'],
      default: 0,
    },
    componentType: {
      type: String,
      enum: ['Whole Blood', 'Red Blood Cells', 'Platelets', 'Plasma'],
      default: 'Whole Blood',
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    location: {
      city: { type: String, default: '' },
      address: { type: String, default: '' },
      storageUnit: { type: String, default: 'Storage-1' },
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BloodInventory', bloodInventorySchema);
