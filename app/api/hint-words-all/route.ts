import { NextRequest, NextResponse } from 'next/server';
import { fetchAllHintWords, fetchHintWordsCount } from '@/app/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') as 'count' | 'latest' || 'count';
    const page = parseInt(searchParams.get('page') || '1');
    const itemsPerPage = parseInt(searchParams.get('itemsPerPage') || '15');
    const query = searchParams.get('query') || '';

    // 验证参数
    if (sortBy !== 'count' && sortBy !== 'latest') {
      return NextResponse.json({ error: 'Invalid sortBy parameter' }, { status: 400 });
    }

    if (page < 1 || itemsPerPage < 1 || itemsPerPage > 50) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    // 获取总数和分页数据
    const [hintWords, totalCount] = await Promise.all([
      fetchAllHintWords(sortBy, page, itemsPerPage, query),
      fetchHintWordsCount(query)
    ]);

    // 计算分页信息
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // 转换数据格式以匹配前端期望的格式
    const formattedData = hintWords.map((hintWord: any) => ({
      id: hintWord.word_id,
      word: hintWord.word,
      hint_count: hintWord.hint_count,
      image_url: hintWord.image_url,
      last_hint_at: hintWord.last_hint_at,
    }));

    return NextResponse.json({
      data: formattedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage,
        hasNextPage,
        hasPreviousPage,
      }
    });

  } catch (error) {
    console.error('Error fetching all hint words:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch hint words' 
    }, { status: 500 });
  }
}