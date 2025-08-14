import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { users } = body;

    // Validate required data
    if (!users || !Array.isArray(users)) {
      return NextResponse.json(
        { error: 'Missing or invalid users array' },
        { status: 400 }
      );
    }

    const results = {
      usersCreated: 0,
      errors: [] as string[]
    };

    // Create Users
    for (const user of users) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: user.email });
        if (existingUser) {
          results.errors.push(`User with email ${user.email} already exists`);
          continue;
        }

        // Create user with plain password (will be hashed by pre-save hook)
        await User.create({
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
          isActive: true
        });

        results.usersCreated++;
      } catch (error) {
        results.errors.push(`Failed to create user ${user.email}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `User import completed successfully!`,
      results
    });

  } catch (error) {
    console.error('User import error:', error);
    return NextResponse.json(
      { error: 'Internal server error during user import' },
      { status: 500 }
    );
  }
}
