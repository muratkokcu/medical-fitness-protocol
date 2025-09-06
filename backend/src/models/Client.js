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
  isActive: {
    type: Boolean,
    default: true
  },
  lastAssessment: {
    type: Date
  },
  totalAssessments: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  strict: true
});

clientSchema.index({ fullName: 'text', email: 'text' });
clientSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Client', clientSchema);