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

    // Calculate user statistics
    const userStats = {
      totalVideos: userEntries.reduce((sum, entry) => sum + entry.videosCompleted, 0),
      totalHours: userEntries.reduce((sum, entry) => sum + entry.totalHours, 0),
      averageProductivity: userEntries.length > 0 
        ? Math.round(userEntries.reduce((sum, entry) => sum + entry.productivityScore, 0) / userEntries.length)
        : 0,
      targetAchievement: userEntries.length > 0
        ? Math.round(userEntries.reduce((sum, entry) => sum + (entry.videosCompleted / entry.targetVideos * 100), 0) / userEntries.length)
        : 0,
      consistencyScore: userEntries.length > 0
        ? Math.round(userEntries.filter(entry => entry.productivityScore >= 80).length / userEntries.length * 100)
        : 0,
      entriesCount: userEntries.length,
      completedEntries: userEntries.filter(entry => entry.isCompleted).length
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
          dailyHours: { $sum: "$totalHours" },
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
    if (includeTeam && decoded.role === 'admin') {
      const teamMembers = await User.find({ role: { $in: ['editor', 'viewer'] } });
      const teamMemberIds = teamMembers.map(member => member._id);

      const teamEntries = await Entry.find({
        userId: { $in: teamMemberIds },
        date: { $gte: startDate, $lte: endDate }
      });

      teamStats = {
        totalMembers: teamMembers.length,
        totalVideos: teamEntries.reduce((sum, entry) => sum + entry.videosCompleted, 0),
        totalHours: teamEntries.reduce((sum, entry) => sum + entry.totalHours, 0),
        averageProductivity: teamEntries.length > 0
          ? Math.round(teamEntries.reduce((sum, entry) => sum + entry.productivityScore, 0) / teamEntries.length)
          : 0,
        topPerformers: await Entry.aggregate([
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
              totalHours: { $sum: "$totalHours" },
              averageProductivity: { $avg: "$productivityScore" }
            }
          },
          {
            $sort: { totalVideos: -1 }
          },
          {
            $limit: 5
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
              name: "$user.name",
              email: "$user.email",
              totalVideos: 1,
              totalHours: 1,
              averageProductivity: 1
            }
          }
        ])
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
      teamStats
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
