const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import models
const User = require('./src/lib/models/User');
const Team = require('./src/lib/models/Team');

async function setupTeamsV2() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing teams and users (be careful with this in production!)
    await Team.deleteMany({});
    await User.deleteMany({ role: { $in: ['team_manager', 'editor'] } });
    console.log('Cleared existing teams and users');

    // Create 3 teams
    const teams = [
      {
        name: 'Team Alpha',
        code: 'TEAM-A',
        color: '#3B82F6',
        description: 'Primary content creation team',
        goals: {
          dailyTarget: 15,
          weeklyTarget: 90,
          monthlyTarget: 360,
          quarterlyTarget: 1080,
          yearlyTarget: 4320
        },
        settings: {
          allowMemberInvites: true,
          requireApproval: false,
          visibility: 'private',
          allowManagerEdit: true,
          allowManagerCreate: true
        },
        metrics: {
          totalMembers: 0,
          activeMembers: 0,
          averageProductivity: 0,
          totalVideosCompleted: 0,
          lastUpdated: new Date()
        }
      },
      {
        name: 'Team Beta',
        code: 'TEAM-B',
        color: '#10B981',
        description: 'Secondary content creation team',
        goals: {
          dailyTarget: 12,
          weeklyTarget: 72,
          monthlyTarget: 288,
          quarterlyTarget: 864,
          yearlyTarget: 3456
        },
        settings: {
          allowMemberInvites: true,
          requireApproval: false,
          visibility: 'private',
          allowManagerEdit: true,
          allowManagerCreate: true
        },
        metrics: {
          totalMembers: 0,
          activeMembers: 0,
          averageProductivity: 0,
          totalVideosCompleted: 0,
          lastUpdated: new Date()
        }
      },
      {
        name: 'Team Gamma',
        code: 'TEAM-C',
        color: '#8B5CF6',
        description: 'Specialized content creation team',
        goals: {
          dailyTarget: 10,
          weeklyTarget: 60,
          monthlyTarget: 240,
          quarterlyTarget: 720,
          yearlyTarget: 2880
        },
        settings: {
          allowMemberInvites: true,
          requireApproval: false,
          visibility: 'private',
          allowManagerEdit: true,
          allowManagerCreate: true
        },
        metrics: {
          totalMembers: 0,
          activeMembers: 0,
          averageProductivity: 0,
          totalVideosCompleted: 0,
          lastUpdated: new Date()
        }
      }
    ];

    // Create teams
    const createdTeams = [];
    for (const teamData of teams) {
      const team = new Team(teamData);
      await team.save();
      createdTeams.push(team);
      console.log(`Created team: ${team.name} (${team.code})`);
    }

    // Create team managers
    const teamManagers = [
      {
        name: 'Sachin Kumar',
        email: 'sachinkumar@gmail.com',
        password: 'Admin@124',
        role: 'team_manager',
        position: 'Team Leader',
        department: 'Content Creation',
        employeeId: 'TL001',
        phone: '+91-9876543210',
        skills: ['Team Management', 'Content Strategy', 'Video Production'],
        joinDate: new Date('2024-01-01')
      },
      {
        name: 'Amit Sharma',
        email: 'amitsharma@gmail.com',
        password: 'Admin@124',
        role: 'team_manager',
        position: 'Team Leader',
        department: 'Content Creation',
        employeeId: 'TL002',
        phone: '+91-9876543211',
        skills: ['Team Management', 'Content Strategy', 'Video Production'],
        joinDate: new Date('2024-01-01')
      },
      {
        name: 'Priya Patel',
        email: 'priyapatel@gmail.com',
        password: 'Admin@124',
        role: 'team_manager',
        position: 'Team Leader',
        department: 'Content Creation',
        employeeId: 'TL003',
        phone: '+91-9876543212',
        skills: ['Team Management', 'Content Strategy', 'Video Production'],
        joinDate: new Date('2024-01-01')
      }
    ];

    // Create team managers and assign them to teams
    for (let i = 0; i < teamManagers.length; i++) {
      const managerData = teamManagers[i];
      const team = createdTeams[i];

      const manager = new User({
        ...managerData,
        teamId: team._id
      });
      await manager.save();

      // Update team with manager
      team.teamManager = manager._id;
      team.members.push(manager._id);
      team.admins.push(manager._id);
      await team.save();

      console.log(`Created team manager: ${manager.name} for ${team.name}`);
    }

    // Create sample team members (editors)
    const teamMembers = [
      // Team Alpha members
      {
        name: 'Aman Singh',
        email: 'aman@gmail.com',
        password: 'Editor@123',
        role: 'editor',
        position: 'Video Editor',
        department: 'Content Creation',
        employeeId: 'ED001',
        phone: '+91-9876543220',
        skills: ['Video Editing', 'Motion Graphics', 'Color Grading'],
        joinDate: new Date('2024-01-15'),
        teamId: createdTeams[0]._id,
        teamManagerId: createdTeams[0].teamManager
      },
      {
        name: 'Rahul Verma',
        email: 'rahul@gmail.com',
        password: 'Editor@123',
        role: 'editor',
        position: 'Video Editor',
        department: 'Content Creation',
        employeeId: 'ED002',
        phone: '+91-9876543221',
        skills: ['Video Editing', 'Visual Effects', 'Compositing'],
        joinDate: new Date('2024-01-15'),
        teamId: createdTeams[0]._id,
        teamManagerId: createdTeams[0].teamManager
      },
      {
        name: 'Neha Gupta',
        email: 'neha@gmail.com',
        password: 'Editor@123',
        role: 'editor',
        position: 'Video Editor',
        department: 'Content Creation',
        employeeId: 'ED003',
        phone: '+91-9876543222',
        skills: ['Video Editing', 'Animation', 'Sound Design'],
        joinDate: new Date('2024-01-15'),
        teamId: createdTeams[0]._id,
        teamManagerId: createdTeams[0].teamManager
      },

      // Team Beta members
      {
        name: 'Vikram Singh',
        email: 'vikram@gmail.com',
        password: 'Editor@123',
        role: 'editor',
        position: 'Video Editor',
        department: 'Content Creation',
        employeeId: 'ED004',
        phone: '+91-9876543223',
        skills: ['Video Editing', 'Motion Graphics', 'Color Grading'],
        joinDate: new Date('2024-01-15'),
        teamId: createdTeams[1]._id,
        teamManagerId: createdTeams[1].teamManager
      },
      {
        name: 'Anjali Sharma',
        email: 'anjali@gmail.com',
        password: 'Editor@123',
        role: 'editor',
        position: 'Video Editor',
        department: 'Content Creation',
        employeeId: 'ED005',
        phone: '+91-9876543224',
        skills: ['Video Editing', 'Visual Effects', 'Compositing'],
        joinDate: new Date('2024-01-15'),
        teamId: createdTeams[1]._id,
        teamManagerId: createdTeams[1].teamManager
      },
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@gmail.com',
        password: 'Editor@123',
        role: 'editor',
        position: 'Video Editor',
        department: 'Content Creation',
        employeeId: 'ED006',
        phone: '+91-9876543225',
        skills: ['Video Editing', 'Animation', 'Sound Design'],
        joinDate: new Date('2024-01-15'),
        teamId: createdTeams[1]._id,
        teamManagerId: createdTeams[1].teamManager
      },

      // Team Gamma members
      {
        name: 'Meera Patel',
        email: 'meera@gmail.com',
        password: 'Editor@123',
        role: 'editor',
        position: 'Video Editor',
        department: 'Content Creation',
        employeeId: 'ED007',
        phone: '+91-9876543226',
        skills: ['Video Editing', 'Motion Graphics', 'Color Grading'],
        joinDate: new Date('2024-01-15'),
        teamId: createdTeams[2]._id,
        teamManagerId: createdTeams[2].teamManager
      },
      {
        name: 'Arjun Singh',
        email: 'arjun@gmail.com',
        password: 'Editor@123',
        role: 'editor',
        position: 'Video Editor',
        department: 'Content Creation',
        employeeId: 'ED008',
        phone: '+91-9876543227',
        skills: ['Video Editing', 'Visual Effects', 'Compositing'],
        joinDate: new Date('2024-01-15'),
        teamId: createdTeams[2]._id,
        teamManagerId: createdTeams[2].teamManager
      }
    ];

    // Create team members
    for (const memberData of teamMembers) {
      const member = new User(memberData);
      await member.save();

      // Add member to team
      const team = await Team.findById(memberData.teamId);
      if (team) {
        team.members.push(member._id);
        await team.save();
      }

      console.log(`Created team member: ${member.name} for ${team?.name}`);
    }

    // Update team metrics
    for (const team of createdTeams) {
      const memberCount = team.members.length;
      team.metrics.totalMembers = memberCount;
      team.metrics.activeMembers = memberCount;
      await team.save();
    }

    console.log('\n🎉 Team V2 setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`✅ Created ${createdTeams.length} teams`);
    console.log(`✅ Created ${teamManagers.length} team managers`);
    console.log(`✅ Created ${teamMembers.length} team members`);
    console.log('\n🔑 Login Credentials:');
    console.log('\nTeam Managers:');
    teamManagers.forEach((manager, index) => {
      console.log(`${index + 1}. ${manager.name} - ${manager.email} / ${manager.password}`);
    });
    console.log('\nTeam Members:');
    teamMembers.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name} - ${member.email} / ${member.password}`);
    });

  } catch (error) {
    console.error('Error setting up teams V2:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the setup
setupTeamsV2();
