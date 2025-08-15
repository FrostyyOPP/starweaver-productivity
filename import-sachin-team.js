const fs = require('fs');
const path = require('path');

// Read the team data
const teamData = JSON.parse(fs.readFileSync(path.join(__dirname, 'sachin-team-import.json'), 'utf8'));

// Function to import users
async function importTeamMembers() {
  try {
    const response = await fetch('http://localhost:3000/api/import/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Team import successful!');
      console.log(`📊 Users created: ${result.results.usersCreated}`);
      if (result.results.errors.length > 0) {
        console.log('⚠️  Errors encountered:');
        result.results.errors.forEach(error => console.log(`   - ${error}`));
      }
    } else {
      console.error('❌ Import failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during import:', error.message);
  }
}

// Check if server is running and import
console.log('🚀 Importing Sachin Kumar\'s team members...');
console.log('📋 Team members to import:');
teamData.users.forEach((user, index) => {
  console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
});

console.log('\n🔑 All users will have password: Editor@123');
console.log('\n⏳ Starting import...\n');

importTeamMembers();
