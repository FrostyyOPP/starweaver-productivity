import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Entry from '@/lib/models/Entry';
import Team from '@/lib/models/Team';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { teamLeaders, editors, productivityData } = body;

    // Validate required data
    if (!teamLeaders || !editors || !productivityData) {
      return NextResponse.json(
        { error: 'Missing required data: teamLeaders, editors, or productivityData' },
        { status: 400 }
      );
    }

    const results = {
      teamLeadersCreated: 0,
      editorsCreated: 0,
      entriesCreated: 0,
      errors: [] as string[]
    };

    // Create Team Leaders
    for (const tl of teamLeaders) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: tl.email });
        if (existingUser) {
          results.errors.push(`Team Leader ${tl.firstName} ${tl.lastName} already exists with email ${tl.email}`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('Admin@124', 12);

        // Create team leader user
        const teamLeaderUser = await User.create({
          firstName: tl.firstName,
          lastName: tl.lastName,
          email: tl.email,
          password: hashedPassword,
          role: 'manager',
          isActive: true
        });

        // Create or update team
        let team = await Team.findOne({ name: tl.teamName });
        if (!team) {
          team = await Team.create({
            name: tl.teamName,
            admins: [teamLeaderUser._id],
            members: [teamLeaderUser._id]
          });
        } else {
          // Add team leader to team
          if (!team.admins.includes(teamLeaderUser._id)) {
            team.admins.push(teamLeaderUser._id);
          }
          if (!team.members.includes(teamLeaderUser._id)) {
            team.members.push(teamLeaderUser._id);
          }
          await team.save();
        }

        results.teamLeadersCreated++;
      } catch (error) {
        results.errors.push(`Failed to create team leader ${tl.firstName} ${tl.lastName}: ${error}`);
      }
    }

    // Create Editors
    for (const editor of editors) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: editor.email });
        if (existingUser) {
          results.errors.push(`Editor ${editor.firstName} ${editor.lastName} already exists with email ${editor.email}`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('Editor@123', 12);

        // Create editor user
        const editorUser = await User.create({
          firstName: editor.firstName,
          lastName: editor.lastName,
          email: editor.email,
          password: hashedPassword,
          role: 'editor',
          isActive: true
        });

        // Find and update team
        const team = await Team.findOne({ name: editor.teamName });
        if (team) {
          if (!team.members.includes(editorUser._id)) {
            team.members.push(editorUser._id);
            await team.save();
          }
        }

        results.editorsCreated++;
      } catch (error) {
        results.errors.push(`Failed to create editor ${editor.firstName} ${editor.lastName}: ${error}`);
      }
    }

    // Import Productivity Data
    for (const entry of productivityData) {
      try {
        // Find the editor user by name
        const editorUser = await User.findOne({
          $or: [
            { email: entry.editorName },
            { 
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$firstName", " ", "$lastName"] },
                  regex: entry.editorName,
                  options: "i"
                }
              }
            }
          ]
        });

        if (!editorUser) {
          results.errors.push(`Editor not found for entry: ${entry.editorName} on ${entry.date}`);
          continue;
        }

        // Check if entry already exists
        const existingEntry = await Entry.findOne({
          userId: editorUser._id,
          date: new Date(entry.date)
        });

        if (existingEntry) {
          results.errors.push(`Entry already exists for ${entry.editorName} on ${entry.date}`);
          continue;
        }

        // Calculate productivity score (assuming target is 10 videos per day)
        const targetVideos = 10;
        const productivityScore = Math.min((entry.videosCompleted / targetVideos) * 100, 100);

        // Create entry
        await Entry.create({
          userId: editorUser._id,
          date: new Date(entry.date),
          videosCompleted: entry.videosCompleted,
          videoCategory: entry.category,
          notes: entry.notes || '',
          mood: entry.mood || 5,
          energyLevel: entry.energyLevel || 5,
          challenges: entry.challenges || '',
          achievements: entry.achievements || '',
          productivityScore: Math.round(productivityScore),
          weeklyTarget: targetVideos * 5 // 5 days per week
        });

        results.entriesCreated++;
      } catch (error) {
        results.errors.push(`Failed to create entry for ${entry.editorName} on ${entry.date}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed successfully!`,
      results
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error during import' },
      { status: 500 }
    );
  }
}
