const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  practitioner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed', 'reviewed'],
    default: 'draft'
  },
  
  // Personal Information
  personalInfo: {
    age: Number,
    height: Number,
    weight: Number,
    trainer: String
  },

  // Vital Signs
  vitalSigns: {
    systolicBP: Number,
    diastolicBP: Number,
    restingHR: Number,
    bodyTemperature: Number
  },

  // Body Composition
  bodyComposition: {
    bodyFatPercentage: Number,
    muscleMass: Number,
    visceralFat: Number,
    waistCircumference: Number,
    hipCircumference: Number
  },

  // Respiratory
  respiratory: {
    respiratoryRate: Number,
    peakFlowRate: Number,
    breathHoldTime: Number,
    chestExpansion: Number,
    respiratoryDysfunction: {
      type: String,
      enum: ['normal', 'dysfunction', 'weak_diaphragm', 'apical']
    }
  },

  // Biomechanical Assessment
  biomechanical: {
    shoulderFlexion: Number,
    shoulderExtension: Number,
    spinalRotation: Number,
    hipFlexibility: Number,
    ankleFlexibility: Number
  },

  // Balance and Coordination
  balance: {
    staticBalance: Number,
    dynamicBalance: Number,
    coordinationTest: Number,
    singleLegBalance: {
      kneeRotation: Boolean,
      hipShift: Boolean,
      trunkRotation: Boolean
    }
  },

  // Mobility Tests
  mobility: {
    shoulderMobility: {
      left: Number,
      right: Number
    },
    trunkFlexibility: {
      forward: Number,
      backward: Number
    },
    sitReachTime: Number
  },

  // Posture Assessment
  posture: {
    static: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    dynamic: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    details: {
      anterior: String,
      lateral: String,
      posterior: String
    },
    conditions: {
      forwardHeadPosture: {
        type: String,
        enum: ['none', 'mild', 'moderate', 'severe']
      },
      roundedShoulders: {
        type: String,
        enum: ['none', 'mild', 'moderate', 'severe']
      },
      kyphosis: {
        type: String,
        enum: ['none', 'mild', 'moderate', 'severe']
      },
      lordosis: {
        type: String,
        enum: ['none', 'mild', 'moderate', 'severe']
      },
      scoliosis: {
        type: String,
        enum: ['none', 'mild', 'moderate', 'severe']
      },
      pelvicTilt: {
        type: String,
        enum: ['none', 'mild', 'moderate', 'severe']
      }
    },
    syndromes: {
      upperCrossed: Boolean,
      lowerCrossed: Boolean,
      xLegs: Boolean,
      other: String
    }
  },

  // Walking & Foot Strike Analysis
  gaitAnalysis: {
    footStrike: {
      left: Number,
      right: Number,
      type: {
        type: String,
        enum: ['normal', 'pronation', 'supination']
      }
    }
  },

  // Dynamic Posture (Overhead Squat)
  dynamicPosture: {
    overheadSquat: {
      left: String,
      right: String
    }
  },

  // Strength Tests
  strengthTests: {
    pushUps: Number,
    plankTime: Number,
    squats: Number,
    wallSitTime: Number
  },

  // Clinical Assessment
  clinicalAssessment: {
    overallRisk: {
      type: String,
      enum: ['low', 'moderate', 'high']
    },
    fitnessLevel: {
      type: String,
      enum: ['excellent', 'good', 'average', 'poor']
    },
    recommendations: String,
    clinicalExamination: Boolean,
    rehabilitationArea: Boolean,
    medicalFitnessExpert: String,
    personalTraining: Boolean,
    fitnessGroupActivities: Boolean,
    instructor: String,
    overallResult: String
  },

  // Calculated Results
  results: {
    bmi: {
      value: Number,
      category: String
    },
    bloodPressure: {
      value: String,
      category: String
    },
    whr: {
      value: Number,
      category: String
    }
  },

  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },

  organization: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

assessmentSchema.index({ client: 1, assessmentDate: -1 });
assessmentSchema.index({ practitioner: 1, assessmentDate: -1 });
assessmentSchema.index({ organization: 1, assessmentDate: -1 });
assessmentSchema.index({ status: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);