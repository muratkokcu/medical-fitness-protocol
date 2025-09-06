const Assessment = require('../models/Assessment');
const Client = require('../models/Client');
const { validationResult } = require('express-validator');

const getAssessments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, clientId, sortBy = 'assessmentDate', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    let query = { organization: req.user.organization };
    
    if (status) {
      query.status = status;
    }
    
    if (clientId) {
      query.client = clientId;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const assessments = await Assessment.find(query)
      .populate('client', 'fullName email phone')
      .populate('practitioner', 'firstName lastName')
      .sort(sort)
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Assessment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        assessments,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      organization: req.user.organization
    })
    .populate('client')
    .populate('practitioner', 'firstName lastName');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { assessment }
    });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createAssessment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const client = await Client.findById(req.body.clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const assessmentData = {
      ...req.body,
      client: client._id,
      practitioner: req.user._id,
      organization: req.user.organization
    };

    delete assessmentData.clientId;

    const assessment = new Assessment(assessmentData);
    await assessment.save();

    await Client.findByIdAndUpdate(client._id, {
      lastAssessment: assessment.assessmentDate,
      $inc: { totalAssessments: 1 }
    });

    const populatedAssessment = await Assessment.findById(assessment._id)
      .populate('client', 'fullName email')
      .populate('practitioner', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: { assessment: populatedAssessment }
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateAssessment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const assessment = await Assessment.findOneAndUpdate(
      { 
        _id: req.params.id,
        organization: req.user.organization
      },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('client', 'fullName email')
    .populate('practitioner', 'firstName lastName');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assessment updated successfully',
      data: { assessment }
    });
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOneAndDelete({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    await Client.findByIdAndUpdate(assessment.client, {
      $inc: { totalAssessments: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getAssessmentStats = async (req, res) => {
  try {
    const stats = await Assessment.aggregate([
      { $match: { organization: req.user.organization } },
      {
        $group: {
          _id: null,
          totalAssessments: { $sum: 1 },
          completedAssessments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgressAssessments: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          draftAssessments: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          }
        }
      }
    ]);

    const recentAssessments = await Assessment.find({
      organization: req.user.organization
    })
    .populate('client', 'fullName')
    .populate('practitioner', 'firstName lastName')
    .sort({ assessmentDate: -1 })
    .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: stats[0] || { 
          totalAssessments: 0, 
          completedAssessments: 0, 
          inProgressAssessments: 0, 
          draftAssessments: 0 
        },
        recentAssessments
      }
    });
  } catch (error) {
    console.error('Get assessment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAssessments,
  getAssessment,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentStats
};