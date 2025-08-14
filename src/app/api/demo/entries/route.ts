import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Entry from '@/lib/models/Entry';

// POST: Add demo entries for specific accounts
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Demo entry data
    const demoEntries = [
      // Ranjodh's entries (last 7 days)
      {
        email: 'ranjodh@gmail.com',
        entries: [
          {
            date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
            shiftStart: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // 9 AM
            shiftEnd: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000), // 5 PM
            videosCompleted: 4,
            videoCategory: 'course',
            targetVideos: 3,
            productivityScore: 95,
            mood: 'excellent',
            energyLevel: 5,
            challenges: 'Had to learn new software',
            achievements: 'Completed ahead of schedule',
            totalHours: 8,
            remarks: 'Great day! Learned new video editing techniques.'
          },
          {
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            shiftStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 AM
            shiftEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 4 PM
            videosCompleted: 3,
            videoCategory: 'course',
            targetVideos: 3,
            productivityScore: 88,
            mood: 'good',
            energyLevel: 4,
            challenges: 'Equipment malfunction',
            achievements: 'Fixed technical issues quickly',
            totalHours: 8,
            remarks: 'Had some technical difficulties but managed to complete all targets.'
          },
          {
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            shiftStart: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // 9 AM
            shiftEnd: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // 6 PM
            videosCompleted: 5,
            videoCategory: 'course',
            targetVideos: 3,
            productivityScore: 100,
            mood: 'excellent',
            energyLevel: 5,
            challenges: 'None',
            achievements: 'Exceeded daily target by 2 videos',
            totalHours: 9,
            remarks: 'Perfect day! Everything went smoothly and exceeded expectations.'
          },
          {
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            shiftStart: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 AM
            shiftEnd: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 4 PM
            videosCompleted: 0.5,
            videoCategory: 'marketing',
            targetVideos: 0.5,
            productivityScore: 75,
            mood: 'good',
            energyLevel: 3,
            challenges: 'Creative block with marketing content',
            achievements: 'Started new marketing campaign',
            totalHours: 8,
            remarks: 'Working on marketing videos. Creative process takes time but making progress.'
          },
          {
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            shiftStart: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // 9 AM
            shiftEnd: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000), // 5 PM
            videosCompleted: 0.5,
            videoCategory: 'marketing',
            targetVideos: 0.5,
            productivityScore: 80,
            mood: 'good',
            energyLevel: 4,
            challenges: 'Complex marketing concept',
            achievements: 'Completed marketing video sequence',
            totalHours: 8,
            remarks: 'Finished the marketing video sequence. Ready for review.'
          },
          {
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            shiftStart: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 AM
            shiftEnd: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 4 PM
            videosCompleted: 3,
            videoCategory: 'course',
            targetVideos: 3,
            productivityScore: 92,
            mood: 'good',
            energyLevel: 4,
            challenges: 'Tight deadline',
            achievements: 'Met deadline with quality work',
            totalHours: 8,
            remarks: 'Met the deadline successfully. Quality maintained under pressure.'
          },
          {
            date: new Date(), // Today
            shiftStart: new Date(Date.now() + 9 * 60 * 60 * 1000), // 9 AM
            shiftEnd: new Date(Date.now() + 17 * 60 * 60 * 1000), // 5 PM
            videosCompleted: 2,
            videoCategory: 'course',
            targetVideos: 3,
            productivityScore: 70,
            mood: 'average',
            energyLevel: 3,
            challenges: 'Feeling tired, slow progress',
            achievements: 'Started new course module',
            totalHours: 8,
            remarks: 'Feeling a bit tired today. Will pick up pace tomorrow.'
          }
        ]
      },
      // Sachin's entries (last 7 days)
      {
        email: 'sachin@gmail.com',
        entries: [
          {
            date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
            shiftStart: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 AM
            shiftEnd: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 4 PM
            videosCompleted: 3,
            videoCategory: 'course',
            targetVideos: 3,
            productivityScore: 85,
            mood: 'good',
            energyLevel: 4,
            challenges: 'New project requirements',
            achievements: 'Understood new project scope',
            totalHours: 8,
            remarks: 'Good start to the new project. Understanding requirements.'
          },
          {
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            shiftStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // 9 AM
            shiftEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000), // 5 PM
            videosCompleted: 4,
            videoCategory: 'course',
            targetVideos: 3,
            productivityScore: 95,
            mood: 'excellent',
            energyLevel: 5,
            challenges: 'None',
            achievements: 'Exceeded target by 1 video',
            totalHours: 8,
            remarks: 'Excellent productivity today! Everything flowing smoothly.'
          },
          {
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            shiftStart: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 AM
            shiftEnd: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 4 PM
            videosCompleted: 0,
            videoCategory: 'leave',
            targetVideos: -3,
            productivityScore: 0,
            mood: 'good',
            energyLevel: 1,
            challenges: 'Personal day off',
            achievements: 'Rest and recharge',
            totalHours: 0,
            remarks: 'Personal day off. Back tomorrow with renewed energy.'
          },
          {
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            shiftStart: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 AM
            shiftEnd: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 4 PM
            videosCompleted: 3,
            videoCategory: 'course',
            targetVideos: 3,
            productivityScore: 90,
            mood: 'good',
            energyLevel: 4,
            challenges: 'Getting back into routine',
            achievements: 'Back to full productivity',
            totalHours: 8,
            remarks: 'Back from leave. Good to be back in the groove.'
          },
          {
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            shiftStart: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // 9 AM
            shiftEnd: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000), // 5 PM
            videosCompleted: 3,
            videoCategory: 'course',
            targetVideos: 3,
            productivityScore: 88,
            mood: 'good',
            energyLevel: 4,
            challenges: 'Complex technical content',
            achievements: 'Mastered difficult concepts',
            totalHours: 8,
            remarks: 'Challenging technical content but made good progress.'
          },
          {
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            shiftStart: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 AM
            shiftEnd: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 4 PM
            videosCompleted: 2,
            videoCategory: 'course',
            targetVideos: 3,
            productivityScore: 75,
            mood: 'average',
            energyLevel: 3,
            challenges: 'Feeling under the weather',
            achievements: 'Completed 2 videos despite feeling unwell',
            totalHours: 8,
            remarks: 'Not feeling 100% but managed to complete some work.'
          },
          {
            date: new Date(), // Today
            shiftStart: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 AM
            shiftEnd: new Date(Date.now() + 16 * 60 * 60 * 1000), // 4 PM
            videosCompleted: 3,
            videoCategory: 'course',
            targetVideos: 3,
            productivityScore: 90,
            mood: 'good',
            energyLevel: 4,
            challenges: 'None',
            achievements: 'Met daily target',
            totalHours: 8,
            remarks: 'Feeling better today. Met all targets successfully.'
          }
        ]
      }
    ];

    console.log('🚀 Starting to add demo entries...');
    const results = [];
    
    for (const userData of demoEntries) {
      // Find the user
      const user = await User.findOne({ email: userData.email });
      if (!user) {
        console.log(`❌ User with email ${userData.email} not found`);
        results.push({ email: userData.email, status: 'User not found' });
        continue;
      }
      
      console.log(`\n👤 Adding entries for ${user.name} (${user.email})...`);
      let addedCount = 0;
      let skippedCount = 0;
      
      // Add entries for this user
      for (const entryData of userData.entries) {
        // Check if entry already exists for this date
        const existingEntry = await Entry.findOne({
          user: user._id,
          date: {
            $gte: new Date(entryData.date.setHours(0, 0, 0, 0)),
            $lt: new Date(entryData.date.setHours(23, 59, 59, 999))
          }
        });
        
        if (existingEntry) {
          console.log(`  ⏭️  Entry for ${entryData.date.toDateString()} already exists, skipping...`);
          skippedCount++;
          continue;
        }
        
        // Create new entry
        const entry = new Entry({
          user: user._id,
          ...entryData
        });
        
        await entry.save();
        console.log(`  ✅ Added entry for ${entryData.date.toDateString()}: ${entryData.videosCompleted} videos (${entryData.videoCategory})`);
        addedCount++;
      }
      
      results.push({ 
        email: userData.email, 
        status: 'Success', 
        added: addedCount, 
        skipped: skippedCount 
      });
    }
    
    console.log('\n🎉 Demo entries added successfully!');
    
    return NextResponse.json({ 
      message: 'Demo entries added successfully',
      results: results
    });
    
  } catch (error: any) {
    console.error('❌ Error adding demo entries:', error);
    return NextResponse.json(
      { error: 'Failed to add demo entries', details: error.message },
      { status: 500 }
    );
  }
}
