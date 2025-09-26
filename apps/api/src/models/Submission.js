const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  // Reference to invitation (optional for backward compatibility)
  invitationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invitation',
    required: false
  },

  // Reference to client (for direct client assessments)
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },

  // Form submission data (exactly matching form.html structure)
  formData: {
    // Basic Information
    basicInfo: {
      name: { type: String, required: true },
      gender: { type: String, enum: ['erkek', 'kadın'], required: true },
      height: { type: Number, required: true }, // cm
      weight: { type: Number, required: true }, // kg
      age: { type: Number, required: true },
      date: { type: Date, required: true },
      trainer: String
    },

    // Cardiovascular Assessment
    cardiovascular: {
      systolic: { type: Number, required: true }, // mmHg
      diastolic: { type: Number, required: true }, // mmHg
      heartRate: { type: Number, required: true } // bpm
    },

    // Body Composition
    bodyComposition: {
      bodyFat: { type: Number, required: true }, // percentage
      waist: { type: Number, required: true }, // cm
      hip: { type: Number, required: true } // cm
    },

    // Respiratory Function
    respiratory: {
      breathing: {
        type: String,
        enum: ['normal', 'disfonksiyon', 'zayif_diyafram', 'apikal'],
        required: true
      }
    },

    // Gait Analysis & Balance
    gaitBalance: {
      leftFoot: {
        type: String,
        enum: ['normal', 'pronation', 'supination'],
        required: true
      },
      rightFoot: {
        type: String,
        enum: ['normal', 'pronation', 'supination'],
        required: true
      },
      balanceLeft: { type: Number, required: true }, // seconds
      balanceRight: { type: Number, required: true } // seconds
    },

    // Posture Assessment
    posture: {
      static: [{
        type: String,
        enum: ['upper_crossed', 'lower_crossed', 'x_legs', 'other']
      }],
      dynamicAnterior: [{
        type: String,
        enum: ['normal_alignment', 'knee_valgus', 'knee_varus', 'ankle_pronation', 'asymmetric_stance']
      }],
      dynamicLateral: [{
        type: String,
        enum: ['normal_pattern', 'forward_head', 'excessive_forward_lean', 'excessive_backward_lean', 'lumbar_extension_loss', 'hip_flexion_limitation']
      }],
      dynamicPosterior: [{
        type: String,
        enum: ['normal_alignment', 'hip_shift_left', 'hip_shift_right', 'shoulder_asymmetry', 'early_heel_rise', 'pelvic_tilt']
      }]
    },

    // Mobility Assessment
    mobility: {
      shoulderLeft: {
        type: String,
        enum: ['iyi', 'normal', 'riskli'],
        required: true
      },
      shoulderRight: {
        type: String,
        enum: ['iyi', 'normal', 'riskli'],
        required: true
      },
      sitReach: { type: Number, required: true } // cm
    },

    // Strength Assessment
    strength: {
      plankMinutes: { type: Number, required: true },
      plankSeconds: { type: Number, required: true },
      pushupCount: { type: Number, required: true },
      wallSitMinutes: { type: Number, required: true },
      wallSitSeconds: { type: Number, required: true }
    }
  },

  // Calculated Assessment Results
  assessmentResults: {
    // Derived calculations
    calculations: {
      bmi: Number,
      waistHipRatio: Number,
      plankTotalSeconds: Number,
      wallSitTotalSeconds: Number,
      bloodPressure: String // "120/80"
    },

    // Assessment scores
    scores: {
      bloodPressureStatus: { type: String, enum: ['ok', 'warn', 'risk'] },
      heartRateStatus: { type: String, enum: ['ok', 'warn', 'risk'] },
      bodyFatStatus: { type: String, enum: ['ok', 'warn', 'risk'] },
      waistHipStatus: { type: String, enum: ['ok', 'warn', 'risk'] },
      bmiStatus: { type: String, enum: ['ok', 'warn', 'risk'] },
      balanceLeftStatus: { type: String, enum: ['ok', 'warn', 'risk'] },
      balanceRightStatus: { type: String, enum: ['ok', 'warn', 'risk'] },
      coreStatus: { type: String, enum: ['ok', 'warn', 'risk'] },
      pushupStatus: { type: String, enum: ['ok', 'warn', 'risk'] },
      wallSitStatus: { type: String, enum: ['ok', 'warn', 'risk'] },
      sitReachStatus: { type: String, enum: ['ok', 'warn', 'risk'] }
    },

    // Overall risk assessment
    overall: {
      riskScore: Number, // 0-100
      riskLevel: { type: String, enum: ['Düşük', 'Orta', 'Orta-Yüksek', 'Yüksek'] },
      activityLevel: { type: String, enum: ['Düşük', 'Orta', 'Yüksek'] }
    }
  },

  // Generated Report Data
  reportData: {
    person: {
      name: String,
      birthYear: Number,
      company: String,
      date: String,
      duration: String,
      level: String,
      priority: String
    },

    kpi: {
      hr: String,
      bp: String,
      bmi: String,
      activity: String
    },

    findings: [{
      color: String,
      text: String
    }],

    actions: [{
      text: String,
      done: Boolean
    }],

    lifestyle: [{
      color: String,
      text: String
    }],

    metrics: [{
      k: String, // key
      v: String, // value
      range: String,
      status: String
    }],

    notes: String,

    // Dynamic sections
    priorityAreas: [{
      color: String,
      text: String
    }],

    gaitAnalysis: [{
      side: String,
      status: String,
      note: String
    }],

    balanceTests: [{
      side: String,
      time: String,
      status: String
    }],

    postureAnalysis: [{
      plane: String,
      observation: String
    }],

    upperBodyTests: [{
      test: String,
      score: Number,
      evaluation: String
    }],

    lowerBodyTests: [{
      test: String,
      time: String,
      evaluation: String
    }],

    code: String // Report reference code
  },

  // Language and metadata
  language: {
    type: String,
    enum: ['tr', 'en'],
    default: 'tr'
  },

  // Access tokens for report viewing
  accessTokens: {
    read: String, // For patient to view report
    admin: String // For practitioner access
  },

  // Status and tracking
  status: {
    type: String,
    enum: ['submitted', 'processed', 'error'],
    default: 'submitted'
  },

  processingLog: [{
    timestamp: { type: Date, default: Date.now },
    action: String,
    details: String,
    error: String
  }]
}, {
  timestamps: true
});

// Custom validation to ensure clientId is provided
submissionSchema.pre('validate', function(next) {
  if (!this.clientId) {
    next(new Error('clientId is required'));
  } else {
    next();
  }
});

// Indexes
submissionSchema.index({ invitationId: 1 });
submissionSchema.index({ clientId: 1 });
submissionSchema.index({ 'accessTokens.read': 1 });
submissionSchema.index({ 'accessTokens.admin': 1 });
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ 'formData.basicInfo.name': 'text' });

// Virtual for full name
submissionSchema.virtual('patientName').get(function() {
  return this.formData?.basicInfo?.name || 'Unknown';
});

// Instance methods
submissionSchema.methods.generateAccessTokens = function() {
  const crypto = require('crypto');
  this.accessTokens = {
    read: crypto.randomBytes(32).toString('hex'),
    admin: crypto.randomBytes(32).toString('hex')
  };
  return this.save();
};

submissionSchema.methods.addLog = function(action, details, error = null) {
  this.processingLog.push({
    action,
    details,
    error
  });
  return this.save();
};

// Static methods
submissionSchema.statics.findByReadToken = function(token) {
  return this.findOne({ 'accessTokens.read': token })
    .populate('invitationId', 'createdBy organization')
    .populate({
      path: 'invitationId',
      populate: {
        path: 'createdBy',
        select: 'firstName lastName organization'
      }
    });
};

submissionSchema.statics.findByAdminToken = function(token) {
  return this.findOne({ 'accessTokens.admin': token })
    .populate('invitationId', 'createdBy organization')
    .populate('clientId', 'fullName email organization')
    .populate({
      path: 'invitationId',
      populate: {
        path: 'createdBy',
        select: 'firstName lastName organization'
      }
    });
};

// Hook to update client assessment summary when submission is saved
submissionSchema.post('save', async function(doc) {
  try {
    const Client = require('./Client');
    const client = await Client.findById(doc.clientId);

    if (client && doc.assessmentResults && doc.assessmentResults.overall) {
      await client.addAssessment({
        submissionId: doc._id,
        date: doc.createdAt,
        riskLevel: doc.assessmentResults.overall.riskLevel,
        riskScore: doc.assessmentResults.overall.riskScore,
        reportId: doc.reportData?.code,
        readToken: doc.accessTokens?.read
      });
    }
  } catch (error) {
    console.error('Error updating client assessment summary:', error);
  }
});

module.exports = mongoose.model('Submission', submissionSchema);