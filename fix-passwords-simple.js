const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/starweaver-productivity';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('🔧 Fixing user passwords...\n');

    // Define the correct passwords for each user
    const userPasswords = {
      'sachin.kumar@starweaver.com': 'Admin@123',
      'ashu.kumar@starweaver.com': 'Editor@123',
      'prashansha.manral@starweaver.com': 'Editor@123',
      'astha.sisodia@starweaver.com': 'Editor@123',
      'kavita.singh@starweaver.com': 'Editor@123',
      'anshika.sahu@starweaver.com': 'Editor@123',
      'akshay.jasiwal@starweaver.com': 'Editor@123',
      'aman.katiyar@starweaver.com': 'Editor@123',
      'aafreen@gmail.com': 'Admin@123'
    };

    let usersFixed = 0;
    let errors = [];

    for (const [email, password] of Object.entries(userPasswords)) {
      try {
        // Find the user directly in the database
        const user = await mongoose.connection.db.collection('users').findOne({ 
          email: email.toLowerCase() 
        });
        
        if (!user) {
          console.log(`⚠️  User not found: ${email}`);
          errors.push(`User not found: ${email}`);
          continue;
        }

        console.log(`🔍 Processing user: ${user.name} (${email})`);
        console.log(`   Current password hash: ${user.password ? user.password.substring(0, 20) + '...' : 'No password'}`);

        // Hash the new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update the user's password directly in the database
        await mongoose.connection.db.collection('users').updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );

        console.log(`   ✅ Password updated for ${user.name}`);
        usersFixed++;

      } catch (error) {
        console.error(`❌ Failed to update password for ${email}:`, error.message);
        errors.push(`Failed to update password for ${email}: ${error.message}`);
      }
    }

    console.log('\n📊 Password Fix Summary:');
    console.log(`✅ Users fixed: ${usersFixed}`);
    if (errors.length > 0) {
      console.log(`⚠️  Errors: ${errors.length}`);
      errors.forEach(error => console.log(`   - ${error}`));
    }

    if (usersFixed > 0) {
      console.log('\n🎉 Password fix completed successfully!');
      console.log('🔐 Users can now login with their correct passwords:');
      console.log('   - Sachin Kumar: Admin@123');
      console.log('   - Aafreen: Admin@123');
      console.log('   - All Editors: Editor@123');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the fix
fixPasswords();
