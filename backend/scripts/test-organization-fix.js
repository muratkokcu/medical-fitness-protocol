const mongoose = require('mongoose');
const Client = require('../src/models/Client');

async function testOrganizationFix() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://muratkokcu92_db_user:QqF5gXZOwGOoKnmx@cluster0.n8a6fz1.mongodb.net/medical-fitness-dashboard?retryWrites=true&w=majority&appName=Cluster0');
    
    console.log('=== TESTING ORGANIZATION FIELD FIX ===');
    
    const mockUserId = new mongoose.Types.ObjectId();
    
    // Test 1: Try to save client with organization field (should be rejected with strict mode)
    console.log('\n🧪 Test 1: Creating client with ORGANIZATION field (should be blocked)');
    try {
      const clientWithOrg = new Client({
        fullName: 'Test Client With Org',
        organization: 'Medical Fitness Center',
        createdBy: mockUserId
      });
      await clientWithOrg.save();
      const saved = await Client.findById(clientWithOrg._id);
      console.log('⚠️  Organization field in saved client:', saved.organization || 'NOT PRESENT');
      console.log('✅ Company field in saved client:', saved.company || 'NOT PRESENT');
      await Client.findByIdAndDelete(clientWithOrg._id);
    } catch (error) {
      console.log('❌ Failed to save with organization field:', error.message);
    }
    
    // Test 2: Save client with company field (should work)
    console.log('\n🧪 Test 2: Creating client with COMPANY field (should work)');
    const clientWithCompany = new Client({
      fullName: 'Test Client With Company',
      company: 'Acme Corporation',
      createdBy: mockUserId
    });
    await clientWithCompany.save();
    const savedCompany = await Client.findById(clientWithCompany._id);
    console.log('✅ Company field in saved client:', savedCompany.company || 'NOT PRESENT');
    console.log('⚠️  Organization field in saved client:', savedCompany.organization || 'NOT PRESENT');
    await Client.findByIdAndDelete(clientWithCompany._id);
    
    // Test 3: Check if strict mode is working
    console.log('\n🧪 Test 3: Testing strict mode with extra fields');
    try {
      const clientWithExtra = new Client({
        fullName: 'Test Client With Extra',
        company: 'Test Company',
        extraField: 'This should not be saved',
        createdBy: mockUserId
      });
      await clientWithExtra.save();
      const savedExtra = await Client.findById(clientWithExtra._id);
      console.log('Extra field present:', savedExtra.extraField ? 'YES (PROBLEM)' : 'NO (GOOD)');
      await Client.findByIdAndDelete(clientWithExtra._id);
    } catch (error) {
      console.log('❌ Strict mode blocked extra fields:', error.message);
    }
    
    console.log('\n🎉 Tests completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the test
testOrganizationFix();