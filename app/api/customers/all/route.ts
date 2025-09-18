import { NextRequest, NextResponse } from 'next/server';
import { fetchFilteredCustomers } from '@/app/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const version = searchParams.get('version') || '';
    const grade = searchParams.get('grade') || '';
    const theclass = searchParams.get('theclass') || '';
    const theunit = searchParams.get('theunit') || '';
    const ok = searchParams.get('ok') || '';

    const filters = {
      version: version || undefined,
      grade: grade || undefined,
      theclass: theclass || undefined,
      theunit: theunit || undefined,
      ok: ok || undefined,
    };

    const allWords = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const pageWords = await fetchFilteredCustomers(query, page, filters);
      if (pageWords && pageWords.length > 0) {
        allWords.push(...pageWords);
        page++;
        // 如果返回的单词数量少于每页数量，说明已经是最后一页
        if (pageWords.length < 6) { // ITEMS_PER_PAGE2 = 6
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    return NextResponse.json(allWords);
  } catch (error) {
    console.error('Error fetching all customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}