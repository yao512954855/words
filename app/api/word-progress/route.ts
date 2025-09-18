import { NextRequest, NextResponse } from 'next/server';
import { fetchMonthlyWordProgress, fetchWeeklyWordProgress } from '@/app/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';

    let data;
    
    switch (period) {
      case 'monthly':
        data = await fetchMonthlyWordProgress();
        break;
      case 'weekly':
        data = await fetchWeeklyWordProgress();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid period parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch word progress data' },
      { status: 500 }
    );
  }
}