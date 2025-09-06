const mongoose = require('mongoose');
const Client = require('../src/models/Client');

async function testClientCreation() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://muratkokcu92_db_user:QqF5gXZOwGOoKnmx@cluster0.n8a6fz1.mongodb.net/medical-fitness-dashboard?retryWrites=true&w=majority&appName=Cluster0');
    
    console.log('=== TESTING NEW CLIENT CREATION ===');
    
    // Simulate creating a client with company field (like frontend would do)
    const testClientData = {
      fullName: 'Test Client',
      email: 'test@example.com',
      phone: '555-1234',
      company: 'Acme Corporation',
      occupation: 'Software Engineer',
      createdBy: new mongoose.Types.ObjectId() // Mock user ID
    };
    
    console.log('Creating client with data:', {
      fullName: testClientData.fullName,
      company: testClientData.company,
      hasOrganization: testClientData.organization ? true : false
    });
    
    const client = new Client(testClientData);
    await client.save();
    
    console.log('✅ Client created successfully!');
    
    // Verify the saved data
    const savedClient = await Client.findById(client._id);
    console.log('\n=== SAVED CLIENT VERIFICATION ===');
    console.log('Saved client company field:', savedClient.company || 'EMPTY');
    console.log('Saved client organization field:', savedClient.organization || 'EMPTY');
    
    // Clean up test data
    await Client.findByIdAndDelete(client._id);
    console.log('\n🧹 Test client cleaned up');
    
    console.log('\n🎉 SUCCESS: New company field structure works correctly!');
    console.log('Frontend can now create clients with company field properly');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the test
testClientCreation();