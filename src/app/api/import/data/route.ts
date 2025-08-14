import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Entry from '@/lib/models/Entry';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { productivityData } = body;

    // Validate required data
    if (!productivityData || !Array.isArray(productivityData)) {
      return NextResponse.json(
        { error: 'Missing or invalid productivityData array' },
        { status: 400 }
      );
    }

    const results = {
      entriesCreated: 0,
      errors: [] as string[]
    };

    // Import Productivity Data
    for (const entry of productivityData) {
      try {
        // Find the user by email
        const user = await User.findOne({ email: entry.userEmail });
        if (!user) {
          results.errors.push(`User not found for email: ${entry.userEmail} on ${entry.date}`);
          continue;
        }

        // Check if entry already exists
        const existingEntry = await Entry.findOne({
          userId: user._id,
          date: new Date(entry.date)
        });

        if (existingEntry) {
          results.errors.push(`Entry already exists for ${entry.userEmail} on ${entry.date}`);
          continue;
        }

        // Calculate productivity score (assuming target is 10 videos per day)
        const targetVideos = 10;
        const productivityScore = Math.min((entry.videosCompleted / targetVideos) * 100, 100);

        // Create entry
        await Entry.create({
          userId: user._id,
          date: new Date(entry.date),
          videosCompleted: entry.videosCompleted,
          videoCategory: 'Course', // Default category
          notes: entry.notes || '',
          mood: 5, // Default mood
          energyLevel: 5, // Default energy level
          challenges: '',
          achievements: '',
          productivityScore: Math.round(productivityScore),
          weeklyTarget: targetVideos * 5 // 5 days per week
        });

        results.entriesCreated++;
      } catch (error) {
        results.errors.push(`Failed to create entry for ${entry.userEmail} on ${entry.date}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Data import completed successfully!`,
      results
    });

  } catch (error) {
    console.error('Data import error:', error);
    return NextResponse.json(
      { error: 'Internal server error during data import' },
      { status: 500 }
    );
  }
}
