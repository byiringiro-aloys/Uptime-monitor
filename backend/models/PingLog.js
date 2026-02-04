import mongoose from 'mongoose';

const pingLogSchema = new mongoose.Schema({
  monitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Monitor',
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  responseTime: {
    type: Number, // in milliseconds
    default: null
  },
  statusCode: {
    type: Number,
    default: null
  },
  errorMessage: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false // We're using custom timestamp field
});

// Index for efficient queries
pingLogSchema.index({ monitorId: 1, timestamp: -1 });
pingLogSchema.index({ timestamp: 1 }); // For cleanup operations

// TTL index to automatically delete old logs after 30 days
pingLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model('PingLog', pingLogSchema);
