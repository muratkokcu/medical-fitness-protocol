const Client = require('../models/Client');
const { validationResult } = require('express-validator');

const getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    let query = { organization: req.user.organization };
    
    if (search) {
      // Create flexible regex search for partial matches
      const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive
      query.$or = [
        { fullName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { phone: { $regex: searchRegex } },
        { company: { $regex: searchRegex } }
      ];
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
    console.log('🔍 Starting client retrieval...');
    console.log('👤 User context:', {
      userId: req.user._id,
      userEmail: req.user.email,
      userOrganization: req.user.organization,
      userRole: req.user.role
    });
    console.log('📋 Request params:', {
      clientId: req.params.id
    });
    console.log('🔍 Query criteria: Will search for client with ID', req.params.id, 'in organization', req.user.organization);

    console.log('🔎 Searching for client...');
    const client = await Client.findOne({
      _id: req.params.id,
      organization: req.user.organization
    }).populate('createdBy', 'firstName lastName');

    if (!client) {
      console.log('❌ Client not found with criteria:', {
        clientId: req.params.id,
        organization: req.user.organization
      });
      return res.status(404).json({
        success: false,
        message: 'Client not found or you do not have access to this client'
      });
    }

    console.log('✅ Client found:', {
      clientId: client._id,
      clientName: client.fullName,
      clientCompany: client.company,
      clientOrganization: client.organization,
      createdBy: client.createdBy._id,
      organizationMatch: client.organization === req.user.organization
    });

    console.log('✅ Client retrieval completed successfully');
    res.status(200).json({
      success: true,
      data: {
        client
      }
    });
  } catch (error) {
    console.error('❌ Get client error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const createClient = async (req, res) => {
  try {
    console.log('🔄 Starting client creation...');
    console.log('👤 User context:', {
      userId: req.user._id,
      userEmail: req.user.email,
      userOrganization: req.user.organization,
      userRole: req.user.role
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Sanitize and prepare client data
    const clientData = {
      ...req.body,
      createdBy: req.user._id,
      organization: req.user.organization
    };

    // Sanitize dateOfBirth if provided
    if (req.body.dateOfBirth) {
      try {
        // Handle common date format issues
        let dateStr = req.body.dateOfBirth.toString().trim();

        // Fix common year formatting issues (e.g., 19990 -> 1999)
        if (dateStr.match(/^\d{5}-/)) {
          // Remove the first digit if it creates a 5-digit year starting with 1999x or 200xx
          if (dateStr.startsWith('1999') || dateStr.startsWith('2000') || dateStr.startsWith('2001')) {
            dateStr = dateStr.substring(1);
          }
        }

        // Only proceed if we have a potentially valid date
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const currentYear = new Date().getFullYear();

        if (!isNaN(date.getTime()) && year >= 1900 && year <= currentYear && date <= new Date()) {
          clientData.dateOfBirth = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
      } catch (error) {
        console.log('⚠️ Date sanitization failed:', error.message);
        // Let validation catch this later
      }
    }

    console.log('🐛 DEBUG - Client creation data received:', {
      fullName: req.body.fullName,
      company: req.body.company,
      userOrganization: req.user.organization,
      clientOrganization: clientData.organization,
      hasCompany: req.body.company ? true : false,
      allFields: Object.keys(req.body),
      clientData: Object.keys(clientData)
    });

    console.log('💾 Attempting to save client to database...');
    const client = new Client(clientData);
    await client.save();
    console.log('✅ Client saved successfully with ID:', client._id);

    console.log('🔍 Fetching populated client data...');
    const populatedClient = await Client.findById(client._id)
      .populate('createdBy', 'firstName lastName');

    console.log('✅ Client creation completed successfully');
    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: { client: populatedClient }
    });
  } catch (error) {
    console.error('❌ Create client error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    // Sanitize and prepare update data
    const updateData = {
      ...req.body
    };

    // Sanitize dateOfBirth if provided
    if (req.body.dateOfBirth) {
      try {
        // Handle common date format issues
        let dateStr = req.body.dateOfBirth.toString().trim();

        // Fix common year formatting issues (e.g., 19990 -> 1999)
        if (dateStr.match(/^\d{5}-/)) {
          // Remove the first digit if it creates a 5-digit year starting with 1999x or 200xx
          if (dateStr.startsWith('1999') || dateStr.startsWith('2000') || dateStr.startsWith('2001')) {
            dateStr = dateStr.substring(1);
          }
        }

        // Only proceed if we have a potentially valid date
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const currentYear = new Date().getFullYear();

        if (!isNaN(date.getTime()) && year >= 1900 && year <= currentYear && date <= new Date()) {
          updateData.dateOfBirth = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
      } catch (error) {
        console.log('⚠️ Date sanitization failed during update:', error.message);
        // Let validation catch this later
      }
    }

    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        organization: req.user.organization
      },
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found or you do not have access to this client'
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
    // First, find the client to ensure it exists and user has permission
    const client = await Client.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found or you do not have access to this client'
      });
    }

    // Delete the client (hard delete)
    await Client.findByIdAndDelete(client._id);

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
      { $match: { organization: req.user.organization } },
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
      organization: req.user.organization
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