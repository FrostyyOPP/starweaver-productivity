const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Team members data from the image
const teamMembers = [
  {
    name: "Ashu Kumar",
    email: "ashu.kumar@starweaver.com",
    password: "Editor@123",
    role: "editor"
  },
  {
    name: "Prashansha Manral",
    email: "prashansha.manral@starweaver.com",
    password: "Editor@123",
    role: "editor"
  },
  {
    name: "Astha Sisodia",
    email: "astha.sisodia@starweaver.com",
    password: "Editor@123",
    role: "editor"
  },
  {
    name: "Kavita Singh",
    email: "kavita.singh@starweaver.com",
    password: "Editor@123",
    role: "editor"
  },
  {
    name: "Anshika Sahu",
    email: "anshika.sahu@starweaver.com",
    password: "Editor@123",
    role: "editor"
  },
  {
    name: "Akshay Jaiswal",
    email: "akshay.jasiwal@starweaver.com",
    password: "Editor@123",
    role: "editor"
  },
  {
    name: "Aman Katiya",
    email: "aman.katiyar@starweaver.com",
    password: "Editor@123",
    role: "editor"
  }
];

// User Schema (simplified version)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['viewer', 'editor', 'team_manager', 'manager', 'admin'] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function importTeamMembers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/starweaver-productivity';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('🚀 Importing Sachin Kumar\'s team members...');
    console.log('📋 Team members to import:');
    teamMembers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });
    console.log('\n🔑 All users will have password: Editor@123');
    console.log('\n⏳ Starting import...\n');

    let usersCreated = 0;
    let errors = [];

    for (const userData of teamMembers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`⚠️  User with email ${userData.email} already exists`);
          errors.push(`User with email ${userData.email} already exists`);
          continue;
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Create user
        await User.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          isActive: true
        });

        console.log(`✅ Created user: ${userData.name} (${userData.email})`);
        usersCreated++;
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.email}:`, error.message);
        errors.push(`Failed to create user ${userData.email}: ${error.message}`);
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`✅ Users created: ${usersCreated}`);
    if (errors.length > 0) {
      console.log(`⚠️  Errors: ${errors.length}`);
      errors.forEach(error => console.log(`   - ${error}`));
    }

    if (usersCreated > 0) {
      console.log('\n🎉 Team import completed successfully!');
      console.log('🔐 All users can now login with password: Editor@123');
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the import
importTeamMembers();
