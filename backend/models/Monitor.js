import mongoose from 'mongoose';

const monitorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  interval: {
    type: Number,
    default: 300000, // 5 minutes in milliseconds
    min: 60000 // minimum 1 minute
  },
  timeout: {
    type: Number,
    default: 10000, // 10 seconds
    min: 1000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastChecked: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['up', 'down', 'unknown'],
    default: 'unknown'
  },
  uptime: {
    type: Number,
    default: 0 // percentage
  },
  totalChecks: {
    type: Number,
    default: 0
  },
  successfulChecks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
monitorSchema.index({ userId: 1, isActive: 1 });
monitorSchema.index({ isActive: 1, lastChecked: 1 });

export default mongoose.model('Monitor', monitorSchema);
