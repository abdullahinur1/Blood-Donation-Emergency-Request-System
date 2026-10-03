const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Hospital', 'BloodBank', 'TraumaCenter', 'Clinic'],
      default: 'Hospital',
    },
    registrationNumber: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    emergencyHotline: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
