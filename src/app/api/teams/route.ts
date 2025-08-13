import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Team from '@/lib/models/Team';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';

// GET /api/teams - Get user's teams
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

    // Get user's teams
    const teams = await Team.getUserTeams(decoded.userId);

    return NextResponse.json({ teams });

  } catch (error: any) {
    console.error('Get teams error:', error);
    
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

// POST /api/teams - Create a new team
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

    // Only admins can create teams
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create teams' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, goals, settings } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }

    // Check if team name already exists
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return NextResponse.json(
        { error: 'Team name already exists' },
        { status: 409 }
      );
    }

    // Create new team
    const team = new Team({
      name,
      description: description || '',
      members: [decoded.userId],
      admins: [decoded.userId],
      goals: goals || {
        dailyTarget: 15,
        weeklyTarget: 90,
        monthlyTarget: 360
      },
      settings: settings || {
        allowMemberInvites: true,
        requireApproval: false,
        visibility: 'private'
      }
    });

    await team.save();

    // Populate team with member details
    const populatedTeam = await Team.getTeamWithMembers(team._id.toString());

    return NextResponse.json({
      message: 'Team created successfully',
      team: populatedTeam
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create team error:', error);
    
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
