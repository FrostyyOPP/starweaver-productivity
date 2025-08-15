const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function fixProductionPasswords() {
  try {
    // Connect to production MongoDB using Railway environment variables
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI environment variable not found');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to Production MongoDB');

    console.log('🔧 Fixing production user passwords...\n');

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
        // Find the user directly in the production database
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

        // Hash the new password with production salt rounds
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update the user's password directly in the production database
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

    console.log('\n📊 Production Password Fix Summary:');
    console.log(`✅ Users fixed: ${usersFixed}`);
    if (errors.length > 0) {
      console.log(`⚠️  Errors: ${errors.length}`);
      errors.forEach(error => console.log(`   - ${error}`));
    }

    if (usersFixed > 0) {
      console.log('\n🎉 Production password fix completed successfully!');
      console.log('🔐 Users can now login with their correct passwords:');
      console.log('   - Sachin Kumar: Admin@123');
      console.log('   - Aafreen: Admin@123');
      console.log('   - All Editors: Editor@123');
      console.log('\n🚀 Production deployment is now ready for testing!');
    }

  } catch (error) {
    console.error('❌ Production Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Production MongoDB connection closed');
  }
}

// Run the production fix
fixProductionPasswords();
