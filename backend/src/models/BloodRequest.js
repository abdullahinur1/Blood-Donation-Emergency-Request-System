const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterRole: {
      type: String,
      enum: ['Requester', 'HospitalStaff', 'Admin'],
      default: 'Requester',
    },
    patientName: {
      type: String,
      required: [true, 'Patient name or reference code is required'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    unitsNeeded: {
      type: Number,
      required: [true, 'Number of units needed is required'],
      min: [1, 'At least 1 unit is required'],
      default: 1,
    },
    unitsFulfilled: {
      type: Number,
      default: 0,
      min: 0,
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    hospitalAddress: {
      type: String,
      required: [true, 'Hospital address is required'],
      trim: true,
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
    urgency: {
      type: String,
      enum: ['Standard', 'Urgent', 'Critical'],
      default: 'Urgent',
    },
    contactName: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    requiredByDate: {
      type: Date,
      required: [true, 'Required by date is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Matched', 'Fulfilled', 'Cancelled'],
      default: 'Pending',
    },
    notes: {
      type: String,
      default: '',
    },
    // Donors who have pledged or accepted
    pledges: [
      {
        donor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        unitsPledged: {
          type: Number,
          default: 1,
        },
        status: {
          type: String,
          enum: ['Pledged', 'Arrived', 'Donated', 'Cancelled'],
          default: 'Pledged',
        },
        pledgedAt: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
          default: '',
        },
      },
    ],
    // Blood Bank allocations
    bloodBankResponses: [
      {
        bloodBankStaff: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        bloodBankName: {
          type: String,
          required: true,
        },
        unitsAllocated: {
          type: Number,
          required: true,
        },
        allocatedAt: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
          default: '',
        },
      },
    ],
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    fulfilledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
