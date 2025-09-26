const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Reference to the submission
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true
  },

  // Report identification
  reportCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Report type and format
  type: {
    type: String,
    enum: ['assessment', 'summary', 'comparison'],
    default: 'assessment'
  },

  format: {
    type: String,
    enum: ['pdf', 'json', 'html'],
    default: 'pdf'
  },

  // Report generation details
  generation: {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    generatedAt: Date,
    template: {
      type: String,
      default: 'fitness-report-v1'
    },
    language: {
      type: String,
      enum: ['tr', 'en'],
      default: 'tr'
    }
  },

  // Report access and security
  access: {
    // Access levels
    public: {
      type: Boolean,
      default: false
    },
    patientAccess: {
      type: Boolean,
      default: true
    },
    practitionerAccess: {
      type: Boolean,
      default: true
    },

    // Access tokens
    publicToken: String,
    patientToken: String,
    practitionerToken: String,

    // Access restrictions
    expiresAt: Date,
    downloadLimit: {
      type: Number,
      default: 10
    },
    downloadCount: {
      type: Number,
      default: 0
    }
  },

  // Report content metadata
  metadata: {
    patientName: String,
    practitionerName: String,
    organization: String,
    assessmentDate: Date,
    riskLevel: String,

    // Content sections included
    sections: {
      summary: { type: Boolean, default: true },
      cardiovascular: { type: Boolean, default: true },
      bodyComposition: { type: Boolean, default: true },
      respiratory: { type: Boolean, default: true },
      mobility: { type: Boolean, default: true },
      strength: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true }
    },

    // Page count and size info
    pageCount: Number,
    fileSize: Number, // bytes
    checksum: String
  },

  // Access log
  accessLog: [{
    timestamp: { type: Date, default: Date.now },
    action: {
      type: String,
      enum: ['generated', 'viewed', 'downloaded', 'shared', 'expired']
    },
    accessType: {
      type: String,
      enum: ['patient', 'practitioner', 'public', 'admin']
    },
    ipAddress: String,
    userAgent: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: String
  }],

  // Report status
  status: {
    type: String,
    enum: ['pending', 'generating', 'ready', 'error', 'expired'],
    default: 'pending'
  },

  // Error handling
  errors: [{
    timestamp: { type: Date, default: Date.now },
    error: String,
    stack: String,
    context: String
  }],

  // Performance metrics
  performance: {
    generationTime: Number, // milliseconds
    renderTime: Number, // milliseconds
    totalTime: Number // milliseconds
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ submissionId: 1 });
reportSchema.index({ reportCode: 1 });
reportSchema.index({ 'access.patientToken': 1 });
reportSchema.index({ 'access.practitionerToken': 1 });
reportSchema.index({ 'access.publicToken': 1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ 'metadata.organization': 1, createdAt: -1 });

// Virtual properties
reportSchema.virtual('isExpired').get(function() {
  return this.access.expiresAt && this.access.expiresAt < new Date();
});

reportSchema.virtual('canDownload').get(function() {
  return !this.isExpired &&
         this.status === 'ready' &&
         this.access.downloadCount < this.access.downloadLimit;
});

reportSchema.virtual('downloadUrl').get(function() {
  if (this.access.patientToken) {
    return `/api/reports/pdf?token=${this.access.patientToken}`;
  }
  return null;
});

// Instance methods
reportSchema.methods.generateTokens = function() {
  const crypto = require('crypto');

  if (this.access.patientAccess) {
    this.access.patientToken = crypto.randomBytes(32).toString('hex');
  }

  if (this.access.practitionerAccess) {
    this.access.practitionerToken = crypto.randomBytes(32).toString('hex');
  }

  if (this.access.public) {
    this.access.publicToken = crypto.randomBytes(16).toString('hex');
  }

  return this.save();
};

reportSchema.methods.logAccess = function(action, accessType, req = null, userId = null, details = null) {
  const logEntry = {
    action,
    accessType,
    details
  };

  if (req) {
    logEntry.ipAddress = req.ip || req.connection.remoteAddress;
    logEntry.userAgent = req.get('User-Agent');
  }

  if (userId) {
    logEntry.userId = userId;
  }

  this.accessLog.push(logEntry);

  // Update download count for download actions
  if (action === 'downloaded') {
    this.access.downloadCount += 1;
  }

  return this.save();
};

reportSchema.methods.markError = function(error, context = null) {
  this.status = 'error';
  this.errors.push({
    error: error.message || error,
    stack: error.stack,
    context
  });
  return this.save();
};

reportSchema.methods.markReady = function(metadata = {}) {
  this.status = 'ready';
  this.generation.generatedAt = new Date();

  // Update metadata
  Object.assign(this.metadata, metadata);

  return this.save();
};

// Static methods
reportSchema.statics.findByToken = function(token, tokenType = 'patient') {
  const query = {};
  query[`access.${tokenType}Token`] = token;

  return this.findOne(query)
    .populate('submissionId')
    .populate({
      path: 'submissionId',
      populate: {
        path: 'invitationId',
        populate: {
          path: 'createdBy',
          select: 'firstName lastName organization'
        }
      }
    });
};

reportSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    {
      status: { $ne: 'expired' },
      'access.expiresAt': { $lt: new Date() }
    },
    { status: 'expired' }
  );
};

reportSchema.statics.generateReportCode = function() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  return `MF-TR-${year}-${month}${day}-${random}`;
};

module.exports = mongoose.model('Report', reportSchema);