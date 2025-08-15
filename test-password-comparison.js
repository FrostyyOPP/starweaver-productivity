const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Test password comparison logic
async function testPasswordComparison() {
  console.log('🔍 Testing Password Comparison Logic...');
  
  // Test 1: Test the actual passwords we just fixed
  const testPasswords = [
    { email: 'sachin.kumar@starweaver.com', password: 'Admin@123' },
    { email: 'aafreen@gmail.com', password: 'Admin@123' },
    { email: 'ashu.kumar@starweaver.com', password: 'Editor@123' }
  ];
  
  console.log('\n📝 Test 1: Testing actual fixed passwords');
  
  try {
    // Connect to MongoDB to get the actual hashed passwords
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/starweaver-productivity';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    for (const testCase of testPasswords) {
      const user = await mongoose.connection.db.collection('users').findOne({ 
        email: testCase.email 
      });
      
      if (user && user.password) {
        const isMatch = await bcrypt.compare(testCase.password, user.password);
        console.log(`   ${testCase.email} (${testCase.password}): ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      } else {
        console.log(`   ${testCase.email}: ❌ User not found or no password`);
      }
    }
    
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    
  } catch (error) {
    console.log('Database test error:', error.message);
  }
  
  // Test 2: Hash the test password and compare
  console.log('\n📝 Test 2: Hash and compare');
  try {
    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash('Admin@123', salt);
    console.log('New hash for Admin@123:', newHash);
    
    const isMatch = await bcrypt.compare('Admin@123', newHash);
    console.log('New hash comparison result:', isMatch);
  } catch (error) {
    console.log('Hash and compare error:', error.message);
  }
  
  console.log('\n✅ Password comparison tests completed');
}

// Run tests
testPasswordComparison();
