const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config({ path: '.env' });

const testUsers = [
  {
    firstName: 'Murat',
    lastName: 'Kokcü',
    email: 'murat.kokcu',
    password: '123456',
    role: 'admin',
    organization: 'Medical Fitness Center'
  },
  {
    firstName: 'Cem',
    lastName: 'Avat',
    email: 'cem.avat',
    password: '123456',
    role: 'manager',
    organization: 'Medical Fitness Center'
  },
  {
    firstName: 'Cihat',
    lastName: 'Gokhanay',
    email: 'cihat.gokhanay',
    password: '123456',
    role: 'manager',
    organization: 'Medical Fitness Center'
  },
  {
    firstName: 'Test1',
    lastName: 'User',
    email: 'test1.user',
    password: '123456',
    role: 'practitioner',
    organization: 'Medical Fitness Center'
  },
  {
    firstName: 'Test2',
    lastName: 'User',
    email: 'test2.user',
    password: '123456',
    role: 'practitioner',
    organization: 'Medical Fitness Center'
  },
  {
    firstName: 'Test3',
    lastName: 'User',
    email: 'test3.user',
    password: '123456',
    role: 'practitioner',
    organization: 'Medical Fitness Center'
  },
  {
    firstName: 'Test4',
    lastName: 'User',
    email: 'test4.user',
    password: '123456',
    role: 'practitioner',
    organization: 'Medical Fitness Center'
  },
  {
    firstName: 'Test5',
    lastName: 'User',
    email: 'test5.user',
    password: '123456',
    role: 'practitioner',
    organization: 'Medical Fitness Center'
  },
  {
    firstName: 'Test6',
    lastName: 'User',
    email: 'test6.user',
    password: '123456',
    role: 'practitioner',
    organization: 'Medical Fitness Center'
  },
  {
    firstName: 'Test7',
    lastName: 'User',
    email: 'test7.user',
    password: '123456',
    role: 'practitioner',
    organization: 'Medical Fitness Center'
  }
];

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-fitness-dashboard');
    console.log('Connected to MongoDB');

    // Clear existing users (optional - be careful in production!)
    console.log('Clearing existing users...');
    await User.deleteMany({});
    console.log('Existing users cleared');

    // Create test users
    console.log('Creating test users...');
    const createdUsers = [];
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    
    console.log(`Successfully created ${createdUsers.length} test users:`);
    createdUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });

    console.log('\nTest users created successfully!');
    console.log('You can now login with any of the above usernames using password: 123456');
    
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedUsers();