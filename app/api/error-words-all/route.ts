import { NextRequest, NextResponse } from 'next/server';
import { fetchAllErrorWords, fetchErrorWordsCount } from '@/app/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') as 'count' | 'latest' || 'count';
    const page = parseInt(searchParams.get('page') || '1');
    const itemsPerPage = parseInt(searchParams.get('itemsPerPage') || '15');
    
    // 获取错误单词数据和总数
    const [errorWords, totalCount] = await Promise.all([
      fetchAllErrorWords(sortBy, page, itemsPerPage),
      fetchErrorWordsCount()
    ]);
    
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    
    return NextResponse.json({
      data: errorWords,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching all error words:', error);
    return NextResponse.json(
      { error: 'Failed to fetch all error words' },
      { status: 500 }
    );
  }
}