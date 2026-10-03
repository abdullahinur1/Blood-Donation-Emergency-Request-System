const mongoose = require('mongoose');

const donorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Please provide blood group'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    age: {
      type: Number,
      min: [18, 'Must be at least 18 to donate'],
      max: [70, 'Maximum donation age is 70'],
      default: 25,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    weightKg: {
      type: Number,
      min: [45, 'Weight must be at least 45kg to donate'],
      default: 65,
    },
    address: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      default: '',
      trim: true,
    },
    postalCode: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },
    isAvailableToDonate: {
      type: Boolean,
      default: true,
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    medicalConditions: {
      type: String,
      default: 'None',
    },
    eligibilityNotes: {
      type: String,
      default: 'Eligible for donation',
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DonorProfile', donorProfileSchema);
