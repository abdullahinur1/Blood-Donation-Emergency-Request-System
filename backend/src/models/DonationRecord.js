const mongoose = require('mongoose');

const donationRecordSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      default: null,
    },
    facilityName: {
      type: String,
      required: [true, 'Facility name is required'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    unitsDonated: {
      type: Number,
      default: 1,
      min: 1,
    },
    donationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Completed', 'Scheduled', 'Cancelled'],
      default: 'Completed',
    },
    certificateCode: {
      type: String,
      unique: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DonationRecord', donationRecordSchema);
