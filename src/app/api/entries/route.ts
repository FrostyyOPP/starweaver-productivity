import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Entry from '@/lib/models/Entry';
import { verifyToken } from '@/lib/jwt';

// GET /api/entries - Get user's entries with filtering and pagination
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = { userId: decoded.userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [entries, total] = await Promise.all([
      Entry.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Entry.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      entries,
      pagination: {
        currentPage: page,
        totalPages,
        totalEntries: total,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });

  } catch (error: any) {
    console.error('Get entries error:', error);
    
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

// POST /api/entries - Create a new entry
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      date,
      shiftStart,
      shiftEnd,
      videosCompleted,
      targetVideos,
      notes,
      mood,
      energyLevel,
      challenges,
      achievements
    } = body;

    // Validation
    if (!date || !shiftStart || !shiftEnd || videosCompleted === undefined) {
      return NextResponse.json(
        { error: 'Date, shift start, shift end, and videos completed are required' },
        { status: 400 }
      );
    }

    if (videosCompleted < 0) {
      return NextResponse.json(
        { error: 'Videos completed cannot be negative' },
        { status: 400 }
      );
    }

    if (targetVideos && targetVideos < 1) {
      return NextResponse.json(
        { error: 'Target videos must be at least 1' },
        { status: 400 }
      );
    }

    // Check if entry already exists for this date
    const existingEntry = await Entry.findOne({
      userId: decoded.userId,
      date: new Date(date)
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Entry already exists for this date' },
        { status: 409 }
      );
    }

    // Create new entry
    const entry = new Entry({
      userId: decoded.userId,
      date: new Date(date),
      shiftStart: new Date(shiftStart),
      shiftEnd: new Date(shiftEnd),
      videosCompleted,
      targetVideos: targetVideos || 15,
      notes: notes || '',
      mood: mood || 'good',
      energyLevel: energyLevel || 3,
      challenges: challenges || [],
      achievements: achievements || []
    });

    await entry.save();

    return NextResponse.json({
      message: 'Entry created successfully',
      entry
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create entry error:', error);
    
    if (error.message === 'Invalid or expired token') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
