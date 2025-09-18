import { NextRequest, NextResponse } from 'next/server';
import { fetchFrequentHintWords } from '@/app/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') as 'count' | 'latest' || 'count';

    // 验证sortBy参数
    if (sortBy !== 'count' && sortBy !== 'latest') {
      return NextResponse.json({ error: 'Invalid sortBy parameter' }, { status: 400 });
    }

    const hintWords = await fetchFrequentHintWords(sortBy);

    // 转换数据格式以匹配前端期望的格式（与错误单词保持一致）
    const formattedData = hintWords.map((hintWord: any) => ({
      id: hintWord.word_id,
      name: hintWord.word,
      email: `提示次数: ${hintWord.hint_count}`,
      image_url: hintWord.image_url,
      amount: hintWord.hint_count,
      last_hint_at: hintWord.last_hint_at,
    }));

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error('Error fetching hint stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch hint statistics' 
    }, { status: 500 });
  }
}