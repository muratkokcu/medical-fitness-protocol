#!/usr/bin/env node

/**
 * Migration script to update existing assessments to comply with new schema requirements
 *
 * This script will:
 * 1. Create a default client for assessments without clientId
 * 2. Update existing submissions to reference clients
 * 3. Update client documents with assessment summaries
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('../src/models/Client');
const Submission = require('../src/models/Submission');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-fitness';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createDefaultClient() {
  try {
    // Check if default client already exists
    let defaultClient = await Client.findOne({ fullName: 'Legacy Assessment Client' });

    if (!defaultClient) {
      defaultClient = new Client({
        fullName: 'Legacy Assessment Client',
        email: 'legacy@system.local',
        organization: 'System',
        createdBy: new mongoose.Types.ObjectId(),
        isActive: false
      });

      await defaultClient.save();
      console.log('✅ Created default client for legacy assessments');
    }

    return defaultClient;
  } catch (error) {
    console.error('❌ Error creating default client:', error);
    throw error;
  }
}

async function migrateSubmissions(defaultClient) {
  try {
    // Find submissions without clientId
    const orphanedSubmissions = await Submission.find({
      $or: [
        { clientId: { $exists: false } },
        { clientId: null }
      ]
    });

    console.log(`📊 Found ${orphanedSubmissions.length} submissions without clientId`);

    if (orphanedSubmissions.length === 0) {
      console.log('✅ No orphaned submissions found');
      return;
    }

    // Update orphaned submissions to reference default client
    const updateResult = await Submission.updateMany(
      {
        $or: [
          { clientId: { $exists: false } },
          { clientId: null }
        ]
      },
      {
        $set: { clientId: defaultClient._id }
      }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} submissions with default clientId`);

    // Update assessment summaries for the default client
    await updateClientAssessmentSummary(defaultClient._id);

  } catch (error) {
    console.error('❌ Error migrating submissions:', error);
    throw error;
  }
}

async function updateClientAssessmentSummary(clientId) {
  try {
    const client = await Client.findById(clientId);
    if (!client) return;

    // Get all assessments for this client
    const assessments = await Submission.find({ clientId })
      .sort({ createdAt: -1 });

    if (assessments.length === 0) return;

    // Calculate assessment summary
    const assessmentHistory = assessments.slice(0, 10).map(assessment => ({
      submissionId: assessment._id,
      date: assessment.createdAt,
      riskLevel: assessment.assessmentResults?.overall?.riskLevel || 'Unknown',
      riskScore: assessment.assessmentResults?.overall?.riskScore || 0,
      reportId: assessment.reportData?.code || '',
      readToken: assessment.accessTokens?.read || ''
    }));

    const latest = assessments[0];

    // Update client with assessment summary
    client.assessmentSummary = {
      totalAssessments: assessments.length,
      lastAssessmentDate: latest.createdAt,
      lastRiskLevel: latest.assessmentResults?.overall?.riskLevel,
      lastRiskScore: latest.assessmentResults?.overall?.riskScore,
      assessmentHistory
    };

    await client.save();
    console.log(`✅ Updated assessment summary for client: ${client.fullName}`);

  } catch (error) {
    console.error('❌ Error updating client assessment summary:', error);
    throw error;
  }
}

async function updateAllClientAssessmentSummaries() {
  try {
    // Get all clients that have assessments
    const clientsWithAssessments = await Submission.distinct('clientId');
    console.log(`📊 Found ${clientsWithAssessments.length} clients with assessments`);

    for (const clientId of clientsWithAssessments) {
      await updateClientAssessmentSummary(clientId);
    }

    console.log('✅ Updated assessment summaries for all clients');
  } catch (error) {
    console.error('❌ Error updating client assessment summaries:', error);
    throw error;
  }
}

async function validateMigration() {
  try {
    // Check for submissions without clientId
    const orphanedCount = await Submission.countDocuments({
      $or: [
        { clientId: { $exists: false } },
        { clientId: null }
      ]
    });

    if (orphanedCount > 0) {
      console.log(`⚠️  Warning: ${orphanedCount} submissions still without clientId`);
    } else {
      console.log('✅ All submissions have valid clientId');
    }

    // Check client references
    const totalSubmissions = await Submission.countDocuments();
    const validReferences = await Submission.countDocuments({
      clientId: { $exists: true, $ne: null }
    });

    console.log(`📊 Migration validation:`);
    console.log(`   Total submissions: ${totalSubmissions}`);
    console.log(`   Valid client references: ${validReferences}`);
    console.log(`   Success rate: ${((validReferences / totalSubmissions) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Error validating migration:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting assessment migration...');

  try {
    await connectDB();

    // Step 1: Create default client for orphaned assessments
    const defaultClient = await createDefaultClient();

    // Step 2: Migrate orphaned submissions
    await migrateSubmissions(defaultClient);

    // Step 3: Update all client assessment summaries
    await updateAllClientAssessmentSummaries();

    // Step 4: Validate migration
    await validateMigration();

    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  createDefaultClient,
  migrateSubmissions,
  updateClientAssessmentSummary,
  updateAllClientAssessmentSummaries,
  validateMigration
};