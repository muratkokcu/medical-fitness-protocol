const Client = require('../models/Client');
const Assessment = require('../models/Assessment');
const { validationResult } = require('express-validator');

const getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    let query = { organization: req.user.organization, isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const clients = await Client.find(query)
      .sort(sort)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName');

    const total = await Client.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        clients,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      organization: req.user.organization,
      isActive: true
    }).populate('createdBy', 'firstName lastName');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const assessments = await Assessment.find({ 
      client: client._id,
      organization: req.user.organization 
    })
    .populate('practitioner', 'firstName lastName')
    .sort({ assessmentDate: -1 })
    .limit(5);

    res.status(200).json({
      success: true,
      data: {
        client,
        recentAssessments: assessments
      }
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const clientData = {
      ...req.body,
      createdBy: req.user._id,
      organization: req.user.organization
    };

    const client = new Client(clientData);
    await client.save();

    const populatedClient = await Client.findById(client._id)
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: { client: populatedClient }
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const client = await Client.findOneAndUpdate(
      { 
        _id: req.params.id,
        organization: req.user.organization,
        isActive: true
      },
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: { client }
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { 
        _id: req.params.id,
        organization: req.user.organization,
        isActive: true
      },
      { isActive: false },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getClientStats = async (req, res) => {
  try {
    const stats = await Client.aggregate([
      { $match: { organization: req.user.organization, isActive: true } },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          avgAge: { $avg: { $divide: [{ $subtract: [new Date(), '$dateOfBirth'] }, 365 * 24 * 60 * 60 * 1000] } },
          genderDistribution: {
            $push: '$gender'
          }
        }
      }
    ]);

    const recentClients = await Client.find({
      organization: req.user.organization,
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('createdBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: {
        stats: stats[0] || { totalClients: 0, avgAge: 0, genderDistribution: [] },
        recentClients
      }
    });
  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientStats
};