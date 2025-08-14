import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Entry from '@/lib/models/Entry';
import { verifyToken } from '@/lib/jwt';

// GET /api/export - Export user's productivity data
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
    const format = searchParams.get('format') || 'json'; // json, csv, excel
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeAnalytics = searchParams.get('includeAnalytics') === 'true';

    // Build query
    const query: any = { userId: decoded.userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get entries
    const entries = await Entry.find(query)
      .sort({ date: 1 })
      .lean();

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'No data found for the specified date range' },
        { status: 404 }
      );
    }

    // Prepare data for export
    const exportData: any = {
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      },
      exportInfo: {
        generatedAt: new Date().toISOString(),
        dateRange: startDate && endDate ? { startDate, endDate } : 'All time',
        totalEntries: entries.length,
        format
      },
      entries: entries.map(entry => {
        const entryData = {
          date: entry.date,
          videosCompleted: entry.videosCompleted,
          productivityScore: entry.productivityScore,
          mood: entry.mood,
          energyLevel: entry.energyLevel,
          challenges: entry.challenges,
          achievements: entry.achievements,
          notes: entry.notes
        };
        return entryData;
      })
    };

    // Add analytics if requested
    if (includeAnalytics) {
      const totalVideos = entries.reduce((sum, entry) => sum + entry.videosCompleted, 0);
      const averageProductivity = entries.length > 0 
        ? Math.round(entries.reduce((sum, entry) => sum + entry.productivityScore, 0) / entries.length)
        : 0;

      exportData.analytics = {
        summary: {
          totalVideos,
          averageProductivity,
          averageVideosPerDay: Math.round(totalVideos / entries.length * 100) / 100,
        },
        trends: {
          bestDay: entries.reduce((best, entry) => 
            entry.productivityScore > best.productivityScore ? entry : best
          ).date,
          worstDay: entries.reduce((worst, entry) => 
            entry.productivityScore < worst.productivityScore ? entry : worst
          ).date,
          mostProductiveHour: await getMostProductiveHour(entries),
          consistencyScore: Math.round(entries.filter(entry => entry.productivityScore >= 80).length / entries.length * 100)
        }
      };
    }

    // Return data based on format
    switch (format.toLowerCase()) {
      case 'csv':
        return generateCSV(exportData);
      case 'excel':
        return generateExcel(exportData);
      case 'json':
      default:
        return NextResponse.json(exportData);
    }

  } catch (error: any) {
    console.error('Export error:', error);
    
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

// Helper function to get most productive hour
async function getMostProductiveHour(entries: any[]): Promise<number> {
  const hourPerformance: { [key: number]: number } = {};
  
  entries.forEach(entry => {
    const hour = new Date(entry.shiftStart).getHours();
    hourPerformance[hour] = (hourPerformance[hour] || 0) + entry.productivityScore;
  });

  if (Object.keys(hourPerformance).length === 0) return 9;

  const peakHour = Object.entries(hourPerformance).reduce((a, b) => 
    hourPerformance[Number(a[0])] > hourPerformance[Number(b[0])] ? a : b
  )[0];
  
  return Number(peakHour);
}

// Generate CSV format
function generateCSV(data: any): NextResponse {
  const csvHeaders = [
    'Date',
    'Videos Completed',
    'Productivity Score',
    'Mood',
    'Energy Level',
    'Challenges',
    'Achievements',
    'Notes'
  ];

  const csvRows = data.entries.map((entry: any) => [
    new Date(entry.date).toLocaleDateString(),
    entry.videosCompleted,
    entry.productivityScore,
    entry.mood,
    entry.energyLevel,
    `"${entry.challenges.join('; ')}"`,
    `"${entry.achievements.join('; ')}"`,
    `"${entry.notes}"`
  ]);

  const csvContent = [csvHeaders, ...csvRows]
    .map(row => row.join(','))
    .join('\n');

  const response = new NextResponse(csvContent);
  response.headers.set('Content-Type', 'text/csv');
  response.headers.set('Content-Disposition', `attachment; filename="productivity-export-${new Date().toISOString().split('T')[0]}.csv"`);
  
  return response;
}

// Generate Excel format (simplified - returns CSV with .xlsx extension)
function generateExcel(data: any): NextResponse {
  const csvHeaders = [
    'Date',
    'Videos Completed',
    'Productivity Score',
    'Mood',
    'Energy Level',
    'Challenges',
    'Achievements',
    'Notes'
  ];

  const csvRows = data.entries.map((entry: any) => [
    new Date(entry.date).toLocaleDateString(),
    entry.videosCompleted,
    entry.productivityScore,
    entry.mood,
    entry.energyLevel,
    entry.challenges.join('; '),
    entry.achievements.join('; '),
    entry.notes
  ]);

  const csvContent = [csvHeaders, ...csvRows]
    .map(row => row.join('\t'))
    .join('\n');

  const response = new NextResponse(csvContent);
  response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  response.headers.set('Content-Disposition', `attachment; filename="productivity-export-${new Date().toISOString().split('T')[0]}.xlsx"`);
  
  return response;
}
