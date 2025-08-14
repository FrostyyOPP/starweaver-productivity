import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Entry from '@/lib/models/Entry';
import { verifyToken } from '@/lib/jwt';

// POST /api/migrate - Migrate legacy entries to restore data
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

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required for migration' },
        { status: 403 }
      );
    }

    console.log('🚀 Starting data migration...');

    // Run the migration
    const migratedCount = await Entry.migrateLegacyEntries();

    console.log(`✅ Migration completed. ${migratedCount} entries migrated.`);

    return NextResponse.json({
      message: 'Data migration completed successfully',
      migratedEntries: migratedCount,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('Migration error:', error);
    
    if (error instanceof Error && error.message === 'Invalid or expired token') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Migration failed', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET /api/migrate - Check migration status
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

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Count total entries
    const totalEntries = await Entry.countDocuments();
    
    // Count legacy entries (entries with old fields)
    const legacyEntries = await Entry.countDocuments({
      $or: [
        { shiftStart: { $exists: true } },
        { shiftEnd: { $exists: true } },
        { totalHours: { $exists: true } }
      ]
    });

    // Count current entries (entries with new structure)
    const currentEntries = await Entry.countDocuments({
      videosCompleted: { $exists: true },
      productivityScore: { $exists: true }
    });

    return NextResponse.json({
      status: 'Migration status check completed',
      totalEntries,
      legacyEntries,
      currentEntries,
      needsMigration: legacyEntries > 0,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('Migration status check error:', error);
    
    if (error instanceof Error && error.message === 'Invalid or expired token') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Status check failed', details: errorMessage },
      { status: 500 }
    );
  }
}
