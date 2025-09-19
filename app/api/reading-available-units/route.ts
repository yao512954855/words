import { NextResponse } from 'next/server';
import postgres from 'postgres';

// 创建数据库连接
const sql = postgres(process.env.POSTGRES_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version');
  const grade = searchParams.get('grade');
  const theclass = searchParams.get('theclass');

  if (!version || !grade || !theclass) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    // 查询满足条件的单元（从customers表获取，因为没有readings表）
    const result = await sql`
      SELECT DISTINCT theunit
      FROM customers
      WHERE version = ${version}
      AND grade = ${grade}
      AND theclass = ${theclass}
      ORDER BY theunit
    `;

    const units = result.map(row => row.theunit);
    return NextResponse.json(units);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available units.' },
      { status: 500 }
    );
  }
}