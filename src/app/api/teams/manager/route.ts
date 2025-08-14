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
    if (!decoded || decoded.role !== 'team_manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Find the team where this user is the team manager
    const team = await Team.findOne({ teamManager: decoded.userId }).populate('members');
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Get team members with their details
    const teamMembers = await User.find({ teamId: team._id }).select('-password');
    
    // Get recent entries for the team
    const recentEntries = await Entry.find({ 
      userId: { $in: team.members } 
    })
    .populate('userId', 'name')
    .sort({ date: -1 })
    .limit(50)
    .lean();

    // Calculate team statistics
    const totalMembers = teamMembers.length;
    const activeMembers = teamMembers.filter(member => member.isActive).length;
    
    // Calculate average productivity
    const totalProductivity = teamMembers.reduce((sum, member) => sum + (member.productivityScore || 0), 0);
    const averageProductivity = totalMembers > 0 ? Math.round(totalProductivity / totalMembers) : 0;
    
    // Calculate total videos completed
    const totalVideosCompleted = teamMembers.reduce((sum, member) => sum + (member.videosCompleted || 0), 0);
    
    // Calculate weekly and monthly progress
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const weeklyEntries = await Entry.find({
      userId: { $in: team.members },
      date: { $gte: startOfWeek }
    });
    
    const monthlyEntries = await Entry.find({
      userId: { $in: team.members },
      date: { $gte: startOfMonth }
    });
    
    const weeklyVideos = weeklyEntries.reduce((sum, entry) => sum + entry.videosCompleted, 0);
    const monthlyVideos = monthlyEntries.reduce((sum, entry) => sum + entry.videosCompleted, 0);
    
    const weeklyProgress = team.goals.weeklyTarget > 0 ? Math.round((weeklyVideos / team.goals.weeklyTarget) * 100) : 0;
    const monthlyProgress = team.goals.monthlyTarget > 0 ? Math.round((monthlyVideos / team.goals.monthlyTarget) * 100) : 0;

    // Format entries for response
    const formattedEntries = recentEntries.map(entry => ({
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

    // Format team members for response
    const formattedMembers = teamMembers.map(member => ({
      _id: member._id,
      name: member.name,
      email: member.email,
      position: member.position || '',
      department: member.department || '',
      employeeId: member.employeeId || '',
      avatar: member.avatar,
      skills: member.skills || [],
      joinDate: member.joinDate || member.createdAt,
      isActive: member.isActive,
      lastLogin: member.lastLogin,
      productivityScore: member.productivityScore || 0,
      videosCompleted: member.videosCompleted || 0,
      targetVideos: member.targetVideos || 15
    }));

    const teamStats = {
      totalMembers,
      activeMembers,
      averageProductivity,
      totalVideosCompleted,
      weeklyProgress,
      monthlyProgress,
      teamTarget: team.goals.weeklyTarget,
      teamAchievement: weeklyVideos
    };

    return NextResponse.json({
      members: formattedMembers,
      stats: teamStats,
      recentEntries: formattedEntries,
      team: {
        id: team._id,
        name: team.name,
        code: team.code,
        color: team.color,
        description: team.description
      }
    });

  } catch (error) {
    console.error('Error fetching team manager data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
