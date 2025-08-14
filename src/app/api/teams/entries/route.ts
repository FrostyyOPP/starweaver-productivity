import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Team from '@/lib/models/Team';
import Entry from '@/lib/models/Entry';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Find the team for the authenticated user
    let team;
    if (decoded.role === 'team_manager') {
      team = await Team.findOne({ teamManager: decoded.userId });
    } else if (decoded.role === 'editor') {
      const user = await User.findById(decoded.userId);
      team = await Team.findById(user?.teamId);
    } else if (decoded.role === 'admin') {
      // Admin can view all entries
      team = null;
    }

    if (!team && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Build query for entries
    const query: any = {};
    if (team) {
      query.userId = { $in: team.members };
    }

    // Get entries with user information
    const entries = await Entry.find(query)
      .populate('userId', 'name email')
      .sort({ date: -1 })
      .limit(100)
      .lean();

    // Format entries for response
    const formattedEntries = entries.map(entry => ({
      _id: entry._id,
      userId: entry.userId._id || entry.userId,
      userName: entry.userId.name || 'Unknown User',
      date: entry.date,
      videosCompleted: entry.videosCompleted,
      targetVideos: entry.targetVideos,
      productivityScore: entry.productivityScore,
      videoCategory: entry.videoCategory,
      notes: entry.notes
    }));

    return NextResponse.json(formattedEntries);

  } catch (error) {
    console.error('Error fetching team entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
