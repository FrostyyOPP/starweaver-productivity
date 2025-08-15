const mongoose = require('mongoose');

// Team members data from the image
const expectedTeamMembers = [
  "ashu.kumar@starweaver.com",
  "prashansha.manral@starweaver.com",
  "astha.sisodia@starweaver.com",
  "kavita.singh@starweaver.com",
  "anshika.sahu@starweaver.com",
  "akshay.jasiwal@starweaver.com",
  "aman.katiyar@starweaver.com"
];

// User Schema (simplified version)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function verifyTeamMembers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/starweaver-productivity';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Verifying Sachin Kumar\'s team members...\n');

    let foundMembers = 0;
    let missingMembers = [];

    for (const email of expectedTeamMembers) {
      try {
        const user = await User.findOne({ email: email });
        if (user) {
          console.log(`✅ ${user.name} (${user.email}) - ${user.role} - Active: ${user.isActive}`);
          foundMembers++;
        } else {
          console.log(`❌ Missing: ${email}`);
          missingMembers.push(email);
        }
      } catch (error) {
        console.error(`❌ Error checking ${email}:`, error.message);
        missingMembers.push(email);
      }
    }

    console.log('\n📊 Verification Summary:');
    console.log(`✅ Found: ${foundMembers}/${expectedTeamMembers.length} team members`);
    
    if (missingMembers.length > 0) {
      console.log(`❌ Missing: ${missingMembers.length} members`);
      missingMembers.forEach(email => console.log(`   - ${email}`));
    } else {
      console.log('🎉 All team members are available!');
    }

    // Show all team members with their details
    console.log('\n👥 Complete Team Member List:');
    const allTeamMembers = await User.find({ 
      email: { $in: expectedTeamMembers } 
    }).sort({ name: 1 });
    
    allTeamMembers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name}`);
      console.log(`      📧 Email: ${user.email}`);
      console.log(`      🎭 Role: ${user.role}`);
      console.log(`      ✅ Active: ${user.isActive}`);
      console.log(`      📅 Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the verification
verifyTeamMembers();
