import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import Team from '@/lib/models/Team';
import User from '@/lib/models/User';

// GET: Fetch user's teams
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Get user's teams
    const teams = await Team.find({ 
      $or: [
        { admin: decoded.userId },
        { members: decoded.userId }
      ]
    }).populate('members', 'name email role isActive lastLogin');

    // For now, return a single team with the current user and any team members
    // In a real app, you might have multiple teams
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create a default team structure for the user
    const teamData = {
      members: [
        {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        }
      ]
    };

    return NextResponse.json(teamData);
  } catch (error: any) {
    console.error('Get teams error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

// POST: Add team member by email
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Check if user has permission to add team members
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && user.role !== 'manager') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if the user to be added exists
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return NextResponse.json({ error: 'User with this email does not exist' }, { status: 404 });
    }

    // Check if user is already in the team
    const existingTeam = await Team.findOne({
      $or: [
        { admin: decoded.userId },
        { members: decoded.userId }
      ],
      members: userToAdd._id
    });

    if (existingTeam) {
      return NextResponse.json({ error: 'User is already in your team' }, { status: 409 });
    }

    // Add user to team (for now, we'll create a simple team structure)
    // In a real app, you might have more complex team management
    let team = await Team.findOne({
      $or: [
        { admin: decoded.userId },
        { members: decoded.userId }
      ]
    });

    if (!team) {
      // Create new team if none exists
      team = new Team({
        name: `${user.name}'s Team`,
        admin: decoded.userId,
        members: [decoded.userId, userToAdd._id]
      });
    } else {
      // Add member to existing team
      if (!team.members.includes(userToAdd._id)) {
        team.members.push(userToAdd._id);
      }
    }

    await team.save();

    return NextResponse.json({ 
      message: 'Team member added successfully',
      team: team
    });
  } catch (error: any) {
    console.error('Add team member error:', error);
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}
