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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';
    const memberId = searchParams.get('memberId') || 'all';

    // Find the team for the authenticated user
    let team;
    if (decoded.role === 'team_manager') {
      team = await Team.findOne({ teamManager: decoded.userId });
    } else if (decoded.role === 'editor') {
      const user = await User.findById(decoded.userId);
      team = await Team.findById(user?.teamId);
    } else if (decoded.role === 'admin') {
      // Admin can view any team, for now return all data
      team = null;
    }

    if (!team && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    let chartData: any[] = [];
    const now = new Date();

    if (period === 'week') {
      // This week (Monday to Friday)
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(now.getDate() - daysToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 4); // Friday
      endOfWeek.setHours(23, 59, 59, 999);

      const query: any = {
        date: { $gte: startOfWeek, $lte: endOfWeek }
      };

      if (team) {
        query.userId = { $in: team.members };
      }
      if (memberId !== 'all') {
        query.userId = memberId;
      }

      const entries = await Entry.find(query).populate('userId', 'name');
      
      // Group by date and calculate daily totals
      const dailyData: { [key: string]: number } = {};
      for (let i = 0; i < 5; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        dailyData[dateStr] = 0;
      }

      entries.forEach(entry => {
        const dateStr = new Date(entry.date).toISOString().split('T')[0];
        if (dailyData[dateStr] !== undefined) {
          dailyData[dateStr] += (entry.totalVideos || 0);
        }
      });

      chartData = Object.entries(dailyData).map(([date, value]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        value
      }));

    } else if (period === 'last-week') {
      // Last week (Monday to Friday)
      const startOfLastWeek = new Date(now);
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfLastWeek.setDate(now.getDate() - daysToMonday - 7);
      startOfLastWeek.setHours(0, 0, 0, 0);

      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 4);
      endOfLastWeek.setHours(23, 59, 59, 999);

      const query: any = {
        date: { $gte: startOfLastWeek, $lte: endOfLastWeek }
      };

      if (team) {
        query.userId = { $in: team.members };
      }
      if (memberId !== 'all') {
        query.userId = memberId;
      }

      const entries = await Entry.find(query).populate('userId', 'name');
      
      const dailyData: { [key: string]: number } = {};
      for (let i = 0; i < 5; i++) {
        const date = new Date(startOfLastWeek);
        date.setDate(startOfLastWeek.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        dailyData[dateStr] = 0;
      }

      entries.forEach(entry => {
        const dateStr = new Date(entry.date).toISOString().split('T')[0];
        if (dailyData[dateStr] !== undefined) {
          dailyData[dateStr] += (entry.totalVideos || 0);
        }
      });

      chartData = Object.entries(dailyData).map(([date, value]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        value
      }));

    } else if (period === 'last-3-weeks') {
      // Last 3 weeks
      const startOfPeriod = new Date(now);
      startOfPeriod.setDate(now.getDate() - 21);
      startOfPeriod.setHours(0, 0, 0, 0);

      const query: any = {
        date: { $gte: startOfPeriod }
      };

      if (team) {
        query.userId = { $in: team.members };
      }
      if (memberId !== 'all') {
        query.userId = memberId;
      }

      const entries = await Entry.find(query).populate('userId', 'name');
      
      // Group by week
      const weeklyData: { [key: string]: number } = {};
      for (let week = 0; week < 3; week++) {
        const weekStart = new Date(startOfPeriod);
        weekStart.setDate(startOfPeriod.getDate() + (week * 7));
        const weekLabel = `Week ${week + 1}`;
        weeklyData[weekLabel] = 0;
      }

      entries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const weekDiff = Math.floor((entryDate.getTime() - startOfPeriod.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (weekDiff >= 0 && weekDiff < 3) {
          const weekLabel = `Week ${weekDiff + 1}`;
          weeklyData[weekLabel] += (entry.totalVideos || 0);
        }
      });

      chartData = Object.entries(weeklyData).map(([week, value]) => ({
        date: week,
        value
      }));

    } else if (period === 'month') {
      // This month (weeks 1-5)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const query: any = {
        date: { $gte: startOfMonth, $lte: endOfMonth }
      };

      if (team) {
        query.userId = { $in: team.members };
      }
      if (memberId !== 'all') {
        query.userId = memberId;
      }

      const entries = await Entry.find(query).populate('userId', 'name');
      
      // Group by week
      const weeklyData: { [key: string]: number } = {};
      for (let week = 1; week <= 5; week++) {
        weeklyData[`Week ${week}`] = 0;
      }

      entries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const weekOfMonth = Math.ceil((entryDate.getDate() + startOfMonth.getDay()) / 7);
        if (weekOfMonth >= 1 && weekOfMonth <= 5) {
          weeklyData[`Week ${weekOfMonth}`] += (entry.totalVideos || 0);
        }
      });

      chartData = Object.entries(weeklyData).map(([week, value]) => ({
        date: week,
        value
      }));

    } else if (period === 'quarter') {
      // This quarter (3 months)
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
      const endOfQuarter = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);

      const query: any = {
        date: { $gte: startOfQuarter, $lte: endOfQuarter }
      };

      if (team) {
        query.userId = { $in: team.members };
      }
      if (memberId !== 'all') {
        query.userId = memberId;
      }

      const entries = await Entry.find(query).populate('userId', 'name');
      
      // Group by month
      const monthlyData: { [key: string]: number } = {};
      for (let month = 0; month < 3; month++) {
        const monthDate = new Date(startOfQuarter);
        monthDate.setMonth(startOfQuarter.getMonth() + month);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
        monthlyData[monthName] = 0;
      }

      entries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const monthName = entryDate.toLocaleDateString('en-US', { month: 'short' });
        if (monthlyData[monthName] !== undefined) {
          monthlyData[monthName] += (entry.totalVideos || 0);
        }
      });

      chartData = Object.entries(monthlyData).map(([month, value]) => ({
        date: month,
        value
      }));

    } else if (period === 'year') {
      // This year (12 months)
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);

      const query: any = {
        date: { $gte: startOfYear, $lte: endOfYear }
      };

      if (team) {
        query.userId = { $in: team.members };
      }
      if (memberId !== 'all') {
        query.userId = memberId;
      }

      const entries = await Entry.find(query).populate('userId', 'name');
      
      // Group by month
      const monthlyData: { [key: string]: number } = {};
      for (let month = 0; month < 12; month++) {
        const monthDate = new Date(now.getFullYear(), month, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
        monthlyData[monthName] = 0;
      }

      entries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const monthName = entryDate.toLocaleDateString('en-US', { month: 'short' });
        if (monthlyData[monthName] !== undefined) {
          monthlyData[monthName] += (entry.totalVideos || 0);
        }
      });

      chartData = Object.entries(monthlyData).map(([month, value]) => ({
        date: month,
        value
      }));
    }

    // Get team statistics with video breakdown
    let teamStats = null;
    if (team) {
      const teamMembers = await User.find({ teamId: team._id }).select('-password');
      
      const totalMembers = teamMembers.length;
      const totalCourseVideos = teamMembers.reduce((sum, member) => sum + (member.courseVideos || 0), 0);
      const totalMarketingVideos = teamMembers.reduce((sum, member) => sum + (member.marketingVideos || 0), 0);
      const totalVideos = teamMembers.reduce((sum, member) => sum + (member.totalVideos || 0), 0);
      const averageProductivity = totalMembers > 0 ? 
        Math.round(teamMembers.reduce((sum, member) => sum + (member.productivityScore || 0), 0) / totalMembers) : 0;
      
      // Calculate weekly and monthly progress
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(now.getDate() - daysToMonday);
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
      
      const weeklyVideos = weeklyEntries.reduce((sum, entry) => sum + (entry.totalVideos || 0), 0);
      const monthlyVideos = monthlyEntries.reduce((sum, entry) => sum + (entry.totalVideos || 0), 0);
      
      const weeklyProgress = team.goals?.weeklyTarget > 0 ? Math.round((weeklyVideos / team.goals.weeklyTarget) * 100) : 0;
      const monthlyProgress = team.goals?.monthlyTarget > 0 ? Math.round((monthlyVideos / team.goals.monthlyTarget) * 100) : 0;
      
      teamStats = {
        totalMembers,
        totalVideos,
        totalCourseVideos,
        totalMarketingVideos,
        averageProductivity,
        weeklyProgress,
        monthlyProgress
      };
    }

    return NextResponse.json({
      period,
      memberId,
      chartData,
      teamStats
    });

  } catch (error) {
    console.error('Error fetching team analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
