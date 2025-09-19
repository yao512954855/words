import { NextResponse } from 'next/server';
import postgres from 'postgres';

// 创建数据库连接
const sql = postgres(process.env.POSTGRES_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version');
  const grade = searchParams.get('grade');
  const theclass = searchParams.get('theclass');

  try {
    // 如果任何一个条件是"全部"，则返回空数组
    if (!version || version === 'all' || !grade || grade === 'all' || !theclass || theclass === 'all') {
      return NextResponse.json([]);
    }

    // 查询数据库中实际存在的单元
    const result = await sql`
      SELECT DISTINCT theunit
      FROM customers
      WHERE version = ${version}
      AND grade = ${grade}
      AND theclass = ${theclass}
      ORDER BY theunit
    `;
    
    const units = result.map(row => row.theunit).filter(Boolean);
    
    return NextResponse.json(units);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch available units.' }, { status: 500 });
  }
}