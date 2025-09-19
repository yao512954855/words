import { Customer } from '@/app/lib/definitions';
import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';

  try {
    if (!query) {
      return NextResponse.json([]);
    }

    // 直接使用SQL查询
    const data = await sql`
      SELECT *
      FROM customers
      WHERE 
        name ILIKE ${`%${query}%`} OR 
        chinese_translation ILIKE ${`%${query}%`}
      ORDER BY name ASC
      LIMIT 100
    `;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
  }
}