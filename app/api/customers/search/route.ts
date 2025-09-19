import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

// 使用本地数据库连接
const sql = postgres(process.env.POSTGRES_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    if (!query) {
      return NextResponse.json([]);
    }

    // 直接使用SQL查询，只匹配name和chinese_translation字段
    const searchTerm = `%${query}%`;
    const results = await sql`
      SELECT * FROM customers 
      WHERE name ILIKE ${searchTerm} 
      OR chinese_translation ILIKE ${searchTerm}
      ORDER BY name ASC
      LIMIT 100
    `;

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching search results:', error);
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
  }
}