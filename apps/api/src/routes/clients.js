const express = require('express');
const { body } = require('express-validator');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientStats
} = require('../controllers/clientController');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route for client validation (for assessments)
router.get('/public/validate/:id', async (req, res) => {
  // Ensure we always return JSON
  res.setHeader('Content-Type', 'application/json');

  try {
    const { id } = req.params;
    console.log('🔍 Public client validation for ID:', id);

    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('❌ Invalid client ID format:', id);
      return res.status(400).json({
        success: false,
        message: 'Geçersiz müşteri ID formatı'
      });
    }

    const Client = require('../models/Client');
    const client = await Client.findById(id);

    if (!client) {
      console.log('❌ Client not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Müşteri bulunamadı'
      });
    }

    console.log('✅ Client found:', client.fullName);

    res.status(200).json({
      success: true,
      data: {
        client: {
          _id: client._id,
          fullName: client.fullName,
          email: client.email || '',
          phone: client.phone || ''
        }
      }
    });

  } catch (error) {
    console.error('❌ Public client validation error:', error);

    // Always return JSON even on error
    res.status(500).json({
      success: false,
      message: 'Müşteri doğrulanırken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Public route for client assessment submission
router.post('/:id/submit-assessment', async (req, res) => {
  // Ensure we always return JSON
  res.setHeader('Content-Type', 'application/json');

  try {
    const { id: clientId } = req.params;
    console.log('🔄 Client assessment submission started for client:', clientId);

    // 1. Validate client exists
    const Client = require('../models/Client');
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Müşteri bulunamadı'
      });
    }

    console.log('✅ Client validated:', client.fullName);

    // 2. Validate form data
    const formData = req.body;

    if (!formData.name || !formData.gender) {
      return res.status(400).json({
        success: false,
        message: 'Zorunlu alanlar eksik (Ad Soyad, Cinsiyet)'
      });
    }

    console.log('📋 Processing form data for:', formData.name);

    // 3. Process form data and generate assessment results
    const { assessFormData } = require('../core/derive');
    const assessmentResults = assessFormData(formData);

    console.log('🧮 Assessment calculations completed, risk score:', assessmentResults.risk.score);

    // 4. Structure submission data according to schema
    const Submission = require('../models/Submission');
    const submissionData = {
      clientId: client._id, // Link to client instead of invitation

      formData: {
        basicInfo: {
          name: formData.name,
          gender: formData.gender,
          height: parseFloat(formData.height) || 0,
          weight: parseFloat(formData.weight) || 0,
          age: parseInt(formData.age) || 0,
          date: new Date(formData.date || new Date()),
          trainer: formData.trainer || ''
        },

        cardiovascular: {
          systolic: parseInt(formData.systolic) || 0,
          diastolic: parseInt(formData.diastolic) || 0,
          heartRate: parseInt(formData.heart_rate) || 0
        },

        bodyComposition: {
          bodyFat: parseFloat(formData.body_fat) || 0,
          waist: parseFloat(formData.waist) || 0,
          hip: parseFloat(formData.hip) || 0
        },

        respiratory: {
          breathing: formData.breathing || 'normal'
        },

        gaitBalance: {
          leftFoot: formData.left_foot || 'normal',
          rightFoot: formData.right_foot || 'normal',
          balanceLeft: parseInt(formData.balance_left) || 0,
          balanceRight: parseInt(formData.balance_right) || 0
        },

        posture: {
          static: Array.isArray(formData.static_posture) ? formData.static_posture : [formData.static_posture].filter(Boolean),
          dynamicAnterior: Array.isArray(formData.dynamic_anterior) ? formData.dynamic_anterior : [formData.dynamic_anterior].filter(Boolean),
          dynamicLateral: Array.isArray(formData.dynamic_lateral) ? formData.dynamic_lateral : [formData.dynamic_lateral].filter(Boolean),
          dynamicPosterior: Array.isArray(formData.dynamic_posterior) ? formData.dynamic_posterior : [formData.dynamic_posterior].filter(Boolean)
        },

        mobility: {
          shoulderLeft: formData.shoulder_left || 'normal',
          shoulderRight: formData.shoulder_right || 'normal',
          sitReach: parseFloat(formData.sit_reach) || 0
        },

        strength: {
          plankMinutes: parseInt(formData.plank_minutes) || 0,
          plankSeconds: parseInt(formData.plank_seconds) || 0,
          pushupCount: parseInt(formData.pushup_count) || 0,
          wallSitMinutes: parseInt(formData.wallsit_minutes) || 0,
          wallSitSeconds: parseInt(formData.wallsit_seconds) || 0
        }
      },

      // Assessment results from derive.js
      assessmentResults: {
        calculations: {
          bmi: parseFloat(assessmentResults.kpi.bmi?.replace(' kg/m²', '')) || 0,
          waistHipRatio: parseFloat(formData.waist / formData.hip) || 0,
          plankTotalSeconds: (parseInt(formData.plank_minutes) || 0) * 60 + (parseInt(formData.plank_seconds) || 0),
          wallSitTotalSeconds: (parseInt(formData.wallsit_minutes) || 0) * 60 + (parseInt(formData.wallsit_seconds) || 0),
          bloodPressure: `${formData.systolic}/${formData.diastolic}`
        },

        scores: {
          bloodPressureStatus: assessmentResults.cardiovascular.blood_pressure.status,
          heartRateStatus: assessmentResults.cardiovascular.heart_rate.status,
          bodyFatStatus: assessmentResults.body_composition.body_fat.status,
          waistHipStatus: assessmentResults.body_composition.waist_hip_ratio.status,
          bmiStatus: 'ok',
          balanceLeftStatus: 'ok',
          balanceRightStatus: 'ok',
          coreStatus: assessmentResults.strength.core.status,
          pushupStatus: assessmentResults.strength.upper_body.status,
          wallSitStatus: assessmentResults.strength.lower_body.status,
          sitReachStatus: assessmentResults.mobility.trunk.status
        },

        overall: {
          riskScore: assessmentResults.risk.score,
          riskLevel: assessmentResults.risk.label,
          activityLevel: assessmentResults.kpi.activity
        }
      },

      // Generated report data
      reportData: assessmentResults,

      language: formData.language || 'tr'
    };

    // 5. Create submission record
    const submission = new Submission(submissionData);
    await submission.save();

    console.log('💾 Submission saved with ID:', submission._id);

    // 6. Generate access tokens
    await submission.generateAccessTokens();

    console.log('🔐 Access tokens generated');

    // 7. Create report record
    const Report = require('../models/Report');
    const report = new Report({
      submissionId: submission._id,
      reportCode: assessmentResults.code,
      type: 'assessment',
      format: 'pdf',
      generation: {
        requestedAt: new Date(),
        template: 'fitness-report-v1',
        language: submission.language
      },
      access: {
        patientAccess: true,
        practitionerAccess: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      metadata: {
        patientName: formData.name,
        practitionerName: 'Medical Fitness Assessment',
        organization: client.organization || 'Medical Fitness Center',
        assessmentDate: new Date(formData.date),
        riskLevel: assessmentResults.risk.label
      }
    });

    await report.generateTokens();
    await report.markReady({
      pageCount: 1,
      fileSize: 0
    });

    console.log('📊 Report record created with code:', report.reportCode);

    // 8. Log submission in report
    await report.logAccess('generated', 'patient', req, null, 'Client assessment submission completed');

    // 9. Return success response with redirect URL
    const reportUrl = `/report/${submission._id}?access=${submission.accessTokens.read}`;

    console.log('✅ Client assessment submission completed successfully');

    res.status(201).json({
      success: true,
      message: 'Değerlendirme başarıyla gönderildi',
      submissionId: submission._id,
      reportUrl: reportUrl,
      readToken: submission.accessTokens.read,
      reportCode: assessmentResults.code
    });

  } catch (error) {
    console.error('❌ Client assessment submission error:', error);

    // Log error details
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Form verilerinde hata var',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Değerlendirme gönderilirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

const clientValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Full name cannot be more than 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim(),
  body('dateOfBirth')
    .optional()
    .custom((value) => {
      if (!value) return true; // Optional field

      // First check if it's a valid date string
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Please enter a valid date');
      }

      // Check year range (reasonable birth year range)
      const year = date.getFullYear();
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
        throw new Error('Birth year must be between 1900 and current year');
      }

      // Check if the date is not in the future
      if (date > new Date()) {
        throw new Error('Birth date cannot be in the future');
      }

      return true;
    })
    .withMessage('Please enter a valid birth date'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),
  body('occupation')
    .optional()
    .trim()
];

router.use(verifyToken);

router.get('/', getClients);
router.get('/stats', getClientStats);
router.get('/:id', getClient);
router.post('/', clientValidation, createClient);
router.put('/:id', clientValidation, updateClient);
router.delete('/:id', authorize('admin'), deleteClient);

module.exports = router;