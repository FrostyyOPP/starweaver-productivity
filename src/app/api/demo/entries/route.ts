import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Entry from '@/lib/models/Entry';

// POST: Add demo entries for specific accounts
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Find users
    const ranjodhUser = await User.findOne({ email: 'ranjodh@gmail.com' });
    const sachinUser = await User.findOne({ email: 'sachin@gmail.com' });

    if (!ranjodhUser || !sachinUser) {
      return NextResponse.json(
        { error: 'Demo users not found in the database' },
        { status: 404 }
      );
    }

    const now = new Date();
    let ranjodhAdded = 0;
    let ranjodhSkipped = 0;
    let sachinAdded = 0;
    let sachinSkipped = 0;

    // Demo entry data for ranjodh@gmail.com
    const ranjodhEntries = [
      {
        date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        videosCompleted: 3,
        targetVideos: 15,
        productivityScore: 20,
        mood: 'good',
        energyLevel: 4,
        challenges: ['Technical difficulties'],
        achievements: ['Completed 3 videos'],
        notes: 'Good progress on course content'
      },
      {
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        videosCompleted: 4,
        targetVideos: 15,
        productivityScore: 27,
        mood: 'excellent',
        energyLevel: 5,
        challenges: [],
        achievements: ['Exceeded daily target'],
        notes: 'Excellent energy and focus today'
      },
      {
        date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        videosCompleted: 2,
        targetVideos: 15,
        productivityScore: 13,
        mood: 'average',
        energyLevel: 3,
        challenges: ['Low motivation'],
        achievements: ['Completed basic tasks'],
        notes: 'Struggled with focus but got work done'
      },
      {
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        videosCompleted: 5,
        targetVideos: 15,
        productivityScore: 33,
        mood: 'excellent',
        energyLevel: 5,
        challenges: [],
        achievements: ['Record productivity day'],
        notes: 'Amazing productivity and energy levels'
      },
      {
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        videosCompleted: 0,
        targetVideos: 15,
        productivityScore: 0,
        mood: 'poor',
        energyLevel: 1,
        challenges: ['Sick day'],
        achievements: [],
        notes: 'On leave due to illness'
      },
      {
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        videosCompleted: 3,
        targetVideos: 15,
        productivityScore: 20,
        mood: 'good',
        energyLevel: 4,
        challenges: ['Back to work'],
        achievements: ['Recovered well'],
        notes: 'Good return to productivity'
      },
      {
        date: now,
        videosCompleted: 4,
        targetVideos: 15,
        productivityScore: 27,
        mood: 'excellent',
        energyLevel: 5,
        challenges: [],
        achievements: ['Strong finish to week'],
        notes: 'Excellent end to the week'
      }
    ];

    // Demo entry data for sachin@gmail.com
    const sachinEntries = [
      {
        date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        videosCompleted: 3,
        targetVideos: 15,
        productivityScore: 20,
        mood: 'good',
        energyLevel: 4,
        challenges: ['New project requirements'],
        achievements: ['Understood new project scope'],
        notes: 'Good start to the new project. Understanding requirements.'
      },
      {
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        videosCompleted: 4,
        targetVideos: 15,
        productivityScore: 27,
        mood: 'excellent',
        energyLevel: 5,
        challenges: [],
        achievements: ['Exceeded target by 1 video'],
        notes: 'Excellent productivity today! Everything flowing smoothly.'
      },
      {
        date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        videosCompleted: 0,
        targetVideos: 15,
        productivityScore: 0,
        mood: 'good',
        energyLevel: 1,
        challenges: ['Personal day off'],
        achievements: ['Rest and recharge'],
        notes: 'Personal day off. Back tomorrow with renewed energy.'
      },
      {
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        videosCompleted: 3,
        targetVideos: 15,
        productivityScore: 20,
        mood: 'good',
        energyLevel: 4,
        challenges: ['Getting back into routine'],
        achievements: ['Back to full productivity'],
        notes: 'Back from leave. Good to be back in the groove.'
      },
      {
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        videosCompleted: 3,
        targetVideos: 15,
        productivityScore: 20,
        mood: 'good',
        energyLevel: 4,
        challenges: ['Complex technical content'],
        achievements: ['Mastered difficult concepts'],
        notes: 'Challenging technical content but made good progress.'
      },
      {
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        videosCompleted: 2,
        targetVideos: 15,
        productivityScore: 13,
        mood: 'average',
        energyLevel: 3,
        challenges: ['Feeling under the weather'],
        achievements: ['Completed 2 videos despite feeling unwell'],
        notes: 'Not feeling 100% but managed to complete some work.'
      },
      {
        date: now,
        videosCompleted: 3,
        targetVideos: 15,
        productivityScore: 20,
        mood: 'good',
        energyLevel: 4,
        challenges: [],
        achievements: ['Met daily target'],
        notes: 'Feeling better today. Met all targets successfully.'
      }
    ];

    // Add entries for ranjodh@gmail.com
    for (const entryData of ranjodhEntries) {
      const existingEntry = await Entry.findOne({
        userId: ranjodhUser._id,
        date: entryData.date
      });

      if (!existingEntry) {
        const entry = new Entry({
          userId: ranjodhUser._id,
          ...entryData
        });
        await entry.save();
        ranjodhAdded++;
      } else {
        ranjodhSkipped++;
      }
    }

    // Add entries for sachin@gmail.com
    for (const entryData of sachinEntries) {
      const existingEntry = await Entry.findOne({
        userId: sachinUser._id,
        date: entryData.date
      });

      if (!existingEntry) {
        const entry = new Entry({
          userId: sachinUser._id,
          ...entryData
        });
        await entry.save();
        sachinAdded++;
      } else {
        sachinSkipped++;
      }
    }
    
    return NextResponse.json({ 
      message: 'Demo entries added successfully',
      results: [
        { email: 'ranjodh@gmail.com', status: 'Success', added: ranjodhAdded, skipped: ranjodhSkipped },
        { email: 'sachin@gmail.com', status: 'Success', added: sachinAdded, skipped: sachinSkipped }
      ]
    });
    
  } catch (error: any) {
    console.error('❌ Error adding demo entries:', error);
    return NextResponse.json(
      { error: 'Failed to add demo entries', details: error.message },
      { status: 500 }
    );
  }
}
