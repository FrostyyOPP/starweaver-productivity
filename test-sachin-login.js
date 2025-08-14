const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/starweaver-productivity');

const User = mongoose.model('User', {
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  teamId: mongoose.Schema.Types.ObjectId,
  teamManagerId: mongoose.Schema.Types.ObjectId
});

async function testSachinLogin() {
  try {
    console.log('🔍 Testing Sachin Kumar login...');
    
    // Find Sachin Kumar
    const sachin = await User.findOne({ email: 'sachin.kumar@starweaver.com' });
    
    if (!sachin) {
      console.log('❌ Sachin Kumar not found');
      return;
    }
    
    console.log('✅ Sachin Kumar found:');
    console.log(`   Name: ${sachin.name}`);
    console.log(`   Email: ${sachin.email}`);
    console.log(`   Role: ${sachin.role}`);
    console.log(`   Is Active: ${sachin.isActive}`);
    console.log(`   Team ID: ${sachin.teamId}`);
    console.log(`   Has Password: ${!!sachin.password}`);
    console.log(`   Password Length: ${sachin.password ? sachin.password.length : 0}`);
    
    // Test password comparison
    const bcrypt = require('bcryptjs');
    const testPassword = 'Admin@123';
    
    if (sachin.password) {
      const isMatch = await bcrypt.compare(testPassword, sachin.password);
      console.log(`   Password Match: ${isMatch}`);
    }
    
    // Check if there are any validation issues
    try {
      await sachin.validate();
      console.log('✅ User validation passed');
    } catch (validationError) {
      console.log('❌ User validation failed:', validationError.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testSachinLogin();
