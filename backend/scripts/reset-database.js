const mongoose = require('mongoose');
require('dotenv').config();

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    console.log('📊 Current database state:');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Get counts before reset
    if (collections.find(c => c.name === 'clients')) {
      const clientCount = await db.collection('clients').countDocuments({});
      console.log(`📈 Current clients: ${clientCount}`);
    }
    
    if (collections.find(c => c.name === 'users')) {
      const userCount = await db.collection('users').countDocuments({});
      console.log(`👥 Current users: ${userCount}`);
    }
    
    if (collections.find(c => c.name === 'assessments')) {
      const assessmentCount = await db.collection('assessments').countDocuments({});
      console.log(`📋 Current assessments: ${assessmentCount}`);
    }
    
    console.log('\n🗑️  Dropping clients collection...');
    try {
      await db.collection('clients').drop();
      console.log('✅ Clients collection dropped successfully');
    } catch (error) {
      if (error.message.includes('ns not found')) {
        console.log('ℹ️  Clients collection already empty');
      } else {
        throw error;
      }
    }
    
    console.log('\n🗑️  Dropping assessments collection...');
    try {
      await db.collection('assessments').drop();
      console.log('✅ Assessments collection dropped successfully');
    } catch (error) {
      if (error.message.includes('ns not found')) {
        console.log('ℹ️  Assessments collection already empty');
      } else {
        throw error;
      }
    }
    
    // Keep users collection for login testing
    console.log('\n📝 Final database state:');
    const finalCollections = await db.listCollections().toArray();
    console.log('Remaining collections:', finalCollections.map(c => c.name));
    
    if (finalCollections.find(c => c.name === 'users')) {
      const finalUserCount = await db.collection('users').countDocuments({});
      console.log(`👥 Users preserved: ${finalUserCount}`);
    }
    
    console.log('\n🎉 Database reset complete! Ready for testing with clean client data.');
    console.log('📋 Next steps:');
    console.log('   1. Create new clients with company field');
    console.log('   2. Test edit mode shows correct company data');
    console.log('   3. Verify table displays company names properly');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the reset
resetDatabase();