import { NextRequest, NextResponse } from 'next/server';
import { fetchAllErrorWords } from '@/app/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') as 'count' | 'latest' || 'count';
    
    const errorWords = await fetchAllErrorWords(sortBy);
    
    return NextResponse.json(errorWords);
  } catch (error) {
    console.error('Error fetching all error words:', error);
    return NextResponse.json(
      { error: 'Failed to fetch all error words' },
      { status: 500 }
    );
  }
}