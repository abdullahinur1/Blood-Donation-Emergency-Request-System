const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
      default: 'System',
    },
    userRole: {
      type: String,
      default: 'System',
    },
    action: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
    entityType: {
      type: String,
      default: 'General',
    },
    entityId: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
