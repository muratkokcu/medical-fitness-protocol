const express = require('express');
const router = express.Router();
const { validateReportAccess } = require('../core/tokens');
const Submission = require('../models/Submission');
const Report = require('../models/Report');

// GET /api/reports/:id - Get report data for viewing
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { access } = req.query;

    console.log('📊 Report data request for ID:', id);

    if (!access) {
      return res.status(401).json({
        success: false,
        message: 'Erişim anahtarı gerekli'
      });
    }

    // Validate access token and get submission
    let submission;
    try {
      submission = await validateReportAccess(id, access, 'read');
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message || 'Geçersiz erişim anahtarı'
      });
    }

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Rapor bulunamadı'
      });
    }

    console.log('✅ Access validated for submission:', submission._id);

    // Prepare metadata
    const metadata = {
      language: submission.language,
      submissionId: submission._id,
      generatedAt: submission.createdAt,
      practitioner: {
        name: `${submission.invitationId.createdBy.firstName} ${submission.invitationId.createdBy.lastName}`,
        organization: submission.invitationId.organization
      }
    };

    // Log access
    const report = await Report.findOne({ submissionId: submission._id });
    if (report) {
      await report.logAccess('viewed', 'patient', req, null, 'Report viewed online');
    }

    res.json({
      success: true,
      reportData: submission.reportData,
      metadata
    });

  } catch (error) {
    console.error('❌ Report fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor yüklenirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/reports/pdf - Generate and download PDF report
router.get('/pdf', async (req, res) => {
  try {
    const { submissionId, access } = req.query;

    console.log('📄 PDF generation request for submission:', submissionId);

    if (!submissionId || !access) {
      return res.status(400).json({
        success: false,
        message: 'Submission ID ve erişim anahtarı gerekli'
      });
    }

    // Validate access
    let submission;
    try {
      submission = await validateReportAccess(submissionId, access, 'read');
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message || 'Geçersiz erişim anahtarı'
      });
    }

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Rapor bulunamadı'
      });
    }

    console.log('✅ PDF access validated for submission:', submission._id);

    // Generate PDF (placeholder implementation)
    // TODO: Implement actual PDF generation using fitness-report.html template
    const pdf = await generatePDF(submission.reportData, submission.language);

    // Log download
    const report = await Report.findOne({ submissionId: submission._id });
    if (report) {
      await report.logAccess('downloaded', 'patient', req, null, 'PDF downloaded');
    }

    // Set response headers for PDF download
    const filename = `medical-fitness-report-${submission.reportData.code || 'report'}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Send PDF
    if (pdf && pdf.pipe) {
      pdf.pipe(res);
    } else {
      // Fallback: send buffer if pipe not available
      res.send(pdf);
    }

    console.log('📄 PDF sent successfully:', filename);

  } catch (error) {
    console.error('❌ PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'PDF oluşturulurken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/reports/admin/:id - Get report with admin access
router.get('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { access } = req.query;

    console.log('👨‍⚕️ Admin report access for ID:', id);

    if (!access) {
      return res.status(401).json({
        success: false,
        message: 'Admin erişim anahtarı gerekli'
      });
    }

    // Validate admin access
    let submission;
    try {
      submission = await validateReportAccess(id, access, 'admin');
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message || 'Geçersiz admin erişim anahtarı'
      });
    }

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Rapor bulunamadı'
      });
    }

    console.log('✅ Admin access validated for submission:', submission._id);

    // Include additional admin data
    const adminMetadata = {
      language: submission.language,
      submissionId: submission._id,
      generatedAt: submission.createdAt,
      updatedAt: submission.updatedAt,
      practitioner: {
        name: `${submission.invitationId.createdBy.firstName} ${submission.invitationId.createdBy.lastName}`,
        organization: submission.invitationId.organization,
        email: submission.invitationId.createdBy.email
      },
      invitation: {
        id: submission.invitationId._id,
        token: submission.invitationId.token,
        createdAt: submission.invitationId.createdAt
      },
      processing: {
        status: submission.status,
        log: submission.processingLog
      }
    };

    // Log admin access
    const report = await Report.findOne({ submissionId: submission._id });
    if (report) {
      await report.logAccess('viewed', 'admin', req, null, 'Report viewed by admin');
    }

    res.json({
      success: true,
      reportData: submission.reportData,
      formData: submission.formData,
      assessmentResults: submission.assessmentResults,
      metadata: adminMetadata
    });

  } catch (error) {
    console.error('❌ Admin report fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor yüklenirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/reports/:id/regenerate - Regenerate report (admin only)
router.post('/:id/regenerate', async (req, res) => {
  try {
    const { id } = req.params;
    const { access } = req.body;

    console.log('🔄 Report regeneration request for ID:', id);

    if (!access) {
      return res.status(401).json({
        success: false,
        message: 'Admin erişim anahtarı gerekli'
      });
    }

    // Validate admin access
    let submission;
    try {
      submission = await validateReportAccess(id, access, 'admin');
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message || 'Geçersiz admin erişim anahtarı'
      });
    }

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Rapor bulunamadı'
      });
    }

    console.log('🔄 Regenerating report for submission:', submission._id);

    // Regenerate assessment results
    const { assessFormData } = require('../core/derive');

    // Reconstruct form data for regeneration
    const formData = {
      // Basic info
      name: submission.formData.basicInfo.name,
      gender: submission.formData.basicInfo.gender,
      height: submission.formData.basicInfo.height,
      weight: submission.formData.basicInfo.weight,
      age: submission.formData.basicInfo.age,
      date: submission.formData.basicInfo.date,
      trainer: submission.formData.basicInfo.trainer,

      // Cardiovascular
      systolic: submission.formData.cardiovascular.systolic,
      diastolic: submission.formData.cardiovascular.diastolic,
      heart_rate: submission.formData.cardiovascular.heartRate,

      // Body composition
      body_fat: submission.formData.bodyComposition.bodyFat,
      waist: submission.formData.bodyComposition.waist,
      hip: submission.formData.bodyComposition.hip,

      // Respiratory
      breathing: submission.formData.respiratory.breathing,

      // Gait & Balance
      left_foot: submission.formData.gaitBalance.leftFoot,
      right_foot: submission.formData.gaitBalance.rightFoot,
      balance_left: submission.formData.gaitBalance.balanceLeft,
      balance_right: submission.formData.gaitBalance.balanceRight,

      // Posture
      static_posture: submission.formData.posture.static,
      dynamic_anterior: submission.formData.posture.dynamicAnterior,
      dynamic_lateral: submission.formData.posture.dynamicLateral,
      dynamic_posterior: submission.formData.posture.dynamicPosterior,

      // Mobility
      shoulder_left: submission.formData.mobility.shoulderLeft,
      shoulder_right: submission.formData.mobility.shoulderRight,
      sit_reach: submission.formData.mobility.sitReach,

      // Strength
      plank_minutes: submission.formData.strength.plankMinutes,
      plank_seconds: submission.formData.strength.plankSeconds,
      pushup_count: submission.formData.strength.pushupCount,
      wallsit_minutes: submission.formData.strength.wallSitMinutes,
      wallsit_seconds: submission.formData.strength.wallSitSeconds
    };

    // Regenerate assessment
    const newAssessmentResults = assessFormData(formData);

    // Update submission
    submission.reportData = newAssessmentResults;
    submission.assessmentResults.overall.riskScore = newAssessmentResults.risk.score;
    submission.assessmentResults.overall.riskLevel = newAssessmentResults.risk.label;

    await submission.addLog('regenerated', 'Report regenerated by admin', null);
    await submission.save();

    console.log('✅ Report regenerated successfully');

    res.json({
      success: true,
      message: 'Rapor başarıyla yeniden oluşturuldu',
      reportData: newAssessmentResults
    });

  } catch (error) {
    console.error('❌ Report regeneration error:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor yeniden oluşturulurken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/reports/list/:organizationId - List reports for organization (admin only)
router.get('/list/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { access, page = 1, limit = 20 } = req.query;

    console.log('📋 Report list request for organization:', organizationId);

    // TODO: Add proper admin authentication here
    // For now, this is a placeholder that would need proper admin validation

    const skip = (page - 1) * limit;

    // Get submissions for organization
    const submissions = await Submission.find()
      .populate({
        path: 'invitationId',
        match: { organization: organizationId },
        populate: {
          path: 'createdBy',
          select: 'firstName lastName email'
        }
      })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    // Filter out submissions where invitation didn't match organization
    const validSubmissions = submissions.filter(s => s.invitationId);

    const reports = validSubmissions.map(submission => ({
      id: submission._id,
      code: submission.reportData?.code,
      patientName: submission.formData?.basicInfo?.name,
      practitioner: `${submission.invitationId.createdBy.firstName} ${submission.invitationId.createdBy.lastName}`,
      riskLevel: submission.assessmentResults?.overall?.riskLevel,
      riskScore: submission.assessmentResults?.overall?.riskScore,
      createdAt: submission.createdAt,
      status: submission.status,
      language: submission.language
    }));

    const total = await Submission.countDocuments({
      invitationId: { $in: await Invitation.find({ organization: organizationId }).distinct('_id') }
    });

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Report list error:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor listesi yüklenirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Placeholder PDF generation function
async function generatePDF(reportData, language = 'tr') {
  // TODO: Implement actual PDF generation using puppeteer or similar
  // This would render the fitness-report.html template with the data

  console.log('📄 PDF generation placeholder called');

  // For now, return a simple placeholder
  const PDFDocument = require('pdfkit'); // You'll need to install this
  const doc = new PDFDocument();

  // Add content
  doc.fontSize(20).text('Medical Fitness Report', 100, 100);
  doc.fontSize(14).text(`Patient: ${reportData.person?.name || 'Unknown'}`, 100, 150);
  doc.fontSize(14).text(`Risk Score: ${reportData.risk?.score || 'N/A'}`, 100, 180);
  doc.fontSize(14).text(`Report Code: ${reportData.code || 'N/A'}`, 100, 210);

  doc.end();

  return doc;
}

module.exports = router;