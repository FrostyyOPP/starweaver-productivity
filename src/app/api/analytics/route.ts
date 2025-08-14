import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Entry from '@/lib/models/Entry';
import Analytics from '@/lib/models/Analytics';
import { verifyToken } from '@/lib/jwt';
import mongoose from 'mongoose';

// GET /api/analytics - Get user's analytics data
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // week, month, year
    const includeTrends = searchParams.get('includeTrends') === 'true';
    const includeInsights = searchParams.get('includeInsights') === 'true';

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

    if (userEntries.length === 0) {
      return NextResponse.json({
        period,
        dateRange: { startDate, endDate },
        message: 'No data available for the specified period',
        analytics: null
      });
    }

    // Calculate user stats
    const userStats = {
      totalEntries: userEntries.length,
      totalVideos: userEntries.reduce((sum, entry) => sum + entry.videosCompleted, 0),
      averageProductivity: userEntries.length > 0 
        ? Math.round(userEntries.reduce((sum, entry) => sum + entry.productivityScore, 0) / userEntries.length)
        : 0,
      averageMood: userEntries.length > 0 
        ? Math.round(userEntries.reduce((sum, entry) => sum + (entry.mood === 'excellent' ? 4 : entry.mood === 'good' ? 3 : entry.mood === 'average' ? 2 : 1), 0) / userEntries.length)
        : 0,
      averageEnergy: userEntries.length > 0 
        ? Math.round(userEntries.reduce((sum, entry) => sum + entry.energyLevel, 0) / userEntries.length)
        : 0
    };

    // Calculate target achievement
    const totalTarget = userEntries.reduce((sum, entry) => sum + entry.targetVideos, 0);
    const targetAchievement = Math.round((userStats.totalVideos / totalTarget) * 100);

    // Calculate consistency score
    const consistencyScore = Math.round(
      userEntries.filter(entry => entry.productivityScore >= 80).length / userEntries.length * 100
    );

    // Get productivity trends over time
    let productivityTrends = null;
    if (includeTrends) {
              productivityTrends = await Entry.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(decoded.userId),
              date: { $gte: startDate, $lte: endDate }
            }
          },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" }
            },
            dailyVideos: { $sum: "$videosCompleted" },
            averageProductivity: { $avg: "$productivityScore" },
            mood: { $push: "$mood" },
            energyLevel: { $push: "$energyLevel" }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
    }

    // Get mood and energy insights
    let moodInsights = null;
    let energyInsights = null;
    if (includeInsights) {
              moodInsights = await Entry.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(decoded.userId),
              date: { $gte: startDate, $lte: endDate }
            }
          },
        {
          $group: {
            _id: "$mood",
            count: { $sum: 1 },
            avgProductivity: { $avg: "$productivityScore" },
            totalVideos: { $sum: "$videosCompleted" }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

              energyInsights = await Entry.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(decoded.userId),
              date: { $gte: startDate, $lte: endDate }
            }
          },
        {
          $group: {
            _id: "$energyLevel",
            count: { $sum: 1 },
            avgProductivity: { $avg: "$productivityScore" },
            totalVideos: { $sum: "$videosCompleted" }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
    }

    // Calculate improvement rate (compare with previous period)
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    const periodLength = endDate.getTime() - startDate.getTime();
    previousStartDate.setTime(previousStartDate.getTime() - periodLength);
    previousEndDate.setTime(previousEndDate.getTime() - periodLength);

    const previousEntries = await Entry.find({
      userId: decoded.userId,
      date: { $gte: previousStartDate, $lt: startDate }
    });

    let improvementRate = 0;
    if (previousEntries.length > 0) {
      const previousProductivity = previousEntries.reduce((sum, entry) => sum + entry.productivityScore, 0) / previousEntries.length;
      improvementRate = Math.round(
        ((userStats.averageProductivity - previousProductivity) / previousProductivity) * 100
      );
    }

    // Get best and worst performing days
    const bestDay = userEntries.reduce((best, entry) => 
      entry.productivityScore > best.productivityScore ? entry : best
    );
    const worstDay = userEntries.reduce((worst, entry) => 
      entry.productivityScore < worst.productivityScore ? entry : worst
    );

    // Find most productive hour
    const hourPerformance: { [key: number]: number } = {};
    userEntries.forEach(entry => {
      const hour = new Date(entry.shiftStart).getHours();
      hourPerformance[hour] = (hourPerformance[hour] || 0) + entry.productivityScore;
    });

    const mostProductiveHour = Object.entries(hourPerformance).reduce((a, b) => 
      hourPerformance[Number(a[0])] > hourPerformance[Number(b[0])] ? a : b
    )[0];

    // Prepare analytics response
    const analytics = {
      summary: {
        ...userStats,
        targetAchievement,
        consistencyScore,
        improvementRate
      },
      performance: {
        bestDay: {
          date: bestDay.date,
          productivityScore: bestDay.productivityScore,
          videosCompleted: bestDay.videosCompleted
        },
        worstDay: {
          date: worstDay.date,
          productivityScore: worstDay.productivityScore,
          videosCompleted: worstDay.videosCompleted
        },
        mostProductiveHour: Number(mostProductiveHour)
      },
      trends: productivityTrends,
      insights: {
        mood: moodInsights,
        energy: energyInsights
      }
    };

    return NextResponse.json({
      period,
      dateRange: { startDate, endDate },
      analytics
    });

  } catch (error: any) {
    console.error('Analytics error:', error);
    
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
