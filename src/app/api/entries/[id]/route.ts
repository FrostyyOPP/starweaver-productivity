import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Entry from '@/lib/models/Entry';
import { verifyToken } from '@/lib/jwt';

// GET /api/entries/[id] - Get a specific entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const entry = await Entry.findOne({
      _id: params.id,
      userId: decoded.userId
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ entry });

  } catch (error: any) {
    console.error('Get entry error:', error);
    
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

// PUT /api/entries/[id] - Update a specific entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      shiftStart,
      shiftEnd,
      videosCompleted,
      targetVideos,
      notes,
      mood,
      energyLevel,
      challenges,
      achievements,
      isCompleted
    } = body;

    // Find entry and verify ownership
    const entry = await Entry.findOne({
      _id: params.id,
      userId: decoded.userId
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (shiftStart !== undefined) entry.shiftStart = new Date(shiftStart);
    if (shiftEnd !== undefined) entry.shiftEnd = new Date(shiftEnd);
    if (videosCompleted !== undefined) entry.videosCompleted = videosCompleted;
    if (targetVideos !== undefined) entry.targetVideos = targetVideos;
    if (notes !== undefined) entry.notes = notes;
    if (mood !== undefined) entry.mood = mood;
    if (energyLevel !== undefined) entry.energyLevel = energyLevel;
    if (challenges !== undefined) entry.challenges = challenges;
    if (achievements !== undefined) entry.achievements = achievements;
    if (isCompleted !== undefined) entry.isCompleted = isCompleted;

    await entry.save();

    return NextResponse.json({
      message: 'Entry updated successfully',
      entry
    });

  } catch (error: any) {
    console.error('Update entry error:', error);
    
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

// DELETE /api/entries/[id] - Delete a specific entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find entry and verify ownership
    const entry = await Entry.findOne({
      _id: params.id,
      userId: decoded.userId
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    await Entry.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: 'Entry deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete entry error:', error);
    
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
