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
      entriesUpdated: 0,
      errors: [] as string[]
    };

    // Import Productivity Data
    for (const entry of productivityData) {
      try {
        // Find the user by name (since spreadsheet uses names)
        const user = await User.findOne({ 
          name: { $regex: new RegExp(entry.teamMember, 'i') },
          role: 'editor'
        });
        
        if (!user) {
          results.errors.push(`User not found for name: ${entry.teamMember}`);
          continue;
        }

        // Parse the date
        const entryDate = new Date(entry.date);
        if (isNaN(entryDate.getTime())) {
          results.errors.push(`Invalid date format for ${entry.teamMember} on ${entry.date}`);
          continue;
        }

        // Check if entry already exists
        const existingEntry = await Entry.findOne({
          userId: user._id,
          date: {
            $gte: new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate()),
            $lt: new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate() + 1)
          }
        });

        // Parse production and marketing values
        let courseVideos = 0;
        let marketingVideos = 0;
        let videoType = 'course' as const;

        // Handle production column
        if (entry.production !== undefined && entry.production !== null && entry.production !== '') {
          if (entry.production === 'L' || entry.production === 'l') {
            // Leave day
            videoType = 'leave';
            courseVideos = 0;
            marketingVideos = 0;
          } else {
            const prodValue = parseFloat(entry.production);
            if (!isNaN(prodValue)) {
              courseVideos = prodValue;
            }
          }
        }

        // Handle marketing column
        if (entry.marketing !== undefined && entry.marketing !== null && entry.marketing !== '') {
          const mktValue = parseFloat(entry.marketing);
          if (!isNaN(mktValue)) {
            marketingVideos = mktValue;
          }
        }

        // Calculate total videos (course + marketing*6)
        const totalVideos = courseVideos + (marketingVideos * 6);

        // Set target videos (default 15 per day)
        const targetVideos = 15;

        // Calculate productivity score
        let productivityScore = 0;
        if (videoType !== 'leave' && targetVideos > 0) {
          productivityScore = Math.min(Math.round((totalVideos / targetVideos) * 100), 100);
        }

        if (existingEntry) {
          // Update existing entry
          existingEntry.courseVideos = courseVideos;
          existingEntry.marketingVideos = marketingVideos;
          existingEntry.totalVideos = totalVideos;
          existingEntry.targetVideos = targetVideos;
          existingEntry.videoType = videoType;
          existingEntry.videosCompleted = totalVideos; // Legacy field
          existingEntry.productivityScore = productivityScore;
          existingEntry.notes = `Updated from import - Production: ${courseVideos}, Marketing: ${marketingVideos}`;
          
          await existingEntry.save();
          results.entriesUpdated++;
        } else {
          // Create new entry
          await Entry.create({
            userId: user._id,
            date: entryDate,
            courseVideos,
            marketingVideos,
            totalVideos,
            targetVideos,
            videoType,
            videosCompleted: totalVideos, // Legacy field
            productivityScore,
            notes: `Imported from spreadsheet - Production: ${courseVideos}, Marketing: ${marketingVideos}`,
            mood: 'good',
            energyLevel: 3,
            challenges: [],
            achievements: [],
            isCompleted: true
          });

          results.entriesCreated++;
        }

        // Update user's total video counts
        await User.findByIdAndUpdate(user._id, {
          $inc: {
            courseVideos: courseVideos,
            marketingVideos: marketingVideos,
            totalVideos: totalVideos
          }
        });

      } catch (error) {
        results.errors.push(`Failed to process entry for ${entry.teamMember} on ${entry.date}: ${error}`);
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
