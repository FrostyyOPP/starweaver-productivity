import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import Entry from '@/lib/models/Entry';
import User from '@/lib/models/User';

// POST: Add multiple entries at once
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { entries } = await request.json();
    
    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: 'Entries array is required' }, { status: 400 });
    }

    // Get user details
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const results = [];
    let addedCount = 0;
    let skippedCount = 0;

    for (const entryData of entries) {
      try {
        // Check if entry already exists for this date
        const existingEntry = await Entry.findOne({
          user: decoded.userId,
          date: new Date(entryData.date)
        });
        
        if (existingEntry) {
          results.push({ 
            date: entryData.date, 
            status: 'skipped', 
            reason: 'Entry already exists for this date' 
          });
          skippedCount++;
          continue;
        }

        // Create new entry
        const entry = new Entry({
          user: decoded.userId,
          date: new Date(entryData.date),
          shiftStart: new Date(entryData.shiftStart),
          shiftEnd: new Date(entryData.shiftEnd),
          videosCompleted: entryData.videosCompleted,
          videoCategory: entryData.videoCategory || 'course',
          targetVideos: entryData.targetVideos || 3,
          productivityScore: entryData.productivityScore || 0,
          mood: entryData.mood || 'good',
          energyLevel: entryData.energyLevel || 'medium',
          challenges: entryData.challenges || [],
          achievements: entryData.achievements || [],
          totalHours: entryData.totalHours || 8,
          remarks: entryData.notes || entryData.remarks || ''
        });

        await entry.save();
        
        results.push({ 
          date: entryData.date, 
          status: 'added', 
          entryId: entry._id 
        });
        addedCount++;
        
      } catch (error: any) {
        results.push({ 
          date: entryData.date, 
          status: 'error', 
          error: error.message 
        });
      }
    }

    return NextResponse.json({ 
      message: 'Bulk entries processed successfully',
      summary: {
        total: entries.length,
        added: addedCount,
        skipped: skippedCount,
        errors: results.filter(r => r.status === 'error').length
      },
      results: results
    });
    
  } catch (error: any) {
    console.error('Bulk entries error:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk entries', details: error.message },
      { status: 500 }
    );
  }
}
