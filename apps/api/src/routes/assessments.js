const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken, authorize } = require('../middleware/auth');
const { assessFormData } = require('../services/assessmentEngine');
const Submission = require('../models/Submission');
const Report = require('../models/Report');
const { generateReportCode, generateReadToken, generateAdminToken } = require('../core/tokens');

const router = express.Router();

/**
 * POST /api/assessments
 * Create a new assessment submission
 */
router.post('/',
  [
    // Validation rules
    body('clientId').isMongoId().withMessage('Valid client ID is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('gender').isIn(['erkek', 'kadın']).withMessage('Valid gender is required'),
    body('age').isInt({ min: 16, max: 100 }).withMessage('Age must be between 16 and 100'),
    body('height').isFloat({ min: 100, max: 250 }).withMessage('Height must be between 100 and 250 cm'),
    body('weight').isFloat({ min: 30, max: 200 }).withMessage('Weight must be between 30 and 200 kg'),
    body('systolic').isInt({ min: 80, max: 250 }).withMessage('Systolic pressure must be between 80 and 250'),
    body('diastolic').isInt({ min: 40, max: 150 }).withMessage('Diastolic pressure must be between 40 and 150'),
    body('heart_rate').isInt({ min: 40, max: 200 }).withMessage('Heart rate must be between 40 and 200'),
    body('body_fat').isFloat({ min: 5, max: 50 }).withMessage('Body fat must be between 5% and 50%'),
    body('waist').isFloat({ min: 50, max: 150 }).withMessage('Waist circumference must be between 50 and 150 cm'),
    body('hip').isFloat({ min: 60, max: 180 }).withMessage('Hip circumference must be between 60 and 180 cm'),
    body('breathing').isIn(['normal', 'disfonksiyon', 'zayif_diyafram', 'apikal']).withMessage('Valid breathing pattern is required'),
    body('left_foot').isIn(['normal', 'pronation', 'supination']).withMessage('Valid left foot assessment is required'),
    body('right_foot').isIn(['normal', 'pronation', 'supination']).withMessage('Valid right foot assessment is required'),
    body('balance_left').isInt({ min: 0, max: 300 }).withMessage('Left balance time must be between 0 and 300 seconds'),
    body('balance_right').isInt({ min: 0, max: 300 }).withMessage('Right balance time must be between 0 and 300 seconds'),
    body('shoulder_left').isIn(['iyi', 'normal', 'riskli']).withMessage('Valid left shoulder assessment is required'),
    body('shoulder_right').isIn(['iyi', 'normal', 'riskli']).withMessage('Valid right shoulder assessment is required'),
    body('sit_reach').isFloat({ min: -20, max: 50 }).withMessage('Sit & reach must be between -20 and 50 cm')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Process assessment data
      const assessmentResult = assessFormData(req.body);

      // Verify client exists
      const Client = require('../models/Client');
      const client = await Client.findById(req.body.clientId);
      if (!client) {
        return res.status(404).json({
          error: 'Client not found',
          message: 'The specified client does not exist'
        });
      }

      // Create submission record with new schema structure
      const submission = new Submission({
        clientId: req.body.clientId,
        formData: {
          basicInfo: {
            name: req.body.name,
            gender: req.body.gender,
            age: parseInt(req.body.age),
            height: parseFloat(req.body.height),
            weight: parseFloat(req.body.weight),
            date: req.body.date ? new Date(req.body.date) : new Date(),
            trainer: req.body.trainer || 'Self-Assessment'
          },
          cardiovascular: {
            systolic: parseInt(req.body.systolic),
            diastolic: parseInt(req.body.diastolic),
            heartRate: parseInt(req.body.heart_rate)
          },
          bodyComposition: {
            bodyFat: parseFloat(req.body.body_fat),
            waist: parseFloat(req.body.waist),
            hip: parseFloat(req.body.hip)
          },
          respiratory: {
            breathing: req.body.breathing
          },
          gaitBalance: {
            leftFoot: req.body.left_foot,
            rightFoot: req.body.right_foot,
            balanceLeft: parseInt(req.body.balance_left),
            balanceRight: parseInt(req.body.balance_right)
          },
          mobility: {
            shoulderLeft: req.body.shoulder_left,
            shoulderRight: req.body.shoulder_right,
            sitReach: parseFloat(req.body.sit_reach)
          },
          strength: {
            plankMinutes: Math.floor((assessmentResult.derivedData.plank_total_seconds || 0) / 60),
            plankSeconds: (assessmentResult.derivedData.plank_total_seconds || 0) % 60,
            pushupCount: parseInt(req.body.pushup_count || 0),
            wallSitMinutes: Math.floor((assessmentResult.derivedData.wallsit_total_seconds || 0) / 60),
            wallSitSeconds: (assessmentResult.derivedData.wallsit_total_seconds || 0) % 60
          }
        },
        assessmentResults: {
          calculations: {
            bmi: parseFloat(assessmentResult.derivedData.bmi),
            waistHipRatio: parseFloat(assessmentResult.derivedData.waist_hip_ratio),
            plankTotalSeconds: assessmentResult.derivedData.plank_total_seconds || 0,
            wallSitTotalSeconds: assessmentResult.derivedData.wallsit_total_seconds || 0,
            bloodPressure: `${req.body.systolic}/${req.body.diastolic}`
          },
          overall: {
            riskScore: assessmentResult.riskScore,
            riskLevel: assessmentResult.riskLabel,
            activityLevel: assessmentResult.activityLevel || 'Orta'
          }
        },
        accessTokens: {
          read: generateReadToken(),
          admin: generateAdminToken()
        },
        status: 'processed'
      });

      await submission.save();

      // Create report record
      const reportCode = generateReportCode();
      const report = new Report({
        submissionId: submission._id,
        code: reportCode,
        data: assessmentResult,
        readToken: submission.accessTokens.read,
        adminToken: submission.accessTokens.admin,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      await report.save();

      // Update submission with report data
      submission.reportData = {
        code: reportCode,
        person: {
          name: req.body.name,
          company: client.company || client.organization,
          date: new Date().toLocaleDateString('tr-TR'),
          level: assessmentResult.riskLabel,
          priority: assessmentResult.riskScore > 70 ? 'Yüksek' : assessmentResult.riskScore > 40 ? 'Orta' : 'Düşük'
        }
      };

      await submission.save();

      res.status(201).json({
        success: true,
        submissionId: submission._id,
        reportId: report._id,
        reportCode: report.code,
        readToken: submission.accessTokens.read,
        adminToken: submission.accessTokens.admin,
        riskScore: assessmentResult.riskScore,
        riskLevel: assessmentResult.riskLabel,
        reportUrl: `/report/${report._id}?token=${submission.accessTokens.read}`,
        clientId: client._id,
        clientName: client.fullName
      });

    } catch (error) {
      console.error('Assessment creation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process assessment'
      });
    }
  }
);

/**
 * GET /api/assessments/:id
 * Get assessment by ID (admin only)
 */
router.get('/:id',
  verifyToken,
  authorize(['admin', 'trainer']),
  async (req, res) => {
    try {
      const submission = await Submission.findById(req.params.id);

      if (!submission) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      res.json({
        success: true,
        data: submission
      });

    } catch (error) {
      console.error('Assessment retrieval error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve assessment'
      });
    }
  }
);

/**
 * GET /api/assessments
 * List assessments (admin only)
 */
router.get('/',
  verifyToken,
  authorize(['admin', 'trainer']),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const submissions = await Submission.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-readToken -adminToken'); // Exclude sensitive tokens from list

      const total = await Submission.countDocuments();

      res.json({
        success: true,
        data: submissions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Assessment list error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve assessments'
      });
    }
  }
);

/**
 * DELETE /api/assessments/:id
 * Delete assessment (admin only)
 */
router.delete('/:id',
  verifyToken,
  authorize(['admin']),
  async (req, res) => {
    try {
      const submission = await Submission.findById(req.params.id);

      if (!submission) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      // Delete associated report
      await Report.deleteMany({ submissionId: submission._id });

      // Delete submission
      await Submission.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Assessment deleted successfully'
      });

    } catch (error) {
      console.error('Assessment deletion error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete assessment'
      });
    }
  }
);

/**
 * GET /api/assessments/client/:clientId
 * Get all assessments for a specific client
 */
router.get('/client/:clientId',
  verifyToken,
  authorize(['admin', 'trainer']),
  async (req, res) => {
    try {
      const { clientId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Verify client exists
      const Client = require('../models/Client');
      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      const submissions = await Submission.find({ clientId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('clientId', 'fullName email')
        .select('-accessTokens.admin'); // Exclude sensitive admin tokens

      const total = await Submission.countDocuments({ clientId });

      res.json({
        success: true,
        data: {
          assessments: submissions,
          client: {
            _id: client._id,
            fullName: client.fullName,
            email: client.email
          }
        },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Client assessments retrieval error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve client assessments'
      });
    }
  }
);

/**
 * GET /api/assessments/client/:clientId/latest
 * Get the latest assessment for a specific client
 */
router.get('/client/:clientId/latest',
  verifyToken,
  authorize(['admin', 'trainer']),
  async (req, res) => {
    try {
      const { clientId } = req.params;

      // Verify client exists
      const Client = require('../models/Client');
      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      const latestAssessment = await Submission.findOne({ clientId })
        .sort({ createdAt: -1 })
        .populate('clientId', 'fullName email')
        .select('-accessTokens.admin');

      if (!latestAssessment) {
        return res.status(404).json({
          error: 'No assessments found',
          message: 'This client has no assessments yet'
        });
      }

      res.json({
        success: true,
        data: {
          assessment: latestAssessment,
          client: {
            _id: client._id,
            fullName: client.fullName,
            email: client.email
          }
        }
      });

    } catch (error) {
      console.error('Latest assessment retrieval error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve latest assessment'
      });
    }
  }
);

module.exports = router;