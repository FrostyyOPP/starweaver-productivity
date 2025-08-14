import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import Team from '@/lib/models/Team';
import User from '@/lib/models/User';

// DELETE: Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: memberId } = await params;
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Check if user has permission to remove team members
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && user.role !== 'manager') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Find team where current user is admin or member
    const team = await Team.findOne({
      $or: [
        { admin: decoded.userId },
        { members: decoded.userId }
      ]
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user is trying to remove themselves
    if (memberId === decoded.userId) {
      return NextResponse.json({ error: 'Cannot remove yourself from the team' }, { status: 400 });
    }

    // Check if the member to be removed exists in the team
    if (!team.members.includes(memberId)) {
      return NextResponse.json({ error: 'Member not found in team' }, { status: 404 });
    }

    // Remove member from team
    team.members = team.members.filter((id: any) => id.toString() !== memberId);
    await team.save();

    return NextResponse.json({ 
      message: 'Team member removed successfully' 
    });
  } catch (error: any) {
    console.error('Remove team member error:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}
