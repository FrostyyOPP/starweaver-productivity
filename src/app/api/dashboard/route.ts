import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Entry from '@/lib/models/Entry';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';
import mongoose from 'mongoose';

// GET /api/dashboard - Get dashboard data and statistics
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    // Get query parameters for date range
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // week, month, year
    const includeTeam = searchParams.get('includeTeam') === 'true';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }

    endDate = new Date(now);

    // Get user's entries for the period
    const userEntries = await Entry.find({
      userId: decoded.userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Calculate user stats
    const userStats = {
      entriesCount: userEntries.length,
      totalVideos: userEntries.reduce((sum, entry) => sum + entry.videosCompleted, 0),
      averageProductivity: userEntries.length > 0 
        ? Math.round(userEntries.reduce((sum, entry) => sum + entry.productivityScore, 0) / userEntries.length)
        : 0,
      weeklyProgress: userEntries.length > 0 
        ? Math.round(userEntries.reduce((sum, entry) => sum + entry.videosCompleted, 0) / userEntries.length)
        : 0,
      monthlyProgress: userEntries.length > 0 
        ? Math.round(userEntries.reduce((sum, entry) => sum + entry.videosCompleted, 0) / userEntries.length)
        : 0
    };

    // Get user's video breakdown from User model
    const user = await User.findById(decoded.userId);
    const videoBreakdown = {
      courseVideos: user?.courseVideos || 0,
      marketingVideos: user?.marketingVideos || 0,
      totalVideos: user?.totalVideos || 0,
      targetVideos: user?.targetVideos || 50
    };

    // Get recent entries (last 5)
    const recentEntries = await Entry.find({
      userId: decoded.userId
    })
    .sort({ date: -1 })
    .limit(5)
    .lean();

    // Get productivity trends
    const productivityTrends = await Entry.aggregate([
      {
        $match: {
          userId: new (require('mongoose').Types.ObjectId)(decoded.userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          dailyVideos: { $sum: "$videosCompleted" },
          averageProductivity: { $avg: "$productivityScore" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get mood and energy insights
    const moodInsights = await Entry.aggregate([
      {
        $match: {
          userId: new (require('mongoose').Types.ObjectId)(decoded.userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$mood",
          count: { $sum: 1 },
          avgProductivity: { $avg: "$productivityScore" }
        }
      }
    ]);

    const energyInsights = await Entry.aggregate([
      {
        $match: {
          userId: new (require('mongoose').Types.ObjectId)(decoded.userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$energyLevel",
          count: { $sum: 1 },
          avgProductivity: { $avg: "$productivityScore" }
        }
      }
    ]);

    // Get team data if requested
    let teamStats = null;
    let systemStats = null;
    
    if (includeTeam && decoded.role === 'admin') {
      // Get all users for system stats
      const allUsers = await User.find({ isActive: true });
      const allUserIds = allUsers.map(user => user._id);
      
      // Get all entries for system stats
      const allEntries = await Entry.find({
        userId: { $in: allUserIds },
        date: { $gte: startDate, $lte: endDate }
      });

      // Calculate system-wide statistics
      systemStats = {
        totalUsers: allUsers.length,
        totalEntries: allEntries.length,
        totalVideos: allEntries.reduce((sum, entry) => sum + entry.videosCompleted, 0),
        averageProductivity: allEntries.length > 0
          ? Math.round(allEntries.reduce((sum, entry) => sum + entry.productivityScore, 0) / allEntries.length)
          : 0,
        usersByRole: await User.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: "$role", count: { $sum: 1 } } }
        ])
      };

      // Get team members (excluding admin)
      const teamMembers = await User.find({ 
        role: { $in: ['editor', 'viewer', 'manager'] },
        isActive: true 
      });
      const teamMemberIds = teamMembers.map(member => member._id);

      const teamEntries = await Entry.find({
        userId: { $in: teamMemberIds },
        date: { $gte: startDate, $lte: endDate }
      });

      // Get detailed team member performance
      const teamMemberPerformance = await Entry.aggregate([
        {
          $match: {
            userId: { $in: teamMemberIds.map(id => new mongoose.Types.ObjectId(id)) },
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: "$userId",
            totalVideos: { $sum: "$videosCompleted" },
            totalEntries: { $sum: 1 },
            averageProductivity: { $avg: "$productivityScore" },
            lastEntry: { $max: "$date" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            _id: 1,
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
            totalVideos: 1,
            totalEntries: 1,
            averageProductivity: { $round: ["$averageProductivity", 1] },
            lastEntry: 1
          }
        },
        {
          $sort: { totalVideos: -1 }
        }
      ]);

      // Get team video breakdown from User model
      const teamVideoBreakdown = await User.aggregate([
        { $match: { _id: { $in: teamMemberIds } } },
        {
          $group: {
            _id: null,
            totalCourseVideos: { $sum: { $ifNull: ["$courseVideos", 0] } },
            totalMarketingVideos: { $sum: { $ifNull: ["$marketingVideos", 0] } },
            totalVideos: { $sum: { $ifNull: ["$totalVideos", 0] } },
            averageProductivity: { $avg: { $ifNull: ["$productivityScore", 0] } }
          }
        }
      ]);

      teamStats = {
        totalMembers: teamMembers.length,
        totalVideos: teamVideoBreakdown[0]?.totalVideos || 0,
        totalCourseVideos: teamVideoBreakdown[0]?.totalCourseVideos || 0,
        totalMarketingVideos: teamVideoBreakdown[0]?.totalMarketingVideos || 0,
        averageProductivity: Math.round(teamVideoBreakdown[0]?.averageProductivity || 0),
        memberPerformance: teamMemberPerformance,
        topPerformers: teamMemberPerformance.slice(0, 5)
      };
    }

    // Get goals and targets
    const currentGoals = {
      daily: 15,
      weekly: 90,
      monthly: 360
    };

    const goalProgress = {
      daily: {
        target: currentGoals.daily,
        achieved: userEntries.length > 0 ? userEntries[userEntries.length - 1].videosCompleted : 0,
        percentage: userEntries.length > 0 
          ? Math.round((userEntries[userEntries.length - 1].videosCompleted / currentGoals.daily) * 100)
          : 0
      },
      weekly: {
        target: currentGoals.weekly,
        achieved: userStats.totalVideos,
        percentage: Math.round((userStats.totalVideos / currentGoals.weekly) * 100)
      },
      monthly: {
        target: currentGoals.monthly,
        achieved: userStats.totalVideos,
        percentage: Math.round((userStats.totalVideos / currentGoals.monthly) * 100)
      }
    };

    return NextResponse.json({
      period,
      dateRange: { startDate, endDate },
      userStats,
      goalProgress,
      recentEntries,
      productivityTrends,
      insights: {
        mood: moodInsights,
        energy: energyInsights
      },
      videoBreakdown,
      teamStats,
      systemStats
    });

  } catch (error: any) {
    console.error('Dashboard error:', error);
    
    if (error.message === 'Invalid or expired token') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
