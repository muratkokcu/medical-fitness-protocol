const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: false
  },
  occupation: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true,
    required: false
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  medicalHistory: {
    allergies: [String],
    medications: [String],
    conditions: [String],
    notes: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Assessment-related fields for quick access
  assessmentSummary: {
    totalAssessments: {
      type: Number,
      default: 0
    },
    lastAssessmentDate: {
      type: Date
    },
    lastRiskLevel: {
      type: String,
      enum: ['Düşük', 'Orta', 'Orta-Yüksek', 'Yüksek']
    },
    lastRiskScore: {
      type: Number
    },
    assessmentHistory: [{
      submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission'
      },
      date: Date,
      riskLevel: {
        type: String,
        enum: ['Düşük', 'Orta', 'Orta-Yüksek', 'Yüksek']
      },
      riskScore: Number,
      reportId: String,
      readToken: String
    }]
  }
}, {
  timestamps: true,
  strict: true
});

clientSchema.index({ fullName: 'text', email: 'text' });
clientSchema.index({ createdBy: 1, createdAt: -1 });
clientSchema.index({ organization: 1, createdAt: -1 });
clientSchema.index({ 'assessmentSummary.lastAssessmentDate': -1 });
clientSchema.index({ 'assessmentSummary.totalAssessments': -1 });

// Instance methods for assessment management
clientSchema.methods.addAssessment = function(submissionData) {
  if (!this.assessmentSummary) {
    this.assessmentSummary = {
      totalAssessments: 0,
      assessmentHistory: []
    };
  }

  this.assessmentSummary.totalAssessments += 1;
  this.assessmentSummary.lastAssessmentDate = submissionData.date || new Date();
  this.assessmentSummary.lastRiskLevel = submissionData.riskLevel;
  this.assessmentSummary.lastRiskScore = submissionData.riskScore;

  this.assessmentSummary.assessmentHistory.push({
    submissionId: submissionData.submissionId,
    date: submissionData.date || new Date(),
    riskLevel: submissionData.riskLevel,
    riskScore: submissionData.riskScore,
    reportId: submissionData.reportId,
    readToken: submissionData.readToken
  });

  // Keep only the last 10 assessments in history for performance
  if (this.assessmentSummary.assessmentHistory.length > 10) {
    this.assessmentSummary.assessmentHistory = this.assessmentSummary.assessmentHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }

  return this.save();
};

clientSchema.methods.getLatestAssessment = function() {
  if (!this.assessmentSummary || !this.assessmentSummary.assessmentHistory.length) {
    return null;
  }

  return this.assessmentSummary.assessmentHistory
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
};

module.exports = mongoose.model('Client', clientSchema);