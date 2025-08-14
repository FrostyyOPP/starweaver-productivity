import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';

// GET /api/users - Get all users (admin only)
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

    // Only admins can access all users
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query
    const query: any = {};
    if (role) query.role = role;
    if (isActive !== null) query.isActive = isActive === 'true';

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);

    // Get user statistics
    const userStats = await User.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactiveUsers: { $sum: { $cond: ['$isActive', 0, 1] } }
        }
      }
    ]);

    // Get role distribution
    const roleDistribution = await User.aggregate([
      { $match: query },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit,
        hasNextPage: page * limit < totalUsers,
        hasPrevPage: page > 1
      },
      statistics: userStats[0] || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 },
      roleDistribution
    });

  } catch (error: any) {
    console.error('Users API error:', error);
    
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
